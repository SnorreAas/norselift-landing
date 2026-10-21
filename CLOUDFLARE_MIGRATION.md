# Cloudflare Workers (static assets) hosting

This branch adds config to serve the site from Cloudflare Workers static assets
instead of Vercel. Nothing here affects the live Vercel deployment.

| Vercel (vercel.json)                     | Cloudflare equivalent                                   |
|------------------------------------------|---------------------------------------------------------|
| `cleanUrls: true`                        | `assets.html_handling: "drop-trailing-slash"` + `_redirects` (308 from `*.html`/`index`) |
| headers nosniff / DENY on `/(.*)`        | `_headers` (`/*`), plus HSTS that Vercel adds by default |
| www.norselift.com -> norselift.com (308) | Zone **Redirect Rule** (Rules > Redirect Rules) once the zone is on Cloudflare: `http.host eq "www.norselift.com"` -> dynamic `concat("https://norselift.com", http.request.uri.path)`, 308, preserve query string. Needs a proxied DNS record for `www` (e.g. AAAA `100::` proxied, or attach www as a Worker custom domain). |
| files hidden by Vercel (package.json, vercel.json) | `.assetsignore` |

Deploy manually: `npx wrangler deploy` (serves the repo root as assets, no build step).

Known differences from Vercel:
- `/_vercel/insights/script.js` (Vercel Web Analytics) does not exist on Cloudflare -> 404.
  Remove the `<script>` tags or swap to Cloudflare Web Analytics, and update privacy.html.
- `/terms/` (trailing slash) redirects 307 to `/terms` instead of serving a duplicate 200.
- Unknown `*.html` paths return 404 directly instead of 308 -> 404.
- 404 body is empty (Vercel: plain-text "The page could not be found"). Add `404.html` +
  `not_found_handling: "404-page"` if a branded 404 is wanted.
