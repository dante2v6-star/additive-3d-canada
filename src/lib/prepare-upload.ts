import { MAX_FILE_BYTES, MAX_REFERENCE_BYTES, MAX_TRIANGLES, MAX_VALIDATION_BYTES } from "@/config/pricing";
import { parseSTL } from "./stl";

// Keep the user's original file for Netlify storage. Only the copy used for
// geometry validation is compacted, avoiding the function's smaller payload cap.
export async function prepareValidationForm(original: FormData): Promise<FormData> {
  const file = original.get("file");
  const print = original.get("kind") === "print";
  if (!(file instanceof File) || !file.size) return original;
  const limit = print ? MAX_FILE_BYTES : MAX_REFERENCE_BYTES;
  if (file.size > limit) throw new Error(print ? "Choose an STL file up to 7 MB." : "Reference files must be 3 MB or smaller.");
  if (!print || file.size <= MAX_VALIDATION_BYTES) return original;
  const { positions } = parseSTL(await file.arrayBuffer());
  const triangles = positions.length / 9;
  if (!Number.isInteger(triangles) || !triangles || triangles > MAX_TRIANGLES) throw new Error("Invalid STL geometry.");
  const buffer = new ArrayBuffer(84 + triangles * 50);
  const view = new DataView(buffer);
  view.setUint32(80, triangles, true);
  for (let t = 0; t < triangles; t++) {
    for (let k = 0; k < 9; k++) view.setFloat32(84 + t * 50 + 12 + k * 4, positions[t * 9 + k], true);
  }
  if (buffer.byteLength > MAX_VALIDATION_BYTES) throw new Error("Export a simplified STL for an online estimate.");
  const validation = new FormData();
  original.forEach((value, key) => validation.append(key, value));
  validation.set("file", new File([buffer], file.name, { type: "application/octet-stream" }));
  return validation;
}
