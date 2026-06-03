/**
 * Azalea Estates — Marketing Events Data
 *
 * Each event object:
 *   slug        – URL-safe identifier (/events/<slug>/)
 *   title       – Display title
 *   subtitle    – Short tagline shown on cards
 *   description – Full HTML-capable description for the RSVP page
 *   date        – ISO 8601 date string (YYYY-MM-DD)
 *   rsvpDeadline– Human-readable RSVP deadline (shown on card/page)
 *   time        – Human-readable time + timezone
 *   timeStart   – 24-hour "HH:MM" used for .ics calendar file
 *   timeEnd     – 24-hour "HH:MM" used for .ics calendar file
 *   location    – Full venue name
 *   address     – Street address
 *   image       – Path to hero/card image
 *   imageAlt    – Alt text for the image
 *   flyerPdf    – Path to downloadable event flyer PDF (optional)
 *   capacity    – Max RSVPs (null = unlimited)
 *   featured    – Show in homepage spotlight section
 *   type        – "open-house" | "seminar" | "social" | "health" | "family" | "entertainment"
 *   cta         – Override the default "RSVP Now" button label
 *   highlights  – Array of short strings shown as feature bullets on card/RSVP
 */

module.exports = [

  // ── REAL UPCOMING EVENTS ──────────────────────────────────────────────────

  {
    slug: "azalea-luau-2026",
    title: "Azalea Luau",
    subtitle: "Join us for a tropical afternoon of live music, island bites, and mocktails.",
    description: `
      <p>Grab your leis and get ready for a tropical afternoon at Azalea Estates! We're throwing a Luau and everyone is invited to enjoy the fun.</p>
      <p>The afternoon will feature:</p>
      <ul>
        <li>🎵 Live music to set the island mood</li>
        <li>🍍 Tropical hors d'oeuvres</li>
        <li>🍹 Refreshing tropical mocktails</li>
      </ul>
      <p>This is a wonderful opportunity to come see our community in a festive, relaxed setting — whether you're a current family member, a neighbor, or someone curious about what life at Azalea Estates looks like. All are welcome.</p>
      <p><strong>Please RSVP by June 11</strong> so we can make sure we have plenty of food and drinks for everyone. You can call us at <a href="tel:7625725194">(762) 572-5194</a> or email <a href="mailto:azaleaoffice105@gmail.com">azaleaoffice105@gmail.com</a>.</p>
    `,
    date: "2026-06-18",
    rsvpDeadline: "June 11, 2026",
    time: "2:00 PM",
    timeStart: "14:00",
    timeEnd: "16:00",
    location: "Azalea Estates Assisted Living",
    address: "105 Autumn Glen Cir., Fayetteville, GA 30215",
    image: "/assets/images/group-pool-activity.jpeg",
    imageAlt: "Residents enjoying a community celebration at Azalea Estates",
    flyerPdf: "/assets/pdfs/events/ae-luau-2026.pdf",
    capacity: null,
    featured: true,
    type: "social",
    cta: "RSVP for the Luau",
    highlights: [
      "Live music all afternoon",
      "Tropical hors d'oeuvres",
      "Tropical mocktails",
      "RSVP by June 11 — call (762) 572-5194 or email us"
    ]
  },

  {
    slug: "independence-day-penny-miller",
    title: "Independence Day Celebration with Penny Miller",
    subtitle: "Live music with Penny Miller as we celebrate the 4th of July together.",
    description: `
      <p>Join Azalea Estates for a festive Independence Day celebration featuring live music by the talented <strong>Penny Miller</strong>!</p>
      <p>Come celebrate the spirit of the holiday with great music, good company, and a community that knows how to have a good time. This event is open to residents, families, and friends — all are welcome to join in the fun.</p>
      <p>Penny Miller brings warmth and energy to every performance, and this is sure to be a memorable afternoon at Azalea Estates.</p>
      <p><strong>Please RSVP by June 26</strong> so we can plan accordingly. Call us at <a href="tel:7625725194">(762) 572-5194</a> or email <a href="mailto:azaleaoffice105@gmail.com">azaleaoffice105@gmail.com</a>.</p>
    `,
    date: "2026-07-03",
    rsvpDeadline: "June 26, 2026",
    time: "3:00 PM",
    timeStart: "15:00",
    timeEnd: "17:00",
    location: "Azalea Estates Assisted Living",
    address: "105 Autumn Glen Cir., Fayetteville, GA 30215",
    image: "/assets/images/bingo.jpg",
    imageAlt: "Residents enjoying a festive community event at Azalea Estates",
    flyerPdf: "/assets/pdfs/events/penny-july-4-2026.pdf",
    capacity: null,
    featured: true,
    type: "entertainment",
    cta: "RSVP for the Celebration",
    highlights: [
      "Live music by Penny Miller",
      "Independence Day celebration atmosphere",
      "Open to residents, families & friends",
      "RSVP by June 26 — call (762) 572-5194 or email us"
    ]
  },

];
