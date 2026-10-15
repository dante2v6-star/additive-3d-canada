import Link from "next/link";
import { LegalContact, PolicyStatus } from "@/components/legal-contact";
export const metadata = { title: "Website & Request Terms" };
const sections = [
  [
    "Enquiries are not orders",
    "This website provides preliminary estimates and requests for CAD quotes. Submitting, receiving a confirmation or viewing an estimate does not form a manufacturing order, take payment, reserve capacity or authorize production. An order needs separately confirmed scope, full price and written approval. Applicable mandatory consumer protections remain in effect.",
  ],
  [
    "Prices, estimates and taxes",
    "All prices are Canadian dollars; minimum print order is $30 CAD. Instant estimates use geometry and assumptions, not production slicing. Before an order is agreed, review may change proposed scope or price. Taxes, shipping, design and finishing are excluded unless specified in the final quote. Full charges are disclosed before acceptance. Once an estimate forms part of a consumer agreement, statutory limits on increases and other protections apply. This disclaimer does not override them. Additional work and scope changes require agreement.",
  ],
  [
    "Manufacturing requirements",
    "STL units are assumed to be millimetres. Identify critical dimensions, tolerance, load, temperature, exposure and intended use. Orientation, layer lines, support removal and material behaviour affect fit and finish. Inspection, tolerances and finish must be agreed for each order. The calculator is not a certification of fitness. Medical, food-contact, pressure, structural, electrical or other safety-critical uses require explicit assessment, documented requirements and applicable approvals. We may decline work we cannot responsibly manufacture.",
  ],
  [
    "Files, intellectual property and confidentiality",
    "Only provide files and designs you are authorized to use. You retain rights you already have in supplied files. You permit limited copying and processing through our providers for evaluation and, if separately approved, fulfilling the project. This does not authorize publishing your design or identifiable customer projects for marketing. New CAD/source files, renders, revisions and ownership or licences must be addressed in the design agreement before paid work. No transfer is implied by an enquiry. The website does not create an NDA; discuss one before providing trade secrets.",
  ],
  [
    "Acceptable use",
    "Do not provide unlawful content, infringing designs, malicious files or instructions to evade restrictions. Do not misuse forms or security systems. We may reject unsafe or inappropriate requests. Uploaded files are not executed by the quoting service.",
  ],
  [
    "Payments, cancellation and remedies",
    "See the Order, Pickup & Issue Policy. Written project terms must disclose deposits, milestones, revisions, cancellations, delivery and remedies before agreement. Nothing on this website excludes non-waivable rights, imposes mandatory arbitration or prevents legally permitted complaints or proceedings.",
  ],
  [
    "Availability and responsibility",
    "Preliminary outputs and website information may contain errors or be unavailable. Verify agreed specifications before relying on a part. Any lawful allocation or limitation of responsibility for paid work must be addressed in the project agreement. These terms do not exclude liability or statutory warranties that cannot lawfully be excluded.",
  ],
  [
    "Governing law and updates",
    "Applicable Ontario and Canadian law governs, subject to mandatory rights that may apply elsewhere. Revised policies do not retroactively alter an agreed order. Contact us with questions or accessibility difficulties.",
  ],
];
export default function Policy() {
  return (
    <main id="main" className="container legal">
      <div className="eyebrow">ADDITIVE 3D · BUSINESS POLICIES</div>
      <h1>Website &amp; Request Terms</h1>
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
