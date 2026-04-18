# Azalea Estates of Fayetteville — Website

A modernized marketing site for Azalea Estates, built with [Eleventy (11ty)](https://www.11ty.dev/) and ready to deploy on Netlify.

## Highlights

- Warm & elegant design system with serif display type and a hospitality-inspired palette
- Single-source layouts (Nunjucks) and reusable components
- Netlify Forms integration on the contact page (no backend required)
- Accessible markup, semantic headings, skip link, focus states
- Preload hints, lazy-loaded imagery, and long-cache headers on static assets
- SEO: `sitemap.xml`, `robots.txt`, LocalBusiness JSON-LD, Open Graph metadata
- 301 redirects from legacy WordPress URLs to new routes

## Local development

```bash
npm install
npm start            # http://localhost:8080 with live reload
npm run build        # outputs static site to _site/
```

Node 18+ is recommended (Netlify is pinned to Node 20 in `netlify.toml`).

## Project structure

```
.
├── .eleventy.js               # Eleventy configuration
├── netlify.toml               # Netlify build + headers + redirects
├── package.json
└── src/
    ├── _data/
    │   ├── site.js            # Site-wide config (name, nav, contact)
    │   └── images.js          # Unsplash placeholder image URLs
    ├── _includes/
    │   ├── layouts/
    │   │   ├── base.njk       # Full HTML shell
    │   │   └── page.njk       # Interior-page layout with hero
    │   └── partials/
    │       ├── header.njk
    │       ├── footer.njk
    │       └── icons.njk      # Inline SVG icon macro
    ├── assets/
    │   ├── css/styles.css     # Design system + all page styles
    │   ├── js/main.js         # Nav toggle, scroll reveal, lightbox
    │   └── images/            # (empty — ready for real photos)
    ├── contact/thanks.njk     # Form submission confirmation
    ├── index.njk              # Home
    ├── about.njk
    ├── living-options.njk
    ├── amenities.njk
    ├── floor-plans.njk
    ├── gallery.njk
    ├── contact.njk
    ├── privacy.njk
    ├── accessibility.njk
    ├── 404.njk
    ├── sitemap.njk
    ├── forms.html             # Static stub for Netlify Forms detection
    ├── favicon.svg
    ├── robots.txt
    └── _redirects             # Legacy URL redirects
```

## Replacing the placeholder images

All imagery is pulled from Unsplash via `src/_data/images.js`. To swap in real photos:

1. Drop photos into `src/assets/images/` (e.g. `hero.jpg`, `exterior.jpg`).
2. Edit `src/_data/images.js` and replace the Unsplash URLs with local paths, e.g.:
   ```js
   hero: "/assets/images/hero.jpg",
   ```
3. Rebuild — every page that references `images.hero` is updated automatically.

## Netlify Forms

The contact form on `/contact/` uses Netlify Forms. Submissions appear in the Netlify dashboard under **Forms → contact**. To enable email notifications, add a form notification in the Netlify UI.

The form is also declared in `src/forms.html` as a static stub so Netlify detects it during deploy.

## Deployment

### One-click (recommended)

1. Push this repository to GitHub / GitLab / Bitbucket.
2. In Netlify, click **Add new site → Import an existing project**.
3. Select the repo — Netlify reads `netlify.toml` and configures itself.
4. Deploy.

### Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init          # link or create a new site
netlify deploy --build --prod
```

### Drag-and-drop

```bash
npm run build
# then drag the _site/ folder onto https://app.netlify.com/drop
```

## License

All code in this repository is released under the MIT license. Placeholder imagery is sourced from Unsplash under the Unsplash license.
