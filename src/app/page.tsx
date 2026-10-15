import Link from "next/link";
import { ManufacturingProcess } from "@/components/manufacturing-process";
import {
  Box,
  Layers3,
  Settings2,
  Ruler,
  Workflow,
  PenTool,
  Wrench,
  PackageCheck,
  MapPin,
  Check,
  Upload,
  SlidersHorizontal,
} from "lucide-react";
import { HeroPart } from "@/components/hero-part";
import { QuoteForm } from "@/components/quote-form";
import { business } from "@/config/business";
const services = [
  [
    "FDM 3D Printing",
    "Reliable, versatile printing for your next idea.",
    Layers3,
  ],
  [
    "Engineering Prototypes",
    "Test fit, form and function before committing.",
    Ruler,
  ],
  ["Functional Parts", "Purpose-built components for everyday use.", Settings2],
  ["Engineering Materials", "Nylon, carbon fiber nylon and more.", Box],
  [
    "Small-Batch Production",
    "Make one part. Or make your first hundred.",
    Workflow,
  ],
  [
    "Custom CAD Design",
    "Turn a sketch or problem into a printable model.",
    PenTool,
  ],
  [
    "Replacement Parts",
    "Explore a custom solution for a missing part.",
    Wrench,
  ],
  [
    "Product Prototyping",
    "Iterate, refine and take the next step.",
    PackageCheck,
  ],
] as const;
const faqs = [
  [
    "What file types do you accept?",
    "The instant estimator accepts binary and ASCII STL files up to 3 MB, with up to 60,000 triangles. Export your model in millimetres. For custom design, attach an image, PDF, STL, STEP or IGES file. Larger or unusual files can be discussed through a manual request.",
  ],
  [
    "What is the minimum order?",
    "The minimum order is $30 CAD. Smaller parts and quantities are priced at this minimum. Taxes and any agreed shipping are additional.",
  ],
  [
    "How long does printing take?",
    "Timing depends on the part, material, quantity and current capacity. We confirm a production timeline after reviewing your request. Let us know if you have a deadline.",
  ],
  [
    "What materials do you offer?",
    "Initial options include PLA, PETG, ABS, ASA, TPU, Nylon and Carbon Fiber Nylon. Material and colour availability are confirmed before production.",
  ],
  [
    "Can you design a part for me?",
    "Yes. Use the custom design form to share your idea, measurements, intended use and references. We will respond with a CAD/design quote.",
  ],
  [
    "Can I pick up locally?",
    "Yes. Local pickup is available at 1235 Richmond St, London, Ontario. Please arrange a pickup time after your order is ready.",
  ],
  [
    "Do you ship?",
    "Ask about shipping in your request. Availability, delivery options and shipping costs are confirmed separately before production.",
  ],
  [
    "How accurate are instant quotes?",
    "Quotes use STL geometry and configurable assumptions, not a production slicer. Print time, material, supports and manufacturability are estimates. We review your file and confirm the final price before production.",
  ],
];
export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    url: business.url,
    description:
      "3D printing, additive manufacturing and custom CAD design in London, Ontario.",
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressLocality: "London",
      addressRegion: "ON",
      addressCountry: "CA",
    },
    areaServed: "London, Ontario",
  };
  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="line" /> LOCAL EXPERTISE. LAYER BY LAYER.
          </div>
          <h1>
            Your next idea.
            <br />
            Made <em>real.</em>
          </h1>
          <p className="hero-subtitle">
            Professional 3D Printing &amp; Additive Manufacturing in London,
            Ontario
          </p>
          <p className="muted hero-description">
            Upload your part, get an instant estimate, and have it manufactured
            locally.
          </p>
          <div className="actions">
            <Link className="button" href="#quote">
              <Upload size={18} />
              Upload STL
            </Link>
            <Link className="button secondary" href="/custom-design">
              Request Custom Design
            </Link>
          </div>
          <div className="hero-details">
            <span>
              <MapPin size={15} />
              London, Ontario
            </span>
            <span>Minimum order: $30 CAD</span>
          </div>
        </div>
        <HeroPart />
      </section>
      <div className="capabilities-strip">
        <div className="container">
          <span>FROM FIRST PROTOTYPE TO PRODUCTION</span>
          <span>Functional parts</span>
          <span>Engineering materials</span>
          <span>Local pickup</span>
        </div>
      </div>
      <section id="quote" className="section quote-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <div className="eyebrow">01 / GET STARTED</div>
              <h2>
                A part. A file.
                <br />
                An instant estimate.
              </h2>
            </div>
            <p>
              See what it could take to bring your model to life.
              <br />
              Configure your print, then send it for review.
            </p>
          </div>
          <QuoteForm />
        </div>
      </section>
      <section id="services" className="section container">
        <div className="section-heading">
          <div>
            <div className="eyebrow">02 / OUR CAPABILITIES</div>
            <h2>
              Made for the way
              <br />
              you build.
            </h2>
          </div>
          <p>
            From a single functional component to a small production run, we
            help you move from concept to part.
          </p>
        </div>
        <div className="services-grid">
          {services.map(([name, text, Icon], i) => (
            <article className="service-card" key={name}>
              <div className="service-top">
                <Icon size={25} />
                <span>0{i + 1}</span>
              </div>
              <h3>{name}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="why-section">
        <div className="container why-grid">
          <div>
            <div className="eyebrow">ENGINEERING MINDSET. LOCAL SERVICE.</div>
            <h2>
              A better way to
              <br />
              make what’s next.
            </h2>
            <p>
              Practical support at every stage, with a local business you can
              talk to about the details that matter.
            </p>
            <Link href="/custom-design" className="button light">
              Discuss your project
            </Link>
          </div>
          <div className="benefits">
            {[
              "Local London, Ontario service",
              "Turnaround planned around your project",
              "Engineering-focused approach",
              "Wide material selection",
              "Custom design support",
              "Low-volume manufacturing",
              "Convenient local pickup",
            ].map((x) => (
              <div key={x}>
                <Check size={19} />
                {x}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="process" className="section container">
        <div className="section-heading">
          <div>
            <div className="eyebrow">03 / HOW YOUR PART GETS MADE</div>
            <h2>
              Your idea. Your input.
              <br />A part made for you.
            </h2>
          </div>
          <p>
            From your first reference to the finished print, you are part of the
            process. We review the design together before anything gets made.
          </p>
        </div>
        <ManufacturingProcess />
      </section>
      <section className="story-section container">
        <div>
          <div className="eyebrow">OUR STORY</div>
          <h2>
            A small beginning.
            <br />A full-time pursuit.
          </h2>
        </div>
        <div>
          <p>
            Additive 3D started in a dorm room with a simple goal: pay back the
            cost of a first 3D printer. It grew into a full-time business built
            around design, engineering and making useful things.
          </p>
          <p>
            Today, that same hands-on approach connects material science, custom
            CAD and manufacturing. From custom fender tags for classic cars to
            one-off components, the work starts with understanding what each
            customer needs.
          </p>
          <p className="story-signature">
            3D Printing · Custom CAD Design · Realistic Rendering
          </p>
        </div>
      </section>
      <section className="design-banner container">
        <div>
          <div className="eyebrow">NO MODEL? NO PROBLEM.</div>
          <h2>
            Need a Custom
            <br />
            Part Designed?
          </h2>
          <p>
            A sketch, a broken component, or just an idea.
            <br />
            Tell us what you need. We’ll help define the next step.
          </p>
          <Link className="button" href="/custom-design">
            Request Custom Design
          </Link>
        </div>
        <div className="design-steps">
          {[
            [PenTool, "01", "Describe your idea"],
            [SlidersHorizontal, "02", "Review a design quote"],
            [PackageCheck, "03", "Move toward manufacturing"],
          ].map(([Icon, num, text]) => {
            const I = Icon as typeof PenTool;
            return (
              <div key={String(num)}>
                <I size={23} />
                <span>{String(num)}</span>
                <strong>{String(text)}</strong>
              </div>
            );
          })}
        </div>
      </section>
      <section id="faq" className="section container faq-grid">
        <div>
          <div className="eyebrow">04 / A FEW GOOD QUESTIONS</div>
          <h2>
            Before we
            <br />
            press print.
          </h2>
          <p className="muted">The details, without the guesswork.</p>
        </div>
        <div>
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span>+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section id="contact" className="contact-section">
        <div className="container contact-grid">
          <div>
            <div className="eyebrow">05 / RIGHT HERE IN LONDON</div>
            <h2>
              Let’s make
              <br />
              something useful.
            </h2>
            <p>
              <strong>{business.address}</strong>
              <br />
              {business.city}
              <br />
              Local pickup available by arrangement.
            </p>
            <div className="contact-details">
              <div>
                <span>EMAIL</span>
                {business.email ? (
                  <a href={`mailto:${business.email}`}>{business.email}</a>
                ) : (
                  <span>Email to be added</span>
                )}
              </div>
              <div>
                <span>PHONE</span>
                {business.phone ? (
                  <a href={`tel:${business.phone}`}>{business.phone}</a>
                ) : (
                  <span>Phone to be added</span>
                )}
              </div>
              <div>
                <span>BUSINESS HOURS</span>
                <span>{business.hours}</span>
              </div>
            </div>
          </div>
          <div className="map-placeholder">
            <MapPin size={36} />
            <h3>1235 Richmond St</h3>
            <p>London, Ontario</p>
            <a
              className="button secondary"
              href="https://www.google.com/maps/search/?api=1&query=1235+Richmond+St+London+Ontario"
              target="_blank"
              rel="noreferrer"
            >
              Open in Google Maps
            </a>
            <small>Map opens in a new tab</small>
          </div>
        </div>
      </section>
    </main>
  );
}
