# Public launch and legal implementation

This website is a quotation/enquiry service, not incorporation, a securities offering, a payment checkout or a legal-compliance certificate. An Ontario lawyer should review the final policies and project contract against the business's actual operations. Do not set `legal.reviewed` to true merely to hide the status message.

## Details still needed

The owner supplied the operating name **Additive 3D Canada**, public email **addititive3dcanada@gmail.com**, and phone **905-746-4910**. Registration is in progress. These are populated in the site, but the name must not be presented as an already registered corporation. Confirm the registered identity once approved. The email spelling is preserved exactly as supplied.

- Registered entity/proprietor name trading as Additive 3D, public business phone and address, privacy officer and working public contact email. Set business details in `src/config/business.ts` and legal details in `src/config/legal.ts`.
- Adopt a written retention schedule for unaccepted enquiries, customer files, order records, consents, delivery logs and backups. Implement mailbox deletion and provider retention reviews; this application does not automatically erase email records.
- Confirm hosting/email/security providers and processing locations against the published privacy notice. Restrict mailbox access, enable MFA, protect keys, monitor bounces and handle privacy/access requests and incidents.
- Establish project contracts: full prices and tax, specification, tolerance/finish, delivery, payment/deposits, CAD ownership, revision allowance, cancellations and proportionate defect remedies. Obtain written approval before production. Do not use an estimate disclaimer to bypass statutory price-increase or cancellation rights.
- Obtain any needed business registration, tax registrations, insurance, zoning/pickup permissions and product-specific approvals. Confirm business size and applicable Ontario accessibility obligations; website accessibility alone is not an AODA compliance claim.
- Safety-critical, food-contact, medical and other regulated uses require separate assessment, not generic online disclaimers. Do not assume all requested parts may lawfully be manufactured.
- Retain the consent record and policy version emailed with requests. Historical policy text must also be archived by the business. Policy updates do not automatically authorize new uses.
- There is no newsletter. Keep response emails project-related. If marketing is added, implement separate optional express consent, required identification and unsubscribe handling under CASL rather than treating a quote request as marketing consent.

## Submission behavior

1. Validate form, consent acknowledgements, policy version and file.
2. Analyze STL and recompute price on the server; reject prohibited/oversized files.
3. Validate configured email and anti-abuse services.
4. Email BUSINESS_EMAIL with contact details, specifications, estimate, consent version/time and the attachment.
5. Email the customer a confirmation with their request reference. Reply-To goes to the business inbox.
6. Display success only after both provider calls are accepted. Nothing is charged or sent to production. No database/admin queue is provisioned; the business email is the request record.

An email-provider timeout or failure can occur after the business email was accepted. Retrying an identical form uses idempotency keys; this is not a durable outbox and cannot guarantee inbox delivery. Monitor Resend events. Configure RESEND_API_KEY, BUSINESS_EMAIL, RESEND_FROM, the canonical URL, Turnstile and Upstash before public requests can work. Do not put private keys into public frontend variables.

## Primary guidance checked on October 14, 2026

- [Privacy Commissioner: business privacy guide](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/pipeda-compliance-help/guide_org/)
- [Ontario: consumer agreements](https://www.ontario.ca/document/business-guide-consumer-protection/general-information-about-agreements)
- [Ontario: signing and cancelling contracts](https://www.ontario.ca/page/your-rights-when-signing-or-cancelling-contract)
- [CRTC: requested replies and CASL](https://www.crtc.gc.ca/eng/com500/info.htm)

Policies deliberately preserve applicable mandatory rights instead of assuming that a blanket no-refunds or liability waiver is enforceable. The exact consumer-law regime and other obligations must be rechecked for the launch date and customer locations.
