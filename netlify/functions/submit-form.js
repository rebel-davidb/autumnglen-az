/**
 * Azalea Estates — Form submission handler
 *
 * Receives all site form POSTs, does two things in parallel:
 *   1. Forwards the submission to ActiveDemand as a contact via their REST API
 *   2. Re-posts to Netlify Forms so email notifications keep working
 *
 * Then redirects the user to the appropriate thank-you page.
 *
 * Environment variable required:
 *   ACTIVEDEMAND_API_KEY — account-level API key from ActiveDemand settings
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
// Maps site form fields → ActiveDemand contact + custom fields.
// Custom fields use the name-based format so no field IDs are needed.
function buildAdPayload(fields, formName) {
  const custom = [];

  function addCustom(name, value) {
    if (value) custom.push({ name, value: String(value) });
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

  // Form-specific custom fields
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
    addCustom("Event Title",        fields.event_title);
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

  const contact = {
    first_name: fields.first_name || "",
    last_name:  fields.last_name  || "",
    email:      fields.email      || "",
    phone:      fields.phone      || "",
  };

  if (custom.length) contact.custom_fields = custom;

  return { contact };
}

// ── Re-post to Netlify Forms (fire-and-forget) ────────────────────────────────
// Keeps email notifications working during the transition period.
async function forwardToNetlify(rawBody, headers) {
  try {
    await fetch("https://azaleaestatesfayetteville.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: rawBody,
    });
  } catch (e) {
    // Non-fatal — AD is the source of truth
    console.warn("Netlify Forms forward failed:", e.message);
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const fields   = parseBody(event.body);
  const formName = fields["form-name"] || "unknown";

  // Honeypot — bail silently if filled (bot)
  if (fields["bot-field"]) {
    return {
      statusCode: 302,
      headers: { Location: getThanksPage(formName) },
      body: "",
    };
  }

  const errors = [];

  // ── 1. Send to ActiveDemand ────────────────────────────────────────────────
  if (!AD_API_KEY) {
    errors.push("ACTIVEDEMAND_API_KEY environment variable is not set");
  } else {
    try {
      const payload = buildAdPayload(fields, formName);
      const res = await fetch(`${AD_API_BASE}/v1/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": AD_API_KEY,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        errors.push(`ActiveDemand API error ${res.status}: ${text}`);
      }
    } catch (e) {
      errors.push(`ActiveDemand fetch failed: ${e.message}`);
    }
  }

  // Log errors server-side but don't fail the user experience
  if (errors.length) {
    console.error("[submit-form] Errors:", errors);
  }

  // ── 2. Redirect to thank-you page ─────────────────────────────────────────
  return {
    statusCode: 302,
    headers: { Location: getThanksPage(formName) },
    body: "",
  };
};
