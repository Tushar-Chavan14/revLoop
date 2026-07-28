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
        backgroundColor: "#171412",
        backgroundImage: "radial-gradient(circle at 20% 20%, #3b241555, transparent 60%)",
        color: "#ffffff",
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
        <span style={{ color: "#e76f24" }}>Road</span>
        <span style={{ marginLeft: -20 }}>Kin</span>
      </div>
      <div
        style={{
          marginTop: 24,
          fontSize: 40,
          fontWeight: 700,
          color: "#e76f24",
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        {APP_TAGLINE}
      </div>
      <div
        style={{
          marginTop: 20,
          fontSize: 24,
          color: "#a1a1aa",
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
          height: 10,
          display: "flex",
          backgroundImage:
            "repeating-linear-gradient(90deg, #e76f24 0, #e76f24 40px, transparent 40px, transparent 80px)",
        }}
      />
    </div>,
    size,
  );
}
