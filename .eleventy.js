// Eleventy configuration for Azalea Estates of Fayetteville
// https://www.11ty.dev/docs/config/

module.exports = function (eleventyConfig) {
  // --- Filters -------------------------------------------------------------

  // Used by src/privacy.njk and src/_includes/partials/footer.njk
  // Usage: {{ '' | year }}  -> "2026"
  eleventyConfig.addFilter("year", () => new Date().getFullYear().toString());

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
