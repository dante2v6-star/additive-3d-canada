"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";
export function ContactFields() {
  return (
    <div className="field-grid">
      <label>
        Full name
        <input
          name="name"
          autoComplete="name"
          required
          minLength={2}
          maxLength={100}
          placeholder="Your full name"
        />
      </label>
      <label>
        Email
        <input
          name="email"
          autoComplete="email"
          type="email"
          required
          maxLength={254}
          placeholder="you@company.ca"
        />
      </label>
      <label>
        Phone number
        <input
          name="phone"
          autoComplete="tel"
          type="tel"
          required
          minLength={7}
          maxLength={30}
          pattern="[+0-9\(\) .\-]{7,30}"
          placeholder="+1 (519) 555-0123"
        />
      </label>
      <label className="honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
type TurnstileAPI = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileAPI;
  }
}
export function SpamProtection() {
  const el = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  useEffect(() => {
    if (!ready || !el.current || !window.turnstile || !sitekey) return;
    const id = window.turnstile.render(el.current, { sitekey, theme: "light" });
    return () => window.turnstile?.remove(id);
  }, [ready, sitekey]);
  return sitekey ? (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onReady={() => setReady(true)}
      />
      <div ref={el} />
    </>
  ) : null;
}
export function FormNotice({
  status,
}: {
  status: { kind: "success" | "error"; text: string } | null;
}) {
  return status ? (
    <div
      role={status.kind === "error" ? "alert" : "status"}
      className={`notice ${status.kind}`}
    >
      {status.text}
    </div>
  ) : null;
}
export async function sendRequest(form: FormData) {
  const { prepareValidationForm } = await import("@/lib/prepare-upload");
  const validation = await prepareValidationForm(form);
  const response = await fetch("/api/requests", { method: "POST", body: validation });
  const payload = await response.json().catch(() => ({
    error: "The server could not process your request. Please try again.",
  }));
  if (!response.ok)
    throw new Error(payload.error || "Unable to submit your request.");
  if (payload.prepared) {
    const submission = new FormData();
    for (const [key, value] of Object.entries(payload.fields as Record<string, string>)) {
      submission.set(key, value);
    }
    const files = form.getAll("file").filter((file): file is File => file instanceof File && file.size > 0);
    files.forEach((file, index) => submission.set(index === 0 ? "file" : `file${index + 1}`, file));
    // This static HTML endpoint is registered by Netlify at deploy time.
    // Leave Content-Type to the browser so multipart file boundaries are correct.
    const stored = await fetch("/__forms.html", { method: "POST", body: submission });
    if (!stored.ok) throw new Error("Your request could not be submitted. Please retry or contact us by email. No order has been placed.");
  }
  return payload as { message: string; id: string };
}
