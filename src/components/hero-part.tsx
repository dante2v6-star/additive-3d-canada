"use client";
import dynamic from "next/dynamic";
const Preview = dynamic(() => import("./part-preview"), {
  ssr: false,
  loading: () => (
    <div className="part-preview hero-preview">
      <p className="preview-fallback">Loading sample geometry…</p>
    </div>
  ),
});
export function HeroPart() {
  return (
    <div className="hero-specimen">
      <div className="specimen-top">
        <span>DESIGN → MANUFACTURE</span>
        <span>01 / FDM</span>
      </div>
      <Preview hero />
      <div className="specimen-bottom">
        <div>
          <strong>Built around your part.</strong>
          <span>Explore the sample · Drag to rotate</span>
        </div>
        <span className="specimen-label">CAD STUDY</span>
      </div>
    </div>
  );
}
