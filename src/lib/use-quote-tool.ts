"use client";
import { useEffect, useRef } from "react";
import type { PrintQuote } from "./models";
type ModelContext = {
  registerTool(
    tool: {
      name: string;
      description: string;
      inputSchema: object;
      annotations: object;
      execute: (input: unknown) => unknown;
    },
    options: { signal: AbortSignal },
  ): void | Promise<void>;
};
export function useQuoteTool(quote: PrintQuote | null) {
  const current = useRef(quote);
  useEffect(() => {
    current.current = quote;
  }, [quote]);
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext })
      .modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(
        context.registerTool(
          {
            name: "read_current_print_estimate",
            description:
              "Read the current visible STL estimate and settings. Does not upload files, submit a request or disclose customer contact details.",
            inputSchema: {
              type: "object",
              properties: {},
              additionalProperties: false,
            },
            annotations: { readOnlyHint: true, untrustedContentHint: false },
            execute(input) {
              if (
                !input ||
                typeof input !== "object" ||
                Object.keys(input).length
              )
                throw new Error("Expected an empty object.");
              if (!current.current)
                return { status: "Upload an STL in the visible form first." };
              const q = current.current;
              return {
                status: q.manual ? "manual_review" : "estimate",
                currency: "CAD",
                minimum: 30,
                total: q.manual ? null : q.total,
                settings: q.settings,
                dimensionsMm: q.analysis.dimensions,
                estimated: true,
              };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {});
    } catch {
      /* Optional browser capability. */
    }
    return () => lifecycle.abort();
  }, []);
}
