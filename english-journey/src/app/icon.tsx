import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Generated favicon — keeps the wordmark and the tab icon in sync. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4f6ef7",
          color: "white",
          fontSize: 17,
          fontWeight: 700,
          borderRadius: 7,
        }}
      >
        EJ
      </div>
    ),
    size,
  );
}
