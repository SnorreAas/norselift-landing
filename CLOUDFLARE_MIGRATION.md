# Cloudflare Workers (static assets) hosting

norselift.com is served from Cloudflare Workers static assets (Worker `norselift-landing`)
instead of Vercel.

**Cutover done (21 October 2026, Europe/Oslo):** the norselift.com zone became active on
Cloudflare at 10:48, and the site moved to the Worker (custom domain + www 308 redirect rule)
at 11:06. `app.norselift.com` stays on Vercel (DNS-only A record). Mail records (Porkbun
forwarding MX/SPF, Resend DKIM and `send` MX/SPF) were copied unchanged.

| Vercel (vercel.json)                     | Cloudflare equivalent                                   |
|------------------------------------------|---------------------------------------------------------|
| `cleanUrls: true`                        | `assets.html_handling: "drop-trailing-slash"` + `_redirects` (308 from `*.html`/`index`) |
| headers nosniff / DENY on `/(.*)`        | `_headers` (`/*`), plus HSTS that Vercel adds by default |
| www.norselift.com -> norselift.com (308) | Zone **Redirect Rule** (Rules > Redirect Rules) once the zone is on Cloudflare: `http.host eq "www.norselift.com"` -> dynamic `concat("https://norselift.com", http.request.uri.path)`, 308, preserve query string. Needs a proxied DNS record for `www` (e.g. AAAA `100::` proxied, or attach www as a Worker custom domain). |
| files hidden by Vercel (package.json, vercel.json) | `.assetsignore` |

Deploy manually: `npx wrangler deploy` (serves the repo root as assets, no build step).

Known differences from Vercel:
- Vercel Web Analytics script tags removed (the `/_vercel/insights` endpoint does not exist on Cloudflare);
  privacy.html and llms.txt updated: website on Cloudflare, app (app.norselift.com) still on Vercel.
- `/terms/` (trailing slash) redirects 307 to `/terms` instead of serving a duplicate 200.
- Unknown `*.html` paths return 404 directly instead of 308 -> 404.
- Unknown paths serve the branded `404.html` (status 404) via `not_found_handling: "404-page"`.
