import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  const source = await readFile(path.join(process.cwd(), "public/brand/additive-3d-reference.png"));
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", background: "#f5f8ff", padding: "45px 50px", color: "#143979" }}>
      <div style={{ width: 1080, height: 225, display: "flex", overflow: "hidden", position: "relative", background: "white", borderRadius: 16 }}>
        {/* Display just the original brand banner; the workshop montage stays outside the frame. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Additive 3D" src={`data:image/png;base64,${source.toString("base64")}`} width={1110} height={1177} style={{ position: "absolute", top: -8, left: -15 }} />
      </div>
      <div style={{ display: "flex", fontSize: 58, fontWeight: 700, marginTop: 45, letterSpacing: -2 }}>Your next idea. Made real.</div>
      <div style={{ display: "flex", fontSize: 28, marginTop: 24, color: "#425571" }}>3D Printing · Custom CAD Design · London, Ontario</div>
      <div style={{ display: "flex", fontSize: 24, marginTop: 34, color: "#2356ad" }}>additive3d.netlify.app</div>
    </div>,
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=86400" } },
  );
}
