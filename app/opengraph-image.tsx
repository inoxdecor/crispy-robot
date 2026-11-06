import { ImageResponse } from "next/og";
export const alt = "TheBenzzCreations — Digital design and engineering";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#141518",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 70,
        color: "#f7f7f5",
      }}
    >
      <div
        style={{
          fontSize: 27,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>thebenzzcreations.</span>
        <span style={{ color: "#e52b4a" }}>DESIGN + ENGINEERING</span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: 100,
          fontSize: 85,
          letterSpacing: -5,
          lineHeight: 1.1,
        }}
      >
        <span>Websites that make</span>
        <span style={{ color: "#e52b4a" }}>clients say yes.</span>
      </div>
      <div style={{ fontSize: 24, marginTop: 55 }}>
        Websites · Mobile apps · Custom software · AI & automation
      </div>
    </div>,
    size,
  );
}
