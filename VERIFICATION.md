# Verification — Additive 3D

## October 14, 2026 update

Expanded privacy/request terms and added order, pickup and issue policies. Added required request-processing and file-use consent, server validation of both permissions and the current policy version, and consent metadata in business email. Build and TypeScript checks pass; all 18 regression tests pass. Public contact details were supplied by the owner; registration remains in progress. Live provider credentials and legal review remain outstanding.

Completed on October 7, 2026.

- Production Next.js build passed, including TypeScript checks and static generation of the homepage, custom design, privacy, terms, sitemap and robots routes.
- ESLint passed with no errors or warnings.
- All 17 regression tests passed. Tests cover binary/ASCII STL geometry, the $30 CAD floor across 288 material/quality/size/infill combinations, quantity scaling, manual-review cases, malformed and spoofed files, server schemas, email HTML escaping, attachment handling, provider failures, origin checks and body limits.
- Production print and design flows were exercised with mocked Resend, Turnstile and Upstash responses. Business and customer messages were verified. A tampered client price did not affect the server-calculated $30 quote.
- Browser checks verified real file chooser upload, a 10 mm cube with 1 cm³ enclosed volume and a $30 estimate, material changes, manual-review selection, file removal, invalid STL errors, and both forms’ honest unavailable response when email credentials are absent.
- Responsive checks covered desktop at 1440 px and mobile at 390 and 320 px. No horizontal overflow was detected after fixing the hidden file input. Navigation and keyboard form controls worked.
- Supplied Additive 3D branding and gallery photos were verified as loaded in the browser. The founder story uses supplied company information without time-specific weekly sales claims.
- The optional read-only estimate tool registered, returned the visible quote and rejected invalid arguments.

## Not verified against live accounts

Real email delivery, production Turnstile challenges, Upstash credentials, Vercel deployment and any future Supabase storage/database require the business’s account configuration. Mocked acceptance is not evidence of live inbox delivery. Pricing throughput and material allowances require calibration to the actual printers. Privacy and terms remain draft commercial content requiring final business details.

## October 14 process-photo update

Replaced the project gallery with the customer reference → SolidWorks review → approved print process and the four supplied photos. Updated navigation to Our Process. Logo rendering now preserves intrinsic proportions and blends its backing with the header. Production build, TypeScript and ESLint pass.

