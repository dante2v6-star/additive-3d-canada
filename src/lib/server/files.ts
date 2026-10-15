import { MAX_FILE_BYTES } from "@/config/pricing";
import { parseSTL } from "../stl";
export async function validateFile(file: File, print: boolean) {
  if (!file.size || file.size > MAX_FILE_BYTES)
    throw new Error("Upload a non-empty file no larger than 3 MB.");
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const allowed = print
    ? ["stl"]
    : [
        "png",
        "jpg",
        "jpeg",
        "webp",
        "pdf",
        "stl",
        "step",
        "stp",
        "iges",
        "igs",
      ];
  if (!allowed.includes(ext))
    throw new Error(
      "Unsupported file type. Choose STL, PNG, JPG, WebP, PDF, STEP or IGES as appropriate.",
    );
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const head = new TextDecoder().decode(bytes.slice(0, 200));
  const matches = (signature: number[]) =>
    signature.every((n, i) => bytes[i] === n);
  if (ext === "stl") return parseSTL(buffer).analysis;
  if (ext === "png" && !matches([137, 80, 78, 71, 13, 10, 26, 10]))
    throw new Error("Invalid PNG file.");
  if (["jpg", "jpeg"].includes(ext) && !matches([255, 216, 255]))
    throw new Error("Invalid JPEG file.");
  if (ext === "pdf" && !head.startsWith("%PDF-"))
    throw new Error("Invalid PDF file.");
  if (
    ext === "webp" &&
    !(head.startsWith("RIFF") && head.slice(8, 12) === "WEBP")
  )
    throw new Error("Invalid WebP file.");
  if (["step", "stp"].includes(ext) && !head.includes("ISO-10303-21"))
    throw new Error("Invalid STEP exchange file.");
  if (
    ["iges", "igs"].includes(ext) &&
    !/^.{72}S\s*\d+/m.test(new TextDecoder().decode(bytes.slice(0, 1024)))
  )
    throw new Error("Invalid IGES exchange file.");
  return null;
}
