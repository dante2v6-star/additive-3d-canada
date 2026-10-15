"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import {
  ContactFields,
  FormNotice,
  sendRequest,
} from "./form-fields";
import { materials, MAX_REFERENCE_BYTES } from "@/config/pricing";
import { RequestConsent } from "./request-consent";
export function DesignForm() {
  const [busy, setBusy] = useState(false),
    [filename, setFilename] = useState(""),
    [fileError, setFileError] = useState(""),
    [status, setStatus] = useState<{
      kind: "success" | "error";
      text: string;
    } | null>(null);
  const requestId = useRef("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    const data = new FormData(e.currentTarget);
    data.set("kind", "design");
    if (!requestId.current) requestId.current = crypto.randomUUID();
    data.set("requestId", requestId.current);
    try {
      const result = await sendRequest(data);
      setStatus({ kind: "success", text: result.message });
    } catch (error) {
      setStatus({
        kind: "error",
        text:
          error instanceof Error ? error.message : "Unable to submit request.",
      });
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      className="design-form"
      onSubmit={submit}
      onChange={() => {
        requestId.current = "";
        setStatus(null);
      }}
    >
      <h2>Tell us about your project</h2>
      <ContactFields />
      <div className="field-grid">
        <label className="full">
          Describe what you need designed
          <textarea
            required
            minLength={20}
            maxLength={8000}
            name="description"
            rows={6}
            placeholder="What problem should the part solve? Describe the shape, important features and anything it needs to fit."
          />
        </label>
        <label>
          Intended use
          <input
            required
            name="intendedUse"
            maxLength={500}
            placeholder="e.g. Indoor sensor enclosure"
          />
        </label>
        <label>
          Approximate dimensions
          <input
            name="dimensions"
            maxLength={200}
            placeholder="e.g. 120 × 80 × 40 mm"
          />
        </label>
        <label>
          Desired material
          <select name="material" defaultValue="Other">
            {Object.entries(materials).map(([key, m]) => (
              <option value={key} key={key}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Quantity
          <input
            name="quantity"
            type="number"
            min={1}
            max={1000}
            defaultValue={1}
            required
          />
        </label>
        <label>
          Desired completion date <span className="optional">(optional)</span>
          <input type="date" name="deadline" />
        </label>
        <label className="full">
          Reference file <span className="optional">(optional)</span>
          <input
            type="file"
            name="file"
            accept=".png,.jpg,.jpeg,.webp,.pdf,.stl,.step,.stp,.iges,.igs"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setFileError("");
              if (f && f.size > MAX_REFERENCE_BYTES) {
                setFileError("Reference files must be 3 MB or smaller.");
                e.target.value = "";
                setFilename("");
              } else setFilename(f?.name || "");
            }}
          />
          <small>
            {filename ||
              "One image, sketch, PDF, STL, STEP or IGES file, up to 3 MB. For additional references, mention them in your description."}
          </small>
        </label>
      </div>
      <label className="checkbox">
        <input type="checkbox" name="acknowledged" value="true" required />
        <span>
          I agree to be contacted about this request and understand that design
          pricing will be confirmed after review.
        </span>
      </label>
      <p className="micro">
        Your project details are used to respond to your request.{" "}
        <Link href="/privacy">Privacy Policy</Link>
      </p>
      {fileError && (
        <p className="field-error" role="alert">
          {fileError}
        </p>
      )}
      <RequestConsent />
      <FormNotice status={status} />
      <button className="button" disabled={busy || status?.kind === "success"}>
        {busy
          ? "Sending your request…"
          : status?.kind === "success"
            ? "Request received"
            : "Request Design Quote"}
      </button>
    </form>
  );
}
