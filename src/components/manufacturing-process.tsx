import Image from "next/image";
export function ManufacturingProcess() {
  return (
    <div className="manufacturing-process">
      <article className="process-card">
        <div className="process-media process-references">
          <div>
            <Image
              src="/process/customer-reference.jpg"
              alt="Customer reference showing an existing circular emblem and its shape"
              fill
              sizes="(max-width: 700px) 45vw, 16vw"
              style={{ objectFit: "contain" }}
            />
          </div>
          <div>
            <Image
              src="/process/design-direction.jpg"
              alt="Customer artwork showing the desired Forged/Standard emblem design"
              fill
              sizes="(max-width: 700px) 45vw, 16vw"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
        <div className="process-copy">
          <span className="process-number">01 / YOUR IDEA</span>
          <h3>Send your design &amp; constraints.</h3>
          <p>
            Share reference photos, artwork, dimensions and what the part needs
            to do. We start by understanding the look, fit and requirements.
          </p>
        </div>
      </article>
      <article className="process-card">
        <div className="process-media">
          <Image
            src="/process/solidworks-design.png"
            alt="SolidWorks CAD design of the Forged/Standard emblem for customer review"
            fill
            sizes="(max-width: 700px) 100vw, 33vw"
            style={{ objectFit: "contain" }}
          />
        </div>
        <div className="process-copy">
          <span className="process-number">02 / DESIGN &amp; REVIEW</span>
          <h3>Review your SolidWorks design.</h3>
          <p>
            I create your model in SolidWorks and share it with you. We review
            the details and make any needed edits until the design meets your
            requirements.
          </p>
          <span className="process-approval">
            Your approval comes before printing.
          </span>
        </div>
      </article>
      <article className="process-card">
        <div className="process-media">
          <Image
            src="/process/finished-print.jpeg"
            alt="Finished black and white 3D printed Forged/Standard emblem held beside the printer"
            fill
            sizes="(max-width: 700px) 100vw, 33vw"
            style={{ objectFit: "cover", objectPosition: "center 56%" }}
          />
        </div>
        <div className="process-copy">
          <span className="process-number">03 / MAKE IT REAL</span>
          <h3>Print the approved part.</h3>
          <p>
            Once you approve the design, I manufacture your part. Your idea
            becomes a physical print, ready for the pickup or delivery
            arrangements we agreed.
          </p>
        </div>
      </article>
    </div>
  );
}
