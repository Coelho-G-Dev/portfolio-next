import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Gabriel Coelho | Desenvolvedor Full-stack";
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
          backgroundColor: "#0E0F13",
          backgroundImage:
            "radial-gradient(circle, rgba(244,238,227,0.06) 2px, transparent 2px)",
          backgroundSize: "36px 36px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#F5A524",
            fontSize: 22,
            letterSpacing: 4,
            marginBottom: 32,
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: 999, background: "#F5A524" }} />
          SÃO LUÍS · BRASIL · FULL-STACK
        </div>
        <div style={{ display: "flex", flexDirection: "column", color: "#F4EEE3", fontSize: 96, fontWeight: 900, lineHeight: 1 }}>
          <span>Da tela ao banco,</span>
          <span style={{ color: "#F5A524", fontWeight: 400 }}>sem perder mensagem.</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
