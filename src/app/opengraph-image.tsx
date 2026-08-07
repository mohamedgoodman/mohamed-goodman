import { ImageResponse } from "next/og";

import { siteConfig } from "@/data/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background:
          "linear-gradient(135deg, #0f0f14 0%, #1a1a2e 50%, #0f0f14 100%)",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 72,
          height: 72,
          borderRadius: 18,
          background: "#4f46e5",
          color: "white",
          fontSize: 30,
          fontWeight: 700,
          marginBottom: 40,
        }}
      >
        MD
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 64,
          fontWeight: 700,
          color: "white",
          letterSpacing: "-0.02em",
        }}
      >
        {siteConfig.name}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 32,
          color: "#a1a1aa",
          marginTop: 16,
        }}
      >
        {siteConfig.title}
      </div>
    </div>,
    { ...size },
  );
}
