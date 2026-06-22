// Eleventy configuration for Azalea Estates of Fayetteville
// https://www.11ty.dev/docs/config/

module.exports = function (eleventyConfig) {
  // --- Filters -------------------------------------------------------------

  // Used by src/privacy.njk and src/_includes/partials/footer.njk
  // Usage: {{ '' | year }}  -> "2026"
  eleventyConfig.addFilter("year", () => new Date().getFullYear().toString());

  // Format an ISO "YYYY-MM-DD" date as e.g. "June 18, 2026".
  // Parsed as a local date (not UTC) to avoid off-by-one day shifts.
  // Usage: {{ "2026-06-18" | readableDate }} -> "June 18, 2026"
  eleventyConfig.addFilter("readableDate", (iso) => {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || "";
    const [y, m, d] = iso.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // --- Passthrough copies --------------------------------------------------
  // Static assets that Eleventy should copy straight through to _site/

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addPassthroughCopy("src/site.webmanifest");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/_redirects");
  eleventyConfig.addPassthroughCopy("src/forms.html");

  // --- Watch targets -------------------------------------------------------
  // Rebuild when CSS/JS change, even though they're passthrough copies.

  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addWatchTarget("src/assets/js/");

  // --- Return directory + template engine config ---------------------------

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
