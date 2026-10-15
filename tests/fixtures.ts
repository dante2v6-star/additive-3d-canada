export function cubeSTL(size = 10, binary = true) {
  const vertices = [
    [0, 0, 0],
    [size, 0, 0],
    [size, size, 0],
    [0, size, 0],
    [0, 0, size],
    [size, 0, size],
    [size, size, size],
    [0, size, size],
  ];
  const faces = [
    [0, 2, 1],
    [0, 3, 2],
    [4, 5, 6],
    [4, 6, 7],
    [0, 1, 5],
    [0, 5, 4],
    [1, 2, 6],
    [1, 6, 5],
    [2, 3, 7],
    [2, 7, 6],
    [3, 0, 4],
    [3, 4, 7],
  ];
  if (binary) {
    const buffer = new ArrayBuffer(84 + faces.length * 50);
    const v = new DataView(buffer);
    v.setUint32(80, faces.length, true);
    faces.forEach((f, i) =>
      f.forEach((p, j) =>
        vertices[p].forEach((n, k) =>
          v.setFloat32(84 + i * 50 + 12 + j * 12 + k * 4, n, true),
        ),
      ),
    );
    return buffer;
  }
  return new TextEncoder().encode(
    `solid cube\n${faces.map((f) => `facet normal 0 0 0\nouter loop\n${f.map((p) => `vertex ${vertices[p].join(" ")}`).join("\n")}\nendloop\nendfacet`).join("\n")}\nendsolid cube`,
  ).buffer as ArrayBuffer;
}
