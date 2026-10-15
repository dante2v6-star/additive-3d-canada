import Link from "next/link";
import { LegalContact, PolicyStatus } from "@/components/legal-contact";
export const metadata = { title: "Privacy Policy" };
const sections = [
  [
    "Purpose and responsibility",
    "Additive 3D uses information you provide to evaluate print and CAD requests, communicate with you and perform work you separately approve. This policy describes the current enquiry website.",
  ],
  [
    "Information and purposes",
    "Forms collect your name, email, phone, project description, intended use, specifications, print settings, requested dates, files and estimate details. We record the request reference, submission time, consent acknowledgements and policy version. These support project evaluation, quoting, follow-up and administering agreed work. Spam protection processes security tokens and hashed IP and email identifiers; hashes are not a guarantee of anonymity. Hosting and security providers may process device information, IP addresses and operational logs for delivery and abuse prevention.",
  ],
  [
    "Files and meaningful consent",
    "Initial STL analysis runs in your browser. Files transfer only when you submit. The server validates uploads and recomputes estimates; files are attached to the business email, not publicly listed or executed. The form asks for permission to process the request and evaluate your files. Do not upload identity documents, payment information, medical records or unrelated sensitive information.",
  ],
  [
    "Communications and your choices",
    "We send a confirmation and project-related replies. Submitting does not subscribe you to marketing. You can withdraw consent for optional uses or ask us to stop responding; this may prevent completion of the request. Information required for an existing agreement or legal obligation may be kept as permitted by law.",
  ],
  [
    "Providers and processing outside Canada",
    "Resend handles notifications, attachments and confirmations. Our business email provider stores messages. When configured, Cloudflare Turnstile provides bot protection and Upstash Redis stores ten-minute rate-limit counters. Hosting providers process requests and may retain logs. The local preview runs on the owner’s computer; the selected public hosting provider is Netlify. Providers may process information outside Canada, subject to foreign laws and lawful access. We use providers for the stated purposes and do not sell customer information. Lawful disclosure obligations may apply.",
  ],
  [
    "Retention and deletion",
    "Requests currently remain in the business email system. We retain information only as needed for the enquiry, agreed work, applicable recordkeeping duties and legitimate disputes. The owner must finalize and implement a documented retention schedule before public launch. Provider backups and logs may have separate periods. Deletion is not automated in this website.",
  ],
  [
    "Access, correction and complaints",
    "Contact the privacy officer to request access, correction, deletion, withdrawal or raise a concern. We may need proportionate identity verification and will explain lawful limits on access or deletion. We respond within the period required by applicable law. You may also contact the Office of the Privacy Commissioner of Canada at priv.gc.ca.",
  ],
  [
    "Safeguards and incidents",
    "The website uses upload limits, file-type checks, server validation and abuse controls. Service credentials remain server-side. No online system is perfectly secure. Suspected incidents must be assessed and notifications and records made when required by law. Discuss a confidentiality agreement before sending highly confidential inventions or trade secrets.",
  ],
  [
    "Cookies, tracking and external sites",
    "The current site has no advertising pixels or marketing analytics. Security and hosting services may use necessary browser mechanisms. There is no optional tracking requiring a marketing cookie banner. If optional analytics are added, disclosures and consent controls must be updated first. Google Maps opens as a separate service, not an embedded map, and follows Google’s policies.",
  ],
  [
    "Policy changes",
    "The version above identifies this policy. We explain new purposes and obtain further consent where required before using previously collected information for them. Posting a new policy does not by itself authorize a new use.",
  ],
];
export default function Policy() {
  return (
    <main id="main" className="container legal">
      <div className="eyebrow">ADDITIVE 3D · BUSINESS POLICIES</div>
      <h1>Privacy Policy</h1>
      <PolicyStatus />
      <LegalContact />
      {sections.map(([heading, text]) => (
        <section key={heading}>
          <h2>{heading}</h2>
          <p>{text}</p>
        </section>
      ))}
      <p>
        <Link href="/order-policy">Order policy</Link> ·{" "}
        <Link href="/privacy">Privacy policy</Link> ·{" "}
        <Link href="/terms">Website terms</Link>
      </p>
    </main>
  );
}

