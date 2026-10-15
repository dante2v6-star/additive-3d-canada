import { createHash } from "node:crypto";
import type { StoredFile, Customer } from "../models";
import { business } from "@/config/business";
export type EmailMessage = {
  from: string;
  to: string[];
  subject: string;
  reply_to?: string;
  html: string;
  text: string;
  attachments?: { filename: string; content: string }[];
};
export type MailTransport = (
  message: EmailMessage,
  idempotencyKey: string,
) => Promise<void>;
export const resendTransport: MailTransport = async (message, key) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": key,
    },
    body: JSON.stringify(message),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new Error(
      "Email delivery could not be confirmed. Retry your request; duplicate messages are protected.",
    );
};
export const escapeHtml = (value: unknown) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export async function deliverRequest({
  id,
  kind,
  customer,
  details,
  file,
  transport = resendTransport,
}: {
  id: string;
  kind: "print" | "design";
  customer: Customer;
  details: Record<string, unknown>;
  file?: StoredFile;
  transport?: MailTransport;
}) {
  const from = process.env.RESEND_FROM!,
    to = process.env.BUSINESS_EMAIL!;
  const fields = {
    "Request ID": id,
    "Request type": kind === "print" ? "Print request" : "Custom design",
    "Full name": customer.name,
    "Phone number": customer.phone,
    Email: customer.email,
    ...details,
  };
  const text = Object.entries(fields)
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join("\n\n");
  const html = `<div style="font-family:Arial,sans-serif;color:#17212c;max-width:700px"><h1>New ${kind === "print" ? "print" : "design"} request</h1><p style="font-size:20px"><strong>Phone: ${escapeHtml(customer.phone)}</strong></p><table style="width:100%;border-collapse:collapse">${Object.entries(
    fields,
  )
    .map(
      ([k, v]) =>
        `<tr><th style="text-align:left;vertical-align:top;padding:10px;border-bottom:1px solid #ddd">${escapeHtml(k)}</th><td style="padding:10px;border-bottom:1px solid #ddd;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
    )
    .join(
      "",
    )}</table><p>Review attachment and manufacturing requirements before confirming price.</p></div>`;
  // Content hash prevents reusing a key for a changed request; retry of identical payload is safe.
  const hash = createHash("sha256")
    .update(
      Object.entries(fields)
        .filter(([key]) => key !== "Consent recorded at")
        .map(([key, value]) => `${key}: ${String(value)}`)
        .join("\n\n"),
    )
    .update(file?.bytes || new Uint8Array())
    .digest("hex")
    .slice(0, 24);
  const key = `${id}-${hash}`;
  await transport(
    {
      from,
      to: [to],
      subject: `${kind === "print" ? "Print" : "Design"} request · ${id.slice(0, 8)}`,
      reply_to: customer.email,
      html,
      text,
      ...(file
        ? {
            attachments: [
              {
                filename: file.name,
                content: Buffer.from(file.bytes).toString("base64"),
              },
            ],
          }
        : {}),
    },
    `${key}-business`,
  );
  const confirmation = `Hi ${customer.name},\n\nWe received your ${kind === "print" ? "print" : "custom design"} request. Your reference is ${id}. We will personally review your project and respond with the next steps.\n\nAny displayed print price is an estimate; final pricing and timing are confirmed before production. Minimum print order: $30 CAD.\n\n${business.name}\n${business.postalAddress}`;
  await transport(
    {
      from,
      to: [customer.email],
      reply_to: to,
      subject: `We received your request · ${id.slice(0, 8)}`,
      text: confirmation,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.7;white-space:pre-wrap">${escapeHtml(confirmation)}</div>`,
    },
    `${key}-customer`,
  );
}
