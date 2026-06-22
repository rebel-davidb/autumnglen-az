/**
 * Build-time form integrity tests
 * ─────────────────────────────────────────────────────────────────────────────
 * All public-facing forms are ActiveDEMAND embeds, rendered at runtime by the
 * ActiveDEMAND tracking script (loaded in base.njk). The embeds appear in the
 * built HTML as placeholder divs:
 *
 *     <div class="activedemand-replace" data-type="Form" data-id="<id>"></div>
 *
 * These tests assert that:
 *   - Each page contains the expected ActiveDEMAND embed (correct data-id)
 *   - The dynamic-context wrappers carry the data-* attributes that main.js
 *     copies into the embedded form's hidden fields (plan + event context)
 *
 * Form IDs:
 *   Contact Us      314128  (/contact/)
 *   Schedule a Tour 314131  (/schedule-a-tour/)
 *   Floor Plan      314873  (/floor-plans/ inquiry modal)
 *   RSVP            314798  (/events/<slug>/)
 *
 * Run:  npm test
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { parse } from "node-html-parser";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, "..");
const require   = createRequire(import.meta.url);

// Source of truth for which event pages Eleventy generates. Reading the data
// file (rather than scanning _site/events/) avoids picking up stale build
// directories left over from removed events.
const EVENTS = require(resolve(ROOT, "src/_data/events.js"));

function load(relPath) {
  const full = resolve(ROOT, "_site", relPath);
  try {
    return parse(readFileSync(full, "utf8"));
  } catch {
    throw new Error(`Built file not found: ${full}\nRun 'npm run build' first.`);
  }
}

/** Return the ActiveDEMAND embed placeholder with a matching data-id. */
function getEmbed(doc, id) {
  return doc.querySelector(`.activedemand-replace[data-id="${id}"]`);
}

// ─────────────────────────────────────────────────────────────────────────────

describe("Contact page (/contact/) — ActiveDEMAND embed", () => {
  const doc = load("contact/index.html");

  test("contact embed (314128) is present", () => {
    const embed = getEmbed(doc, "314128");
    assert.ok(embed, "contact ActiveDEMAND embed (314128) not found on /contact/");
  });

  test("contact embed declares data-type=Form", () => {
    const embed = getEmbed(doc, "314128");
    assert.equal(embed.getAttribute("data-type"), "Form", "contact embed missing data-type=Form");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Schedule a Tour page (/schedule-a-tour/) — ActiveDEMAND embed", () => {
  const doc = load("schedule-a-tour/index.html");

  test("schedule-tour embed (314131) is present", () => {
    const embed = getEmbed(doc, "314131");
    assert.ok(embed, "schedule-tour ActiveDEMAND embed (314131) not found");
  });

  test("schedule-tour embed declares data-type=Form", () => {
    const embed = getEmbed(doc, "314131");
    assert.equal(embed.getAttribute("data-type"), "Form", "schedule-tour embed missing data-type=Form");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Floor Plans page — inquiry modal (/floor-plans/) — ActiveDEMAND embed", () => {
  const doc = load("floor-plans/index.html");

  test("floor-plan embed (314873) is present", () => {
    const embed = getEmbed(doc, "314873");
    assert.ok(embed, "floor-plan ActiveDEMAND embed (314873) not found on /floor-plans/");
  });

  test("floor-plan embed declares data-type=Form", () => {
    const embed = getEmbed(doc, "314873");
    assert.equal(embed.getAttribute("data-type"), "Form", "floor-plan embed missing data-type=Form");
  });

  test("floor-plan embed lives inside the inquiry modal", () => {
    const modal = doc.querySelector("#planModal");
    assert.ok(modal, "planModal not found");
    assert.ok(getEmbed(modal, "314873"), "floor-plan embed not inside #planModal");
  });

  test("plan-context wrapper carries the data-* attrs main.js copies into hidden fields", () => {
    const wrap = doc.querySelector("[data-ad-plan-form]");
    assert.ok(wrap, "[data-ad-plan-form] context wrapper missing");
    ["data-plan-context-name", "data-plan-context-type", "data-plan-context-specs"].forEach((attr) => {
      assert.ok(wrap.getAttribute(attr) !== null, `plan wrapper missing ${attr}`);
    });
    // The embed must live inside the context wrapper so main.js can target it.
    assert.ok(wrap.querySelector('.activedemand-replace[data-id="314873"]'),
      "floor-plan embed not inside [data-ad-plan-form] wrapper");
  });

  test("plan cards still pass plan details to the modal trigger", () => {
    const trigger = doc.querySelector("[data-open-plan-modal][data-plan-name]");
    assert.ok(trigger, "no plan-card trigger with data-plan-name found");
    ["data-plan-name", "data-plan-type", "data-plan-specs"].forEach((attr) => {
      assert.ok(trigger.getAttribute(attr) !== null, `plan trigger missing ${attr}`);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Event pages (/events/<slug>/) — RSVP ActiveDEMAND embed", () => {
  // Only the events defined in the data file are generated by Eleventy.
  const slugs = EVENTS.map((e) => e.slug);

  test("at least one event is defined", () => {
    assert.ok(slugs.length > 0, "no events defined in src/_data/events.js");
  });

  for (const slug of slugs) {
    describe(`/events/${slug}/`, () => {
      const doc = load(`events/${slug}/index.html`);

      test("RSVP embed (314798) is present", () => {
        const embed = getEmbed(doc, "314798");
        assert.ok(embed, `RSVP ActiveDEMAND embed (314798) not found on /events/${slug}/`);
      });

      test("RSVP embed declares data-type=Form", () => {
        const embed = getEmbed(doc, "314798");
        assert.equal(embed.getAttribute("data-type"), "Form", "RSVP embed missing data-type=Form");
      });

      test("event-context wrapper carries the data-* attrs main.js copies into hidden fields", () => {
        const wrap = doc.querySelector("[data-ad-event-form]");
        assert.ok(wrap, "[data-ad-event-form] context wrapper missing");
        ["data-event-title", "data-event-date", "data-event-time", "data-event-location"].forEach((attr) => {
          const v = wrap.getAttribute(attr);
          assert.ok(v !== null && v !== "", `event wrapper missing/empty ${attr}`);
        });
        assert.ok(wrap.querySelector('.activedemand-replace[data-id="314798"]'),
          "RSVP embed not inside [data-ad-event-form] wrapper");
      });
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────

describe("ActiveDEMAND tracking script", () => {
  const doc = load("contact/index.html");

  test("tracking loader is present", () => {
    const scripts = doc.querySelectorAll("script[src]");
    const hasLoader = scripts.some((s) => (s.getAttribute("src") || "").includes("staticfiles.io"));
    assert.ok(hasLoader, "ActiveDEMAND tracking loader script not found");
  });
});
