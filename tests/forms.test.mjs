/**
 * Build-time form integrity tests
 * ─────────────────────────────────────────────────────────────────────────────
 * Parses the built HTML in _site/ and asserts that each Netlify form is:
 *   - Present in the expected page
 *   - Registered with data-netlify="true" (or netlify attribute on stub)
 *   - Has a honeypot field (bot-field)
 *   - Contains every required field by name
 *   - Attribution hidden fields are present
 *   - Submits to the correct action URL
 *
 * Run:  npm test
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "node-html-parser";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, "..");

function load(relPath) {
  const full = resolve(ROOT, "_site", relPath);
  try {
    return parse(readFileSync(full, "utf8"));
  } catch {
    throw new Error(`Built file not found: ${full}\nRun 'npm run build' first.`);
  }
}

/** Return the <form> element with a matching name attribute */
function getForm(doc, name) {
  return doc.querySelector(`form[name="${name}"]`);
}

/** Assert a form contains an input/select/textarea with each listed name */
function assertFields(form, fields, formLabel) {
  fields.forEach((name) => {
    const el = form.querySelector(
      `[name="${name}"], input[name="${name}"], select[name="${name}"], textarea[name="${name}"]`
    );
    assert.ok(el, `${formLabel}: missing field name="${name}"`);
  });
}

/** Attribution hidden fields injected by JS — must be present as hidden inputs in the HTML */
const ATTRIBUTION_FIELDS = [
  "cf_utm_source",
  "cf_utm_medium",
  "cf_utm_campaign",
  "cf_utm_content",
  "cf_utm_term",
  "cf_landing_page",
  "cf_referrer",
  "cf_form_page",
];

// ─────────────────────────────────────────────────────────────────────────────

describe("Netlify form stub (forms.html)", () => {
  const doc = load("forms.html");

  test("contact stub exists with netlify attribute", () => {
    const form = getForm(doc, "contact");
    assert.ok(form, "contact form stub missing");
    assert.ok(
      form.getAttribute("netlify") !== null || form.getAttribute("data-netlify") === "true",
      "contact stub missing netlify attribute"
    );
  });

  test("contact stub has required fields", () => {
    const form = getForm(doc, "contact");
    assertFields(
      form,
      ["first_name", "last_name", "email", "phone", "relation", "interest", "message", "consent"],
      "contact stub"
    );
  });

  test("contact stub has attribution fields", () => {
    const form = getForm(doc, "contact");
    assertFields(form, ATTRIBUTION_FIELDS, "contact stub");
  });

  test("contact stub has honeypot", () => {
    const form = getForm(doc, "contact");
    assert.ok(form.querySelector('[name="bot-field"]'), "contact stub missing bot-field honeypot");
  });

  test("floor-plan-inquiry stub exists with netlify attribute", () => {
    const form = getForm(doc, "floor-plan-inquiry");
    assert.ok(form, "floor-plan-inquiry form stub missing");
    assert.ok(
      form.getAttribute("netlify") !== null || form.getAttribute("data-netlify") === "true",
      "floor-plan-inquiry stub missing netlify attribute"
    );
  });

  test("floor-plan-inquiry stub has required fields", () => {
    const form = getForm(doc, "floor-plan-inquiry");
    assertFields(
      form,
      ["plan-name", "plan-type", "plan-specs", "first_name", "last_name", "email", "phone", "timeframe", "message"],
      "floor-plan-inquiry stub"
    );
  });

  test("floor-plan-inquiry stub has attribution fields", () => {
    const form = getForm(doc, "floor-plan-inquiry");
    assertFields(form, ATTRIBUTION_FIELDS, "floor-plan-inquiry stub");
  });

  test("floor-plan-inquiry stub has honeypot", () => {
    const form = getForm(doc, "floor-plan-inquiry");
    assert.ok(form.querySelector('[name="bot-field"]'), "floor-plan-inquiry stub missing bot-field honeypot");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Contact page (/contact/)", () => {
  const doc = load("contact/index.html");

  test("contact form exists", () => {
    assert.ok(getForm(doc, "contact"), "contact form not found on /contact/");
  });

  test("contact form has data-netlify", () => {
    const form = getForm(doc, "contact");
    assert.equal(form.getAttribute("data-netlify"), "true", "contact form missing data-netlify");
  });

  test("contact form submits to serverless function", () => {
    const form = getForm(doc, "contact");
    assert.equal(form.getAttribute("action"), "/.netlify/functions/submit-form", "contact form wrong action URL");
  });

  test("contact form has required fields", () => {
    const form = getForm(doc, "contact");
    assertFields(
      form,
      ["first_name", "last_name", "email", "phone", "relation", "interest", "message", "consent", "form-name"],
      "contact form"
    );
  });

  test("contact form has attribution fields", () => {
    const form = getForm(doc, "contact");
    assertFields(form, ATTRIBUTION_FIELDS, "contact form");
  });

  test("contact form has honeypot", () => {
    const form = getForm(doc, "contact");
    assert.ok(form.querySelector('[name="bot-field"]'), "contact form missing bot-field honeypot");
  });

  test("contact form consent is required", () => {
    const form   = getForm(doc, "contact");
    const consent = form.querySelector('[name="consent"]');
    assert.ok(consent, "contact form missing consent field");
    assert.ok(
      consent.getAttribute("required") !== null,
      "contact form consent field is not required"
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Schedule a Tour page (/schedule-a-tour/)", () => {
  const doc = load("schedule-a-tour/index.html");

  test("schedule-tour form exists", () => {
    assert.ok(getForm(doc, "schedule-tour"), "schedule-tour form not found");
  });

  test("schedule-tour form has data-netlify", () => {
    const form = getForm(doc, "schedule-tour");
    assert.equal(form.getAttribute("data-netlify"), "true", "schedule-tour missing data-netlify");
  });

  test("schedule-tour form submits to serverless function", () => {
    const form = getForm(doc, "schedule-tour");
    assert.equal(
      form.getAttribute("action"),
      "/.netlify/functions/submit-form",
      "schedule-tour wrong action URL"
    );
  });

  test("schedule-tour form has required fields", () => {
    const form = getForm(doc, "schedule-tour");
    assertFields(
      form,
      ["first_name", "last_name", "phone", "email", "relation", "interest",
       "days", "time_pref", "guests", "notes", "consent", "form-name"],
      "schedule-tour form"
    );
  });

  test("schedule-tour form has attribution fields", () => {
    const form = getForm(doc, "schedule-tour");
    assertFields(form, ATTRIBUTION_FIELDS, "schedule-tour form");
  });

  test("schedule-tour form has honeypot", () => {
    const form = getForm(doc, "schedule-tour");
    assert.ok(form.querySelector('[name="bot-field"]'), "schedule-tour missing bot-field honeypot");
  });

  test("schedule-tour required fields are marked required", () => {
    const form   = getForm(doc, "schedule-tour");
    const required = ["first_name", "last_name", "phone"];
    required.forEach((name) => {
      const el = form.querySelector(`[name="${name}"]`);
      assert.ok(el && el.getAttribute("required") !== null, `schedule-tour: ${name} should be required`);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Floor Plans page — inquiry modal (/floor-plans/)", () => {
  const doc = load("floor-plans/index.html");

  test("floor-plan-inquiry form exists in modal", () => {
    assert.ok(getForm(doc, "floor-plan-inquiry"), "floor-plan-inquiry form not found on /floor-plans/");
  });

  test("floor-plan-inquiry form has data-netlify", () => {
    const form = getForm(doc, "floor-plan-inquiry");
    assert.equal(form.getAttribute("data-netlify"), "true", "floor-plan-inquiry missing data-netlify");
  });

  test("floor-plan-inquiry form has required fields", () => {
    const form = getForm(doc, "floor-plan-inquiry");
    assertFields(
      form,
      ["plan-name", "plan-type", "plan-specs", "first_name", "last_name",
       "email", "phone", "timeframe", "message", "form-name"],
      "floor-plan-inquiry form"
    );
  });

  test("floor-plan-inquiry form has attribution fields", () => {
    const form = getForm(doc, "floor-plan-inquiry");
    assertFields(form, ATTRIBUTION_FIELDS, "floor-plan-inquiry form");
  });

  test("floor-plan-inquiry form has honeypot", () => {
    const form = getForm(doc, "floor-plan-inquiry");
    assert.ok(
      form.querySelector('[name="bot-field"]'),
      "floor-plan-inquiry missing bot-field honeypot"
    );
  });

  test("plan-name, plan-type, plan-specs are hidden inputs", () => {
    const form = getForm(doc, "floor-plan-inquiry");
    ["plan-name", "plan-type", "plan-specs"].forEach((name) => {
      const el = form.querySelector(`input[name="${name}"]`);
      assert.ok(el, `floor-plan-inquiry: ${name} input missing`);
      assert.equal(el.getAttribute("type"), "hidden", `${name} should be type="hidden"`);
    });
  });
});
