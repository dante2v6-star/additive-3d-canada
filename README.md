# Additive 3D website

A complete Next.js App Router / TypeScript / Tailwind CSS website with a real STL quote workflow, custom CAD enquiries, Resend email delivery and adapters for future storage/database integration. Branding, workshop photographs and the founder story use the supplied Additive 3D reference. Contact details remain editable placeholders.

## Run locally

Use Node.js 22 LTS or newer and pnpm. From this directory:

```sh
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

On Windows PowerShell, use `Copy-Item .env.example .env.local` instead of `cp`. Open the URL printed by Next.js, normally http://localhost:3000. No secrets are necessary to explore the site or calculate estimates. Form submissions return an explicit unavailable message until email delivery is configured; they do not pretend to succeed.

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm start
```

`pnpm dev:portable` uses a single-process launcher for restricted Windows environments. The build uses Webpack with worker threads and TypeScript’s compiler API because this environment restricts child-process creation; no type checking is skipped. Standard Next.js commands remain available. Do not run a build concurrently with the development server if your host clears its development output.

## Configuration map

| Change                                                      | Location                                                        |
| ----------------------------------------------------------- | --------------------------------------------------------------- |
| Company name, public email, phone, address, hours           | `src/config/business.ts`                                        |
| Business inbox receiving requests                           | `BUSINESS_EMAIL` in `.env.local` / Vercel environment variables |
| Resend credential and verified sender                       | `RESEND_API_KEY`, `RESEND_FROM`                                 |
| Public canonical origin                                     | `NEXT_PUBLIC_SITE_URL`, e.g. `https://your-domain.ca`           |
| Minimum order, setup and machine rates, quality assumptions | `src/config/pricing.ts` → `pricing`                             |
| Materials, density and per-gram cost                        | `src/config/pricing.ts` → `materials`                           |
| Available colours and upload limits                         | `src/config/pricing.ts`                                         |
| Process steps and photo paths                           | `src/components/manufacturing-process.tsx`                                       |
| Quote formula and slicer interface                          | `src/lib/quote.ts`                                              |
| Business/customer email layouts                             | `src/lib/server/email.ts`                                       |
| Future private storage and database adapters                | `src/lib/server/storage.ts`                                     |

`pricing.minimumOrder` defaults to 30. The quote engine also enforces an absolute **$30 CAD floor**, including if this setting is accidentally lowered. You can increase the minimum through config. The homepage, FAQ, terms, emails and read-only browser tool currently repeat the $30 policy; update their copy together if increasing it. The server ignores client-supplied prices and computes its own quote from the uploaded STL and validated settings.

## Email setup

1. Create a Resend API key and verify a sending domain in Resend.
2. Set `RESEND_API_KEY` to that key.
3. Set `BUSINESS_EMAIL` to your receiving inbox.
4. Set `RESEND_FROM` to a verified sender, e.g. `Your Company <quotes@your-domain.ca>`.
5. Set `NEXT_PUBLIC_SITE_URL` to the exact origin customers use, without a trailing path. Rebuild after changing public environment variables. The origin check protects the submission endpoint; redirect secondary domains to your canonical domain.

Each valid submission sends the business an HTML/plain-text email with all fields and a prominent phone number, attaches the uploaded file, then sends the customer a confirmation. Both sends use content-derived idempotency keys. If a provider call fails, the page reports an error; retrying the identical payload in the same form avoids duplicate sends within Resend’s idempotency retention window. Business email may already have been accepted if confirmation delivery fails. The API confirms provider acceptance, not ultimate inbox delivery; monitor bounces/delivery in Resend. A durable queue/outbox can be added with a database if stronger delivery guarantees are needed.

## Production spam protection

Production request handling requires both Cloudflare Turnstile and a durable Upstash Redis rate limit:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

Register the deployed hostname with Turnstile. Its token and hostname are verified on the server. Requests are limited to five per ten minutes for the hashed client IP and email. Vercel's `x-real-ip` is used as the trusted proxy header; review that header policy if deploying behind another proxy. Local development can use a process-local limiter without CAPTCHA. Production fails closed when spam credentials are missing. The honeypot, schema validation, origin check and upload limits apply in all environments.

## Deploy to Vercel

### Netlify (selected hosting provider)

The included `netlify.toml` uses `pnpm build`, publishes `.next`, and selects Node.js 22. Netlify's OpenNext adapter handles the server-rendered site and `/api/requests`; this must be a framework deployment, not a drag-and-drop upload of the source or a static `.next` directory.

Use `netlify login`, link/create your project, set the environment variables through Netlify with **Builds and Functions scopes**, then use `netlify deploy --prod`. Set `NEXT_PUBLIC_SITE_URL` to the confirmed site URL, `BUSINESS_EMAIL` to the receiving inbox, and `DEPLOYMENT_PLATFORM=netlify` for the trusted client-IP header. Resend and production spam-protection keys still need to be supplied before requests can be delivered. Values in the `[build.environment]` section of `netlify.toml` are build settings; they do not configure serverless runtime secrets.

See [Netlify Next.js hosting](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/) and [function environment variables](https://docs.netlify.com/build/functions/environment-variables/).

### Vercel alternative

1. Put this project in your Git repository, keeping `.env.local` and secrets excluded.
2. Import the repository in Vercel. Select this folder as the root directory if it lives inside a larger repository.
3. Use the Next.js framework preset and Node.js 22 or newer. Install: `pnpm install --frozen-lockfile`. Build: `pnpm build`. Leave the output directory at the Next.js default.
4. Add the email, canonical URL and production spam-protection variables listed above to the appropriate environment.
5. Deploy, attach your domain and redirect other hostnames to the canonical origin. Rebuild if the domain or any `NEXT_PUBLIC_` setting changes.
6. Send one real print request and one design request. Verify the business attachment, phone number, customer confirmation, spam challenge and Resend delivery events.

No Vercel account or live email credentials were provided, so deployment and real email delivery are not completed by this source package.

## STL analysis and pricing limits

- Binary and ASCII STL are parsed locally for preview, bounding box, triangle count, and signed enclosed volume. The server repeats analysis before accepting a request. STL coordinates are assumed to be **millimetres**.
- A 3 MB file and 60,000-triangle cap limit CPU/memory use and fit within Vercel's request body limit. One file per request; no archive extraction or execution.
- Mesh edges are checked for closure and consistent winding. Open/inconsistent geometry, effectively zero volume, dimensions over 350 mm, and “Other” material require manual review. Self-intersection, overlapping shells and all manufacturing defects are not exhaustively detected.
- Weight uses material density, a shell allowance, infill and a support allowance. Hours use assumed extrusion throughput, quality and material multipliers. These are **not slicer outputs**, cannot determine actual toolpaths or orientation, and need calibration against your equipment.
- Quantity scales material and machine time; setup is charged once. Taxes, shipping and finishing are excluded. No checkout, payment or automatic production is triggered.
- The `Slicer` interface is the extension point for a trusted backend slicer/API. Add signed storage uploads and asynchronous analysis for large meshes; do not simply raise the form limit past the hosting provider’s cap.

## Storage and database

The current durable request record is the business email. Files remain in request memory and are emailed as attachments; there is no public bucket or temporary filesystem claim. `FileStorage` and `RequestRepository` define boundaries for a private Supabase bucket and database. Data models cover `Customer`, `PrintQuote`, `PrintRequest`, `CustomDesignRequest` and `StoredFile`.

For Supabase: keep service credentials server-only, use a private bucket, create short-lived signed links, enforce per-file size/type checks, add database migrations and retention/deletion policies, and persist request status before adding an outbox. Do not expose service-role keys to the browser. This package does not provision Supabase.

## Project layout

```text
src/app/                 Homepage, custom design, privacy, terms, SEO routes
src/app/api/requests/    Validated multipart request endpoint
src/components/         Shared layout, forms, Three.js preview and manufacturing process
src/config/             Business, pricing, materials and legal settings
src/lib/                STL analysis, pricing, models and validation
src/lib/server/         Email, file validation, spam protection and adapters
public/                 Favicon; add your project photography here
tests/                  Regression tests and generated cube STL fixtures
scripts/                Portable development and test runners
```

The site exposes an optional, feature-detected read-only WebMCP tool to read the current visible estimate without customer details or submission side effects. Unsupported browsers use the normal interface.

## Launch checklist

Read `LEGAL-LAUNCH.md` for the operating policies, business details and legal review still needed. The forms now require separate request-processing consent and file-use permission; the server records the current policy version and consent time in the business email. `/order-policy` explains the enquiry-to-order process and preserves mandatory consumer remedies.

- Confirm public email/phone/hours and the pickup address. Additive 3D branding is already applied.
- Supply your final domain, receiving email, verified sender and secret credentials.
- Review and calibrate material costs, machine throughput, dimensions, colours and lead-time wording.
- The manufacturing process uses the four supplied photos: customer references, SolidWorks review and final print. Replace photo paths in src/components/manufacturing-process.tsx and add files under public/process.
- Finalize the draft privacy and terms pages with your identity, privacy contact, retention, commercial policies and provider arrangements.
- Complete live email delivery and production spam-service tests using your accounts.

## References

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [Resend email API](https://resend.com/docs/api-reference/emails/send-email)
- [Vercel function limits](https://vercel.com/docs/functions/limitations)
- [Upstash REST API](https://upstash.com/docs/redis/features/restapi)

