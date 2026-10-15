# Additive 3D website

Production: https://additive3d.netlify.app

## Request handling on Netlify

Both forms first validate contact details, consent, file contents and STL estimates through `/api/requests`. This prepares a normalized submission; it does not claim receipt. The browser then posts the fields and original file directly to `/__forms.html`, registered by Netlify using `public/__forms.html`. Success appears only after that request succeeds.

Netlify Forms stores requests and files, applies spam filtering and a honeypot, and sends business notifications to additive3dcanada@gmail.com. The owner reviews submissions under Forms in Netlify. File URLs are provider links, not an authenticated confidential file vault. Do not upload sensitive or confidential information. All submissions, including estimates, require manual review before agreement; client fields can be forged.

There are no automatic customer confirmation emails. Customers see an on-screen reference and receive a personal reply. Browser validation/preparation alone does not save a submission. Retrying after a network interruption can create a duplicate: reconcile using the request reference.

Required hosting settings: enable form detection before deploying; add an email notification for all verified submissions; set `DEPLOYMENT_PLATFORM=netlify` and `NEXT_PUBLIC_SITE_URL=https://additive3d.netlify.app`. Resend, Turnstile and Upstash credentials are not needed for this Netlify flow. The older email transport remains available for a separately configured non-Netlify deployment.

Monitor Forms spam and usage, and delete records/files in Netlify and the business inbox according to the finalized retention schedule. Email notification delivery is separate from successful storage; verify notifications in the business inbox.

## Local development

Node 22+, pnpm. Run `pnpm install --frozen-lockfile`, `pnpm dev`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build`. Local estimates work without credentials. Local Netlify storage requires a deployed Netlify site; do not interpret preparation as a completed submission.

Company details: `src/config/business.ts`; policies: `src/config/legal.ts` and policy pages; estimate rates/materials: `src/config/pricing.ts`. Minimum print order is $30 CAD. Read LEGAL-LAUNCH.md before taking paid orders.

## STL upload size

STL originals can be up to 7 MB (7 × 1024 × 1024 bytes), with at most 60,000 triangles. Large ASCII STL files are converted to equivalent compact binary geometry only for the validation request, keeping that function payload below 3.5 MB. The original file is preserved in the direct Netlify Forms upload. Non-STL design reference uploads remain capped at 3 MB. The total native form upload stays below Netlify's 8 MB limit.
