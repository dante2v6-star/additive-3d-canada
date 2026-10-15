import Link from "next/link";
import { Brand } from "./brand";
import { business, navigation } from "@/config/business";
export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand">
            <Brand />
          </div>
          <p>
            From a digital file to something real.
            <br />
            Made locally in London, Ontario.
          </p>
          <p>
            {business.address}
            <br />
            {business.city}
            <br />
            Local pickup available.
          </p>
        </div>
        <div>
          <h3>Explore</h3>
          {navigation.slice(1).map(([label, href]) => (
            <Link key={label} href={href}>
              {label}
            </Link>
          ))}
        </div>
        <div>
          <h3>Let’s make your next part.</h3>
          <Link href="/#quote">Get a print estimate</Link>
          <Link href="/custom-design">Request custom CAD design</Link>
          {business.email && (
            <a href={`mailto:${business.email}`}>{business.email}</a>
          )}
          {business.phone && (
            <a href={`tel:${business.phone}`}>{business.phone}</a>
          )}
          <p>Minimum order: $30 CAD</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} {business.name}
        </span>
        <div>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/order-policy">Order Policy</Link>
        </div>
        <span>London, Ontario · Canada</span>
      </div>
    </footer>
  );
}
