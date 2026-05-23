import { ImageResponse } from "next/og";
import { siteConfig } from "./lib/seo";

export const runtime = "edge";
export const alt = "ADTV - Haber kanallarını eş zamanlı olarak takip edin";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 64,
          background: "linear-gradient(135deg, #050508 0%, #12121a 50%, #0a1628 100%)",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#ef4444",
              boxShadow: "0 0 24px rgba(239,68,68,0.8)",
            }}
          />
          <span
            style={{
              fontSize: 28,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              opacity: 0.9,
            }}
          >
            {siteConfig.name}
          </span>
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.15, maxWidth: 900 }}>
          Canlı Haber Duvarı
        </div>
        <div style={{ fontSize: 28, marginTop: 20, opacity: 0.65, maxWidth: 800 }}>
          6 kanal · Sürükle-bırak · Yeniden boyutlandır
        </div>
      </div>
    ),
    { ...size }
  );
}
