import type { Metadata } from "next";
import { DesignForm } from "@/components/design-form";
export const metadata: Metadata = {
  title: "Custom CAD Design London Ontario",
  description:
    "Need a custom part designed? Share your idea, dimensions and reference files for a personal CAD design quote in London, Ontario.",
};
export default function DesignPage() {
  return (
    <main id="main" className="container section">
      <div className="design-page-grid">
        <div className="design-intro">
          <div className="eyebrow">FROM IDEA TO PRINTABLE PART</div>
          <h1>
            Need a Custom
            <br />
            Part <em>Designed?</em>
          </h1>
          <p className="lead">
            You bring the problem.
            <br />
            We’ll help shape the solution.
          </p>
          <p className="muted">
            Share a sketch, a reference, or a description of what you need.
            We’ll review the requirements and personally respond with a custom
            CAD/design quote.
          </p>
          <div className="process-list">
            <div>
              <span>01</span>
              <p>
                <strong>Tell us what matters</strong>Intended use, dimensions,
                fit and function.
              </p>
            </div>
            <div>
              <span>02</span>
              <p>
                <strong>Get a personal design quote</strong>Scope and cost
                agreed before work begins.
              </p>
            </div>
            <div>
              <span>03</span>
              <p>
                <strong>Bring it into the real world</strong>Move from a digital
                model to local manufacturing.
              </p>
            </div>
          </div>
          <p className="micro">London, Ontario · Local pickup available</p>
        </div>
        <DesignForm />
      </div>
    </main>
  );
}
