/**
 * Azalea Estates — Form submission handler
 *
 * Receives all site form POSTs, sends to ActiveDemand via REST API,
 * then redirects the user to the appropriate thank-you page.
 *
 * Environment variable required:
 *   ACTIVEDEMAND_API_KEY — REST API key from ActiveDemand → Settings → API Keys
 *
 * Form routing (form-name → thanks page):
 *   schedule-tour          → /schedule-a-tour/thanks/
 *   contact                → /contact/thanks/
 *   floor-plan-inquiry     → /floor-plans/?submitted=true (modal form, no dedicated page)
 *   event-rsvp-*           → /events/rsvp-thanks/
 *   job-application        → /careers/thanks/
 */

// Node 22 has native fetch — no import needed

const AD_API_BASE = "https://api.activedemand.com";
const AD_API_KEY  = process.env.ACTIVEDEMAND_API_KEY;

// ── Thank-you page routing ────────────────────────────────────────────────────
const THANKS_PAGES = {
  "schedule-tour":      "/schedule-a-tour/thanks/",
  "contact":            "/contact/thanks/",
  "floor-plan-inquiry": "/floor-plans/?submitted=true",
  "job-application":    "/careers/thanks/",
};

function getThanksPage(formName) {
  if (formName.startsWith("event-rsvp-")) return "/events/rsvp-thanks/";
  return THANKS_PAGES[formName] || "/";
}

// ── Parse URL-encoded form body ───────────────────────────────────────────────
function parseBody(body) {
  const params = new URLSearchParams(body);
  const out = {};
  for (const [k, v] of params.entries()) {
    // Collect multi-value fields (e.g. checkboxes) into arrays
    if (out[k]) {
      out[k] = [].concat(out[k], v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

// ── Build ActiveDemand contact payload ────────────────────────────────────────
// ActiveDemand REST API v1 — contact fields at top level, custom fields as array.
// Ref: https://developer.activedemand.com/api/rest/v1/contacts
function buildAdPayload(fields, formName) {
  const custom = [];

  function addCustom(name, value) {
    if (value !== undefined && value !== null && value !== "") {
      custom.push({ name, value: String(value) });
    }
  }

  // UTM / attribution
  addCustom("UTM Source",    fields.cf_utm_source);
  addCustom("UTM Medium",    fields.cf_utm_medium);
  addCustom("UTM Campaign",  fields.cf_utm_campaign);
  addCustom("UTM Content",   fields.cf_utm_content);
  addCustom("UTM Term",      fields.cf_utm_term);
  addCustom("Landing Page",  fields.cf_landing_page);
  addCustom("Referrer",      fields.cf_referrer);
  addCustom("Form Page",     fields.cf_form_page);
  addCustom("Form Name",     formName);

  if (formName === "schedule-tour") {
    addCustom("Tour Relation",      fields.relation);
    addCustom("Care Interest",      fields.interest);
    addCustom("Preferred Days",     [].concat(fields.days || []).join(", "));
    addCustom("Preferred Time",     fields.time_pref);
    addCustom("Guests Attending",   fields.guests);
    addCustom("Tour Notes",         fields.notes);
  }

  if (formName === "contact") {
    addCustom("Contact Relation",   fields.relation);
    addCustom("Care Interest",      fields.interest);
    addCustom("Message",            fields.message);
  }

  if (formName === "floor-plan-inquiry") {
    addCustom("Floor Plan Name",    fields["plan-name"]);
    addCustom("Floor Plan Type",    fields["plan-type"]);
    addCustom("Floor Plan Specs",   fields["plan-specs"]);
    addCustom("Move-in Timeframe",  fields.timeframe);
    addCustom("Message",            fields.message);
  }

  if (formName.startsWith("event-rsvp-")) {
    addCustom("Event Name",         fields.event_title);
    addCustom("Event Date",         fields.event_date);
    addCustom("Event Time",         fields.event_time);
    addCustom("Event Location",     fields.event_location);
    addCustom("Guest Count",        fields.guest_count);
    addCustom("Guest 1",            [fields.guest_1_first, fields.guest_1_last].filter(Boolean).join(" "));
    addCustom("Guest 2",            [fields.guest_2_first, fields.guest_2_last].filter(Boolean).join(" "));
    addCustom("Additional Guests",  fields.guest_additional);
    addCustom("Dietary Needs",      fields.dietary);
    addCustom("Accessibility",      [].concat(fields.accessibility || []).join(", "));
    addCustom("How They Heard",     fields.source);
  }

  if (formName === "job-application") {
    addCustom("Position Applied",   fields.position);
    addCustom("Experience",         fields.experience);
    addCustom("Availability",       fields.availability);
  }

  // ActiveDemand REST API — top-level contact fields
  const payload = {
    first_name:    fields.first_name    || "",
    last_name:     fields.last_name     || "",
    email_address: fields.email         || "",   // AD uses email_address, not email
    phone:         fields.phone         || "",
  };

  if (custom.length) payload.custom_fields = custom;

  return payload;
}

// ── Main handler ──────────────────────────────────────────────────────────────
exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const fields   = parseBody(event.body);
  const formName = fields["form-name"] || "unknown";

  // Log received fields (redact nothing — server-side only, no PII exposure risk)
  console.log("[submit-form] form-name:", formName);
  console.log("[submit-form] fields received:", Object.keys(fields).join(", "));

  // Honeypot — bail silently if filled (bot)
  if (fields["bot-field"]) {
    return {
      statusCode: 302,
      headers: { Location: getThanksPage(formName) },
      body: "",
    };
  }

  const errors = [];

  // ── Send to ActiveDemand ───────────────────────────────────────────────────
  if (!AD_API_KEY) {
    errors.push("ACTIVEDEMAND_API_KEY environment variable is not set");
  } else {
    try {
      const payload = buildAdPayload(fields, formName);
      console.log("[submit-form] AD payload:", JSON.stringify(payload));

      const res = await fetch(`${AD_API_BASE}/v1/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key":    AD_API_KEY,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();
      console.log("[submit-form] AD response status:", res.status);
      console.log("[submit-form] AD response body:", responseText);

      if (!res.ok) {
        errors.push(`ActiveDemand API error ${res.status}: ${responseText}`);
      }
    } catch (e) {
      errors.push(`ActiveDemand fetch failed: ${e.message}`);
    }
  }

  if (errors.length) {
    console.error("[submit-form] Errors:", errors);
  }

  // ── Redirect to thank-you page ────────────────────────────────────────────
  return {
    statusCode: 302,
    headers: { Location: getThanksPage(formName) },
    body: "",
  };
};
