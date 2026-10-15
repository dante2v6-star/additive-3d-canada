# Public launch and legal implementation

This website is a quotation/enquiry service, not incorporation, a securities offering, a payment checkout or a legal-compliance certificate. An Ontario lawyer should review the final policies and project contract against the business's actual operations. Do not set `legal.reviewed` to true merely to hide the status message.

## Details still needed

The owner supplied the operating name **Additive 3D Canada**, public email **additive3dcanada@gmail.com**, and phone **905-746-4910**. Registration is in progress. These are populated in the site, but the name must not be presented as an already registered corporation. Confirm the registered identity once approved. The email spelling is preserved exactly as supplied.

- Registered entity/proprietor name trading as Additive 3D, public business phone and address, privacy officer and working public contact email. Set business details in `src/config/business.ts` and legal details in `src/config/legal.ts`.
- Adopt a written retention schedule for unaccepted enquiries, customer files, order records, consents, delivery logs and backups. Implement mailbox deletion and provider retention reviews; this application does not automatically erase email records.
- Confirm hosting/email/security providers and processing locations against the published privacy notice. Restrict mailbox access, enable MFA, protect keys, monitor bounces and handle privacy/access requests and incidents.
- Establish project contracts: full prices and tax, specification, tolerance/finish, delivery, payment/deposits, CAD ownership, revision allowance, cancellations and proportionate defect remedies. Obtain written approval before production. Do not use an estimate disclaimer to bypass statutory price-increase or cancellation rights.
- Obtain any needed business registration, tax registrations, insurance, zoning/pickup permissions and product-specific approvals. Confirm business size and applicable Ontario accessibility obligations; website accessibility alone is not an AODA compliance claim.
- Safety-critical, food-contact, medical and other regulated uses require separate assessment, not generic online disclaimers. Do not assume all requested parts may lawfully be manufactured.
- Retain the consent record and policy version emailed with requests. Historical policy text must also be archived by the business. Policy updates do not automatically authorize new uses.
- There is no newsletter. Keep response emails project-related. If marketing is added, implement separate optional express consent, required identification and unsubscribe handling under CASL rather than treating a quote request as marketing consent.

## Submission behavior on Netlify

1. Validate form, consent acknowledgements, policy version and file on the server; recalculate STL estimates.
2. Return normalized submission fields to the browser. Preparation does not save a request.
3. The browser posts the validated summary and original attachment directly to the static Netlify Forms endpoint. Netlify applies its spam filtering and honeypot.
4. Show an on-screen reference only after Netlify accepts the submission. No automatic customer confirmation email is sent, and no order or production is authorized.
5. Netlify stores submissions and files; configured email notifications alert additive3dcanada@gmail.com. Review both verified and spam submissions and personally follow up.

All received requests need manual review, including estimates. Direct form payloads can be forged. A successful submission does not guarantee notification-email delivery. Monitor the inbox and Netlify dashboard; reconcile duplicates by reference after interrupted retries. Configure form detection and an email notification in Netlify. No Resend, Turnstile or Upstash credentials are required for this flow.

Netlify uploads use provider-generated file links rather than an authenticated private file vault. Do not solicit sensitive files or trade secrets through this form. Apply the retention schedule to both Netlify records/files and email correspondence; deletion is manual and provider caches may retain file links briefly.

## Primary guidance checked on October 14, 2026

- [Privacy Commissioner: business privacy guide](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/pipeda-compliance-help/guide_org/)
- [Ontario: consumer agreements](https://www.ontario.ca/document/business-guide-consumer-protection/general-information-about-agreements)
- [Ontario: signing and cancelling contracts](https://www.ontario.ca/page/your-rights-when-signing-or-cancelling-contract)
- [CRTC: requested replies and CASL](https://www.crtc.gc.ca/eng/com500/info.htm)

Policies deliberately preserve applicable mandatory rights instead of assuming that a blanket no-refunds or liability waiver is enforceable. The exact consumer-law regime and other obligations must be rechecked for the launch date and customer locations.
