import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Gabriel Coelho — Desenvolvedor Back-End";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#12222D",
          backgroundImage:
            "radial-gradient(circle, rgba(242,234,220,0.08) 2px, transparent 2px)",
          backgroundSize: "36px 36px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#EAF35B",
            fontSize: 22,
            letterSpacing: 4,
            marginBottom: 32,
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: 999, background: "#EAF35B" }} />
          SÃO LUÍS · BRASIL — BACKEND, APIS E SISTEMAS
        </div>
        <div style={{ display: "flex", flexDirection: "column", color: "#F2EADC", fontSize: 96, fontWeight: 900, lineHeight: 1 }}>
          <span>Back-end com</span>
          <span style={{ color: "#EAF35B", fontStyle: "italic", fontWeight: 400 }}>presença.</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
