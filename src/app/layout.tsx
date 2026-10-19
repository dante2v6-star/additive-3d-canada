import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { business } from "@/config/business";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(business.url),
  title: {
    default: `3D Printing London Ontario | ${business.name}`,
    template: `%s | ${business.name}`,
  },
  description:
    "Professional 3D printing, additive manufacturing and custom CAD design in London, Ontario. Upload an STL for an estimate. Local pickup at 1235 Richmond St.",
  openGraph: {
    type: "website",
    locale: "en_CA",
    title: "Professional 3D printing in London, Ontario",
    description:
      "Functional parts, engineering prototypes and custom CAD design. Get an STL estimate.",
    siteName: business.name,
    url: business.url,
    images: [{ url: "/social-preview-v3", width: 1200, height: 630, alt: "Additive 3D — 3D Printing and Custom CAD Design" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Additive 3D | 3D Printing & Custom CAD Design",
    description: "Your next idea. Made real. Local additive manufacturing in London, Ontario.",
    images: ["/social-preview-v3"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
