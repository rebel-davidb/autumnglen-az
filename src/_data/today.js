/**
 * Build-time "today" date as an ISO YYYY-MM-DD string.
 *
 * Exposed as the global `today` so templates can classify events as upcoming
 * vs. past without a hardcoded date that goes stale. Recomputed on every build
 * (and every Netlify deploy), so a featured event automatically drops out of
 * the hero the day after it occurs.
 *
 * Uses America/New_York (the community's timezone) so the rollover happens at
 * local midnight rather than UTC.
 */
module.exports = function () {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // en-CA formats as YYYY-MM-DD, matching the event `date` strings.
  return fmt.format(new Date());
};
