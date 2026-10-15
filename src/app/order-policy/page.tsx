import Link from "next/link";
import { PolicyStatus, LegalContact } from "@/components/legal-contact";
export const metadata = { title: "Order, Pickup & Issue Policy" };
export default function OrderPolicy() {
  return (
    <main id="main" className="container legal">
      <div className="eyebrow">FROM REQUEST TO CONFIRMED PROJECT</div>
      <h1>Order, Pickup &amp; Issue Policy</h1>
      <PolicyStatus />
      <h2>How requests become orders</h2>
      <p>
        We review your file and requirements, then provide a confirmed quote
        with scope, material, quantity, agreed tolerances, full price,
        applicable taxes and any design or delivery charges. We explain timing,
        payment terms and cancellation conditions. You can ask questions and
        correct mistakes before written approval. Work begins only after the
        required approval and any agreed payment.
      </p>
      <h2>Payments and design revisions</h2>
      <p>
        This website does not collect payments. A final quote identifies any
        deposit, payment method and milestones. CAD quotes identify
        deliverables, included revisions and ownership or licensing terms. Extra
        work requires a separately approved charge.
      </p>
      <h2>Cancellation and changes</h2>
      <p>
        Contact us promptly to request a cancellation or change. Any
        cancellation charge for work or materials must be disclosed and agreed
        before an order begins and remains subject to applicable consumer law.
        Custom manufacture does not automatically remove statutory rights. This
        website does not impose a blanket “no refunds” rule.
      </p>
      <h2>Production time and delays</h2>
      <p>
        Displayed machine hours are not a delivery promise. Timing is confirmed
        after review. We communicate material availability or unexpected delays
        and discuss the available options under the agreement and applicable
        law.
      </p>
      <h2>Pickup and shipping</h2>
      <p>
        Local pickup is available by arrangement at 1235 Richmond St, London,
        Ontario. Wait for a ready-for-pickup confirmation before travelling.
        Shipping availability, price, delivery method and any insurance or
        handling terms are confirmed before acceptance. Carrier dates are
        estimates unless expressly guaranteed. Report transit damage promptly
        and retain packaging where practical so we can investigate.
      </p>
      <h2>Fit, defects and order issues</h2>
      <p>
        Contact us if the delivered work is defective, damaged, missing or
        materially differs from agreed specifications. Include the order
        reference, description and useful photographs; keep the item while we
        investigate. We will discuss appropriate correction, reprint, repair,
        replacement or refund according to the circumstances, agreed terms and
        applicable law. Prompt notice is requested without waiving statutory
        remedies.
      </p>
      <p>
        Disclosed and accepted layer lines or process limitations differ from
        failure to meet agreed requirements. Tell us about fit-critical
        requirements before ordering. We do not promise suitability for an
        undisclosed use.
      </p>
      <h2>Accessible service</h2>
      <p>
        If you need a different communication format or help using a form,
        contact us. We will discuss an accessible way to submit requirements and
        review a quote.
      </p>
      <LegalContact />
      <p>
        <Link href="/terms">Website terms</Link> ·{" "}
        <Link href="/privacy">Privacy policy</Link>
      </p>
    </main>
  );
}
