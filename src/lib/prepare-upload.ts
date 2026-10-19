import { MAX_FILE_BYTES, MAX_REFERENCE_BYTES, MAX_TRIANGLES, MAX_VALIDATION_BYTES } from "@/config/pricing";
import { parseSTL } from "./stl";

// Keep the user's original file for Netlify storage. Only the copy used for
// geometry validation is compacted, avoiding the function's smaller payload cap.
export async function prepareValidationForm(original: FormData): Promise<FormData> {
  const files = original.getAll("file").filter((file): file is File => file instanceof File && file.size > 0);
  const print = original.get("kind") === "print";
  if (!files.length) return original;
  if (files.length > (print ? 5 : 1)) throw new Error(print ? "Add up to five STL files per request." : "Attach one reference file.");
  const limit = print ? MAX_FILE_BYTES : MAX_REFERENCE_BYTES;
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > limit) throw new Error(print ? "STL files must total 7 MB or less." : "Reference files must be 3 MB or smaller.");
  if (!print || (files.length === 1 && totalSize <= MAX_VALIDATION_BYTES)) return original;
  const validation = new FormData();
  original.forEach((value, key) => { if (key !== "file") validation.append(key, value); });
  let totalTriangles = 0, validationBytes = 0;
  for (const file of files) {
  const { positions } = parseSTL(await file.arrayBuffer());
  const triangles = positions.length / 9;
  if (!Number.isInteger(triangles) || !triangles || triangles > MAX_TRIANGLES) throw new Error("Invalid STL geometry.");
  const buffer = new ArrayBuffer(84 + triangles * 50);
  const view = new DataView(buffer);
  view.setUint32(80, triangles, true);
  for (let t = 0; t < triangles; t++) {
    for (let k = 0; k < 9; k++) view.setFloat32(84 + t * 50 + 12 + k * 4, positions[t * 9 + k], true);
  }
  totalTriangles += triangles;
  validationBytes += buffer.byteLength;
  if (totalTriangles > MAX_TRIANGLES || validationBytes > MAX_VALIDATION_BYTES) throw new Error("Export simpler STL files: 60,000 triangles maximum across this request.");
  validation.append("file", new File([buffer], file.name, { type: "application/octet-stream" }));
  }
  return validation;
}
