"use client";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Upload, FileBox, X, Info, Check } from "lucide-react";
import { materials, colours, MAX_FILE_BYTES } from "@/config/pricing";
import { estimate, cad } from "@/lib/quote";
import { useQuoteTool } from "@/lib/use-quote-tool";
import { RequestConsent } from "./request-consent";
import type { Analysis, Settings } from "@/lib/models";
import {
  ContactFields,
  FormNotice,
  sendRequest,
} from "./form-fields";
const Preview = dynamic(() => import("./part-preview"), {
  ssr: false,
  loading: () => <div className="part-preview">Loading preview…</div>,
});
const defaults: Settings = {
  material: "PLA",
  quantity: 1,
  quality: "standard",
  infill: 20,
  colour: "Black",
};
export function QuoteForm() {
  const [file, setFile] = useState<File | null>(null),
    [analysis, setAnalysis] = useState<Analysis | null>(null),
    [positions, setPositions] = useState<Float32Array>(),
    [settings, setSettings] = useState<Settings>(defaults),
    [drag, setDrag] = useState(false),
    [loading, setLoading] = useState(false),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState<{
      kind: "success" | "error";
      text: string;
    } | null>(null),
    [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const requestId = useRef("");
  const sequence = useRef(0);
  const quote = analysis ? estimate(analysis, settings) : null;
  useQuoteTool(quote);
  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
    requestId.current = "";
    setStatus(null);
  };
  async function choose(next?: File) {
    const seq = ++sequence.current;
    setLoading(false);
    setError("");
    setFile(null);
    setAnalysis(null);
    setPositions(undefined);
    setStatus(null);
    requestId.current = "";
    if (!next) {
      setLoading(false);
      return;
    }
    if (!/\.stl$/i.test(next.name) || next.size > MAX_FILE_BYTES) {
      setError("Choose an STL file up to 3 MB.");
      return;
    }
    setLoading(true);
    try {
      const { parseSTL } = await import("@/lib/stl");
      const result = parseSTL(await next.arrayBuffer());
      if (seq !== sequence.current) return;
      setFile(next);
      setAnalysis(result.analysis);
      setPositions(result.positions);
    } catch (e) {
      if (seq === sequence.current)
        setError(e instanceof Error ? e.message : "Unable to read this STL.");
    } finally {
      if (seq === sequence.current) setLoading(false);
    }
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || !analysis) {
      setError("Upload an STL before submitting a print request.");
      input.current?.focus();
      return;
    }
    setBusy(true);
    setStatus(null);
    const data = new FormData(event.currentTarget);
    data.set("kind", "print");
    data.set("file", file);
    Object.entries(settings).forEach(([k, v]) => data.set(k, String(v)));
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    data.set("manual", String(submitter?.value === "manual" || quote?.manual));
    if (!requestId.current) requestId.current = crypto.randomUUID();
    data.set("requestId", requestId.current);
    try {
      const r = await sendRequest(data);
      setStatus({ kind: "success", text: r.message });
    } catch (e) {
      setStatus({
        kind: "error",
        text:
          e instanceof Error ? e.message : "Request failed. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      className="quote-layout"
      onSubmit={submit}
      onChange={() => {
        requestId.current = "";
        setStatus(null);
      }}
    >
      <div className="quote-main">
        <div className="step-heading">
          <span>1</span>
          <h3>Upload your model</h3>
          <small>STL · millimetres</small>
        </div>
        <input
          ref={input}
          className="sr-only"
          id="stl-upload"
          aria-label="Upload STL file"
          type="file"
          accept=".stl"
          onChange={(e) => {
            void choose(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <div
          className={`dropzone ${drag ? "dragging" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            if (e.dataTransfer.files.length !== 1) {
              setError("Please upload one STL at a time.");
              return;
            }
            void choose(e.dataTransfer.files[0]);
          }}
        >
          {file ? (
            <div className="uploaded">
              <FileBox />
              <div>
                <strong>{file.name}</strong>
                <span>
                  {(file.size / 1024).toFixed(0)} KB ·{" "}
                  {analysis?.triangles.toLocaleString()} triangles
                </span>
              </div>
              <button
                type="button"
                aria-label="Remove STL file"
                onClick={() => void choose()}
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="upload-button"
              onClick={() => input.current?.click()}
              disabled={loading}
            >
              <div className="upload-icon">
                <Upload size={25} />
              </div>
              <strong>
                {loading ? "Analyzing geometry…" : "Drop your STL file here"}
              </strong>
              <span>
                or <b>browse files</b>
              </span>
              <small>Up to 3 MB · 60,000 triangles maximum</small>
            </button>
          )}
        </div>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        {positions && (
          <>
            <Preview positions={positions} />
            <p className="micro">
              Drag to rotate · Scroll to zoom · STL units assumed to be
              millimetres
            </p>
            <div className="geometry-stats">
              <div>
                <span>BOUNDING BOX</span>
                <strong>
                  {analysis?.dimensions.map((v) => v.toFixed(1)).join(" × ")} mm
                </strong>
              </div>
              <div>
                <span>ENCLOSED VOLUME</span>
                <strong>{analysis?.volumeCm3.toFixed(2)} cm³</strong>
              </div>
            </div>
            {analysis?.warnings.map((w) => (
              <p className="notice warning" key={w}>
                {w}
              </p>
            ))}
          </>
        )}
        <div className="step-heading">
          <span>2</span>
          <h3>Make it yours</h3>
        </div>
        <div className="field-grid">
          <label>
            Material
            <select
              aria-label="Material"
              value={settings.material}
              onChange={(e) =>
                update("material", e.target.value as Settings["material"])
              }
            >
              {Object.entries(materials).map(([key, m]) => (
                <option key={key} value={key}>
                  {m.label}
                </option>
              ))}
            </select>
            <small>{materials[settings.material].description}</small>
          </label>
          <label>
            Quantity
            <input
              aria-label="Quantity"
              type="number"
              min={1}
              max={1000}
              required
              value={settings.quantity}
              onChange={(e) =>
                update(
                  "quantity",
                  Math.max(
                    1,
                    Math.min(1000, Math.floor(Number(e.target.value) || 1)),
                  ),
                )
              }
            />
          </label>
          <label>
            Print quality
            <select
              aria-label="Print quality"
              value={settings.quality}
              onChange={(e) =>
                update("quality", e.target.value as Settings["quality"])
              }
            >
              <option value="draft">Draft · 0.28 mm</option>
              <option value="standard">Standard · 0.20 mm</option>
              <option value="fine">Fine · 0.12 mm</option>
            </select>
          </label>
          <label>
            Colour
            <select
              aria-label="Colour"
              value={settings.colour}
              onChange={(e) => update("colour", e.target.value)}
            >
              {colours.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="full">
            Infill <span className="range-value">{settings.infill}%</span>
            <input
              aria-label="Infill percentage"
              type="range"
              min={10}
              max={100}
              step={5}
              value={settings.infill}
              onChange={(e) => update("infill", Number(e.target.value))}
            />
            <small>
              20% is a useful starting point for general-purpose parts.
            </small>
          </label>
          <label className="full">
            Notes <span className="optional">(optional)</span>
            <textarea
              name="notes"
              maxLength={4000}
              rows={3}
              placeholder="Fit requirements, colour preferences, deadlines, or anything we should know."
            />
          </label>
        </div>
        <div className="step-heading">
          <span>3</span>
          <h3>Where can we reach you?</h3>
        </div>
        <ContactFields />
        <label className="checkbox">
          <input name="acknowledged" type="checkbox" required value="true" />
          <span>
            I understand this is an estimated quote and may be adjusted after
            review.
          </span>
        </label>
        <p className="micro">
          Your file is sent only when you submit. See our{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
        <RequestConsent />
          <FormNotice status={status} />
        <div className="actions">
          <button
            className="button"
            type="submit"
            name="action"
            value="print"
            disabled={!file || busy || status?.kind === "success"}
          >
            {busy
              ? "Submitting…"
              : status?.kind === "success"
                ? "Request received"
                : quote?.manual
                  ? "Submit for Manual Review"
                  : "Submit Print Request"}
          </button>
          <button
            className="button secondary"
            type="submit"
            name="action"
            value="manual"
            disabled={!file || busy || status?.kind === "success"}
          >
            Request Manual Quote
          </button>
        </div>
        <p className="micro">
          No model yet?{" "}
          <Link href="/custom-design">
            Request a custom design or manual quote.
          </Link>
        </p>
      </div>
      <aside className="quote-summary">
        <div className="eyebrow">YOUR ESTIMATE</div>
        <div className="estimate-price" aria-live="polite">
          {quote && !quote.manual ? (
            <>
              {cad(quote.total)}
              <span>CAD</span>
            </>
          ) : quote?.manual ? (
            <strong className="manual-price">Manual review</strong>
          ) : (
            <>
              <span className="price-dash">—</span>
              <span>CAD</span>
            </>
          )}
        </div>
        <p className="minimum">Minimum order: $30 CAD</p>
        <p className="muted">
          {quote?.manual
            ? "We’ll review your file and send a price before production."
            : "An estimate today. A confirmed quote before we print."}
        </p>
        <div className="summary-lines">
          <div>
            <span>Material</span>
            <strong>{materials[settings.material].label}</strong>
          </div>
          <div>
            <span>Quantity</span>
            <strong>
              {settings.quantity} {settings.quantity === 1 ? "part" : "parts"}
            </strong>
          </div>
          <div>
            <span>Quality</span>
            <strong className="capitalize">{settings.quality}</strong>
          </div>
          <div>
            <span>Infill</span>
            <strong>{settings.infill}%</strong>
          </div>
          {quote && !quote.manual && (
            <>
              <div>
                <span>Approx. material</span>
                <strong>{quote.weightGrams.toFixed(1)} g</strong>
              </div>
              <div>
                <span>Approx. machine time</span>
                <strong>
                  {quote.hours < 0.1 ? "<0.1" : quote.hours.toFixed(1)} h
                </strong>
              </div>
            </>
          )}
        </div>
        <div className="estimate-note">
          <Info size={18} />
          <p>
            Geometry-based estimate, not a sliced toolpath. Supports,
            orientation and finishing may affect the final price. Taxes and
            shipping excluded.
          </p>
        </div>
        <div className="summary-footer">
          <Check size={17} />
          <span>
            Reviewed by a real person
            <br />
            Manufactured locally
          </span>
        </div>
      </aside>
    </form>
  );
}
