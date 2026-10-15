import { MAX_FILE_BYTES, MAX_TRIANGLES } from "@/config/pricing";
import type { Analysis } from "./models";
export function parseSTL(buffer: ArrayBuffer): {
  analysis: Analysis;
  positions: Float32Array;
} {
  if (!buffer.byteLength || buffer.byteLength > MAX_FILE_BYTES)
    throw new Error("Choose a non-empty STL file up to 7 MB.");
  const view = new DataView(buffer);
  let values: number[] = [];
  const count = buffer.byteLength >= 84 ? view.getUint32(80, true) : 0;
  if (count > 0 && 84 + count * 50 === buffer.byteLength) {
    if (count > MAX_TRIANGLES)
      throw new Error(
        "This mesh is too detailed. Export a simplified STL (60,000 triangles maximum).",
      );
    values = new Array(count * 9);
    for (let t = 0; t < count; t++)
      for (let k = 0; k < 9; k++)
        values[t * 9 + k] = view.getFloat32(84 + t * 50 + 12 + k * 4, true);
  } else {
    const source = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    if (!/^\s*solid\b/i.test(source) || !/endsolid\b/i.test(source))
      throw new Error("The file is not a valid binary or ASCII STL.");
    const facets = [
      ...source.matchAll(
        /facet\s+normal\s+[^\r\n]+\s+outer\s+loop\s+([\s\S]*?)endloop\s+endfacet/gi,
      ),
    ];
    if (!facets.length || facets.length > MAX_TRIANGLES)
      throw new Error(
        "No valid facets found, or mesh exceeds 60,000 triangles.",
      );
    for (const facet of facets) {
      const vertices = [
        ...facet[1].matchAll(
          /vertex\s+([-+\d.eE]+)\s+([-+\d.eE]+)\s+([-+\d.eE]+)/g,
        ),
      ];
      if (vertices.length !== 3) throw new Error("Malformed STL facet.");
      for (const v of vertices)
        values.push(Number(v[1]), Number(v[2]), Number(v[3]));
    }
  }
  if (
    !values.length ||
    values.some((v) => !Number.isFinite(v) || Math.abs(v) > 1e6)
  )
    throw new Error("Invalid or excessively large model coordinates.");
  const min = [Infinity, Infinity, Infinity],
    max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < values.length; i++) {
    const a = i % 3;
    min[a] = Math.min(min[a], values[i]);
    max[a] = Math.max(max[a], values[i]);
  }
  const dims = max.map((v, i) => v - min[i]) as [number, number, number];
  if (dims.some((v) => v <= 0))
    throw new Error("The model has no three-dimensional extent.");
  const edges = new Map<string, { count: number; balance: number }>();
  let volume = 0;
  // Shift origin to the bounding-box centre to reduce cancellation for translated meshes.
  const origin = min.map((v, i) => (v + max[i]) / 2);
  for (let i = 0; i < values.length; i += 9) {
    const p = [0, 1, 2].map((k) =>
      [0, 1, 2].map((a) => values[i + k * 3 + a] - origin[a]),
    );
    const [a, b, c] = p;
    volume +=
      (a[0] * (b[1] * c[2] - b[2] * c[1]) +
        a[1] * (b[2] * c[0] - b[0] * c[2]) +
        a[2] * (b[0] * c[1] - b[1] * c[0])) /
      6;
    const keys = p.map((v) => v.map((n) => n.toFixed(5)).join(","));
    for (let k = 0; k < 3; k++) {
      const x = keys[k],
        y = keys[(k + 1) % 3],
        key = x < y ? `${x}|${y}` : `${y}|${x}`;
      const edge = edges.get(key) || { count: 0, balance: 0 };
      edge.count++;
      edge.balance += x < y ? 1 : -1;
      edges.set(key, edge);
    }
  }
  const watertight = [...edges.values()].every(
    (e) => e.count === 2 && e.balance === 0,
  );
  const volumeCm3 = Math.abs(volume) / 1000;
  const warnings: string[] = [];
  if (!watertight)
    warnings.push(
      "Open edges or inconsistent faces detected. This model needs a manual quote.",
    );
  if (volumeCm3 <= 1e-9)
    warnings.push(
      "The enclosed volume could not be determined. A manual review is required.",
    );
  if (dims.some((v) => v > 350))
    warnings.push(
      "A dimension exceeds 350 mm. Build size requires manual review.",
    );
  return {
    positions: new Float32Array(values),
    analysis: {
      dimensions: dims,
      volumeCm3,
      triangles: values.length / 9,
      watertight,
      warnings,
    },
  };
}
