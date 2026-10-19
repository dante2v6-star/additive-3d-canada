import { NextResponse } from "next/server";
import { z } from "zod";
import { commonSchema, settingsSchema, designSchema } from "@/lib/validation";
import { validateFile } from "@/lib/server/files";
import { storage } from "@/lib/server/storage";
import { protect } from "@/lib/server/security";
import { deliverRequest } from "@/lib/server/email";
import { estimateOrder, cad } from "@/lib/quote";
import { materials, MAX_TRIANGLES } from "@/config/pricing";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  const origin = request.headers.get("origin");
  const allowed = configuredOrigin
    ? [new URL(configuredOrigin).origin]
    : ["http://localhost:3000", "http://127.0.0.1:3000"];
  if (!origin || !allowed.includes(origin))
    return NextResponse.json(
      { error: "Request origin is not allowed." },
      { status: 403 },
    );
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data"))
    return NextResponse.json(
      { error: "Submit a multipart form." },
      { status: 415 },
    );
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 3.5 * 1024 * 1024)
    return NextResponse.json(
      { error: "Validation request too large. Reload the page and try again; large STLs are compacted automatically." },
      { status: 413 },
    );
  try {
    // Bound actual bytes as well as Content-Length (which is untrusted).
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Missing request body.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 3.5 * 1024 * 1024) {
        await reader.cancel();
        return NextResponse.json(
          { error: "Validation request too large. Reload the page and try again; large STLs are compacted automatically." },
          { status: 413 },
        );
      }
      chunks.push(value);
    }
    const body = Buffer.concat(chunks);
    const data = await new Response(body, {
      headers: { "Content-Type": request.headers.get("content-type")! },
    }).formData();
    const raw = Object.fromEntries(data.entries());
    const common = commonSchema.parse(raw);
    const customer = {
      name: common.name,
      email: common.email,
      phone: common.phone,
    };
    let details: Record<string, unknown>;
    let attachment;
    const inputs = data.getAll("file").filter((input): input is File => input instanceof File && input.size > 0);
    if (inputs.length > 5) throw new Error("Add up to five STL files per request.");
    if (inputs.length > 1 && common.kind !== "print") throw new Error("Attach one design reference file.");
    if (inputs.length > 1 && process.env.DEPLOYMENT_PLATFORM !== "netlify") throw new Error("Multi-part requests require Netlify Forms.");
    const input = inputs[0];
    const file = input instanceof File && input.size > 0 ? input : undefined;
    if (common.kind === "print") {
      if (!file)
        throw new Error("An STL file is required for a print request.");
      const settings = settingsSchema.parse(raw);
      const quantities = raw.partQuantities === undefined ? inputs.map(() => settings.quantity) : z.array(z.number().int().min(1).max(1000)).min(1).max(5).parse(JSON.parse(String(raw.partQuantities)));
      if (quantities.length !== inputs.length) throw new Error("Each STL must have a quantity.");
      const parts = [];
      for (let index = 0; index < inputs.length; index++) {
        const analysis = await validateFile(inputs[index], true);
        if (!analysis) throw new Error("Unable to analyze STL.");
        parts.push({ analysis, quantity: quantities[index] });
      }
      if (parts.reduce((sum, part) => sum + part.analysis.triangles, 0) > MAX_TRIANGLES) throw new Error("The STL files exceed 60,000 triangles combined.");
      const quote = estimateOrder(parts, settings);
      const analysis = quote.analysis;
      const notes = z
        .string()
        .max(4000)
        .parse(raw.notes || "");
      details = {
        "Review mode":
          raw.manual === "true" || quote.manual
            ? "Manual quote requested"
            : "Estimate review",
        Material: materials[settings.material].label,
        Colour: settings.colour,
        "STL designs": inputs.length,
        "Parts": parts.map((part, index) => `${index + 1}. ${inputs[index].name} — quantity ${part.quantity}; ${part.analysis.dimensions.map(value => value.toFixed(2)).join(" × ")} mm`).join("\n"),
        Quantity: quote.settings.quantity,
        "Print quality": settings.quality,
        Infill: `${settings.infill}%`,
        "Estimate CAD": quote.manual
          ? "Manual review required (minimum $30 CAD)"
          : `${cad(quote.total)} CAD`,
        "Minimum order": "$30 CAD applied once to the combined request",
        "Dimensions (mm)": analysis.dimensions
          .map((n) => n.toFixed(2))
          .join(" × "),
        "Enclosed volume (cm³)": analysis.volumeCm3.toFixed(3),
        "Approx. material (g)": quote.manual
          ? "Not reliable"
          : quote.weightGrams.toFixed(2),
        "Approx. machine hours": quote.manual
          ? "Not reliable"
          : quote.hours.toFixed(2),
        "Geometry warnings":
          analysis.warnings.join("; ") ||
          "None detected; still requires production review",
        Notes: notes,
        "Estimate acknowledged": "Yes",
        "Units assumption": "Millimetres; no production slicer used",
      };
    } else {
      const design = designSchema.parse(raw);
      if (file) await validateFile(file, false);
      details = {
        "Project description": design.description,
        "Intended use": design.intendedUse,
        "Approximate dimensions": design.dimensions,
        "Desired material": materials[design.material].label,
        Quantity: design.quantity,
        "Requested deadline": design.deadline || "Not specified",
        "Contact consent": "Yes",
      };
    }
    const consentDetails = {
      ...details,
      "Privacy consent": "Yes — request processing only; no marketing",
      "File-use permission": "Yes — evaluation and separately approved work",
      "Policy version": common.policyVersion,
      "Consent recorded at": new Date().toISOString(),
    };
    if (process.env.DEPLOYMENT_PLATFORM === "netlify") {
      // Prepare only. The browser posts directly to Netlify so its native spam
      // filters see the visitor's connection, rather than a proxy function's IP.
      return NextResponse.json({
        id: common.requestId,
        prepared: true,
        fields: {
          "form-name": common.kind === "print" ? "print-requests" : "design-requests",
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          requestId: common.requestId,
          kind: common.kind,
          details: Object.entries(consentDetails).map(([key, value]) => `${key}: ${String(value)}`).join("\n\n"),
          website: "",
        },
        message: `Your request has been submitted for review. Your reference is ${common.requestId.slice(0, 8)}. We will reply personally; no automatic confirmation email is sent. Production starts only after a separately approved quote.`,
      });
    }
    if (
      !process.env.RESEND_API_KEY ||
      !z.email().safeParse(process.env.BUSINESS_EMAIL).success ||
      !process.env.RESEND_FROM
    )
      return NextResponse.json(
        {
          error:
            "Online requests are not available yet. Email delivery must be configured by the business. Your request has not been sent.",
        },
        { status: 503 },
      );
    await protect(request, data);
    details = {
      ...details,
      "Privacy consent": "Yes — request processing only; no marketing",
      "File-use permission": "Yes — evaluation and separately approved work",
      "Policy version": common.policyVersion,
      "Consent recorded at": new Date().toISOString(),
    };
    if (file) attachment = await storage.prepare(file);
    await deliverRequest({
      id: common.requestId,
      kind: common.kind,
      customer,
      details,
      file: attachment,
    });
    return NextResponse.json({
      id: common.requestId,
      message: `Request received. A confirmation email has been sent to ${customer.email}. Your reference is ${common.requestId.slice(0, 8)}.`,
    });
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json(
        {
          error: `Check your form: ${error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
        },
        { status: 400 },
      );
    const message =
      error instanceof Error
        ? error.message
        : "Unable to process your request.";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Email delivery") ? 502 : 400 },
    );
  }
}
