import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** EH monogram in the brand olive on warm off-white. */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#3F4A34",
        color: "#FAF8F4",
        fontSize: 30,
        letterSpacing: -1,
        fontFamily: "serif",
      }}
    >
      EH
    </div>,
    { ...size },
  );
}
