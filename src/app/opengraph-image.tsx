import { ImageResponse } from "next/og";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/constants/site";

export const alt = `${APP_NAME} — ${APP_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f4f4f3",
        color: "#111111",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          fontSize: 72,
          fontWeight: 800,
          letterSpacing: -2,
        }}
      >
        <span>Road</span>
        <span style={{ marginLeft: -20 }}>Kin</span>
      </div>
      <div
        style={{
          marginTop: 24,
          fontSize: 40,
          fontWeight: 800,
          color: "#111111",
          backgroundColor: "#ff5f0f",
          padding: "8px 20px",
          borderRadius: 4,
        }}
      >
        {APP_TAGLINE}
      </div>
      <div
        style={{
          marginTop: 20,
          fontSize: 24,
          color: "#5c5c5c",
          maxWidth: 800,
          textAlign: "center",
        }}
      >
        {APP_DESCRIPTION}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 16,
          display: "flex",
          backgroundColor: "#ff5f0f",
        }}
      />
    </div>,
    size,
  );
}
