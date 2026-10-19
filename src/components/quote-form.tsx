"use client";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Upload, FileBox, X, Info, Check } from "lucide-react";
import { materials, colours, MAX_FILE_BYTES, MAX_TRIANGLES } from "@/config/pricing";
import { estimateOrder, cad } from "@/lib/quote";
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
  type Part = { id: string; file: File; analysis: Analysis; positions: Float32Array; quantity: number };
  const [parts, setParts] = useState<Part[]>([]);
  const [selected, setSelected] = useState("");
  const [settings, setSettings] = useState<Settings>(defaults);
  const [drag, setDrag] = useState(false), [loading, setLoading] = useState(false), [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null), requestId = useRef("");
  const adding = useRef(false);
  const active = parts.find(part => part.id === selected) || parts[0];
  const quote = parts.length ? estimateOrder(parts, settings) : null;
  useQuoteTool(quote);
  function changed() { requestId.current = ""; setStatus(null); }
  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(current => ({ ...current, [key]: value })); changed();
  };
  async function choose(files: File[]) {
    if (adding.current || busy || !files.length) return;
    adding.current = true; setLoading(true); setError(""); changed();
    try {
      if (parts.length + files.length > 5) throw new Error("Add up to five STL files per request.");
      if (parts.reduce((sum, part) => sum + part.quantity, 0) + files.length > 1000) throw new Error("Reduce quantities before adding another design; the maximum is 1,000 printed parts.");
      if (parts.reduce((sum, part) => sum + part.file.size, 0) + files.reduce((sum, file) => sum + file.size, 0) > MAX_FILE_BYTES)
        throw new Error("Your STL files must total 7 MB or less. Remove a part or export smaller files.");
      const { parseSTL } = await import("@/lib/stl");
      const added: Part[] = [];
      for (const file of files) {
        if (!/\.stl$/i.test(file.name)) throw new Error("Choose STL files only.");
        const parsed = parseSTL(await file.arrayBuffer());
        added.push({ id: crypto.randomUUID(), file, ...parsed, quantity: 1 });
      }
      if ([...parts, ...added].reduce((sum, part) => sum + part.analysis.triangles, 0) > MAX_TRIANGLES)
        throw new Error("The selected files exceed 60,000 triangles combined. Export simpler meshes.");
      setParts(current => [...current, ...added]); setSelected(added[0].id);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to read these STL files."); }
    finally { adding.current = false; setLoading(false); }
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!parts.length || loading || busy) return;
    setBusy(true); setStatus(null);
    const data = new FormData(event.currentTarget);
    data.set("kind", "print"); data.delete("file");
    for (const part of parts) data.append("file", part.file);
    data.set("partQuantities", JSON.stringify(parts.map(part => part.quantity)));
    Object.entries(settings).forEach(([key, value]) => data.set(key, String(value)));
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    data.set("manual", String(submitter?.value === "manual" || quote?.manual));
    if (!requestId.current) requestId.current = crypto.randomUUID();
    data.set("requestId", requestId.current);
    try { const result = await sendRequest(data); setStatus({ kind: "success", text: result.message }); }
    catch (e) { setStatus({ kind: "error", text: e instanceof Error ? e.message : "Request failed. Please try again." }); }
    finally { setBusy(false); }
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
        <div className="step-heading"><span>1</span><h3>Add your parts</h3><small>STL · millimetres</small></div>
        <input ref={input} className="sr-only" id="stl-upload" aria-label="Upload STL files" type="file" accept=".stl" multiple disabled={loading || busy}
          onChange={event => { void choose(Array.from(event.target.files || [])); event.target.value = ""; }} />
        <div className={`dropzone ${drag ? "dragging" : ""}`} onDragOver={event => { event.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
          onDrop={event => { event.preventDefault(); setDrag(false); void choose(Array.from(event.dataTransfer.files)); }}>
          <button type="button" className="upload-button" onClick={() => input.current?.click()} disabled={loading || busy || parts.length >= 5}>
            <div className="upload-icon"><Upload size={25} /></div>
            <strong>{loading ? "Analyzing geometry…" : parts.length ? "Add more STL parts" : "Drop your STL files here"}</strong>
            <span>or <b>browse files</b></span><small>Up to 5 files · 7 MB and 60,000 triangles combined</small>
          </button>
        </div>
        <p className="micro">Different designs can share one request. The $30 CAD minimum applies once to the combined order.</p>
        {error && <p className="field-error" role="alert">{error}</p>}
        <div className="part-list">
          {parts.map((part, index) => <div className={`part-row ${active?.id === part.id ? "selected" : ""}`} key={part.id}>
            <button type="button" className="part-select" aria-label={`Preview part ${index + 1}: ${part.file.name}`} aria-pressed={active?.id === part.id} onClick={() => setSelected(part.id)}>
              <FileBox size={20} /><span><strong>{part.file.name}</strong><small>{(part.file.size / 1024).toFixed(0)} KB · {part.analysis.triangles.toLocaleString()} triangles</small></span>
            </button>
            <label>Quantity<input aria-label={`Quantity for part ${index + 1}`} type="number" min={1} max={1000 - parts.filter(other => other.id !== part.id).reduce((sum, other) => sum + other.quantity, 0)} required value={part.quantity} disabled={busy || loading}
              onChange={event => { const otherCount = parts.filter(other => other.id !== part.id).reduce((sum, other) => sum + other.quantity, 0); const quantity = Math.max(1, Math.min(1000 - otherCount, Math.floor(Number(event.target.value) || 1))); setParts(current => current.map(item => item.id === part.id ? { ...item, quantity } : item)); changed(); }} /></label>
            <button type="button" className="part-remove" aria-label={`Remove part ${index + 1}: ${part.file.name}`} disabled={busy || loading} onClick={() => { setParts(current => current.filter(item => item.id !== part.id)); setError(""); changed(); }}><X size={18} /></button>
          </div>)}
        </div>
        {active && <>
          <p className="micro">Preview: {active.file.name}</p><Preview positions={active.positions} />
          <p className="micro">Drag to rotate · Scroll to zoom · STL units assumed to be millimetres</p>
          <div className="geometry-stats"><div><span>BOUNDING BOX</span><strong>{active.analysis.dimensions.map(value => value.toFixed(1)).join(" × ")} mm</strong></div><div><span>ENCLOSED VOLUME</span><strong>{active.analysis.volumeCm3.toFixed(2)} cm³</strong></div></div>
          {active.analysis.warnings.map(warning => <p className="notice warning" key={warning}>{warning}</p>)}
        </>}
        <div className="step-heading">
          <span>2</span>
          <h3>Print settings</h3>
        </div>
        <p className="micro">These material, colour, quality and infill settings apply to all parts in this request.</p>
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
          Your files are sent only when you submit. See our{" "}
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
            disabled={!parts.length || loading || busy || status?.kind === "success"}
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
            disabled={!parts.length || loading || busy || status?.kind === "success"}
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
        <div className="eyebrow">COMBINED ORDER ESTIMATE</div>
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
        <p className="minimum">One $30 CAD minimum for all parts</p>
        <p className="muted">
          {quote?.manual
            ? "We’ll review your files and send a price before production."
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
              {quote?.settings.quantity || 0} printed parts · {parts.length} {parts.length === 1 ? "design" : "designs"}
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
