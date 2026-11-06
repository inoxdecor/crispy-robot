import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ImageResponse } from "next/og";
import { corePages, projects, publicPages, services } from "../lib/seo-content";

async function main() {
  await Promise.all([
    mkdir("public/images", { recursive: true }),
    mkdir("public/social", { recursive: true }),
  ]);
  const font = await readFile("public/fonts/space-grotesk-700.ttf");
  for (const page of publicPages) {
    const title =
      services.find((service) => service.slug === page.key)?.name ||
      projects.find((project) => project.slug === page.key)?.name ||
      ({
        home: "Websites that make clients say yes.",
        services: "Design. Development. Connected.",
        work: "Real projects. Clear purpose.",
        privacy: "Your information. Your choices.",
      }[page.key] ??
        page.title);
    const response = new ImageResponse(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "58px 68px",
          background: "#141518",
          color: "#f7f7f5",
          fontFamily: "Space Grotesk",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 25,
          }}
        >
          <span>TheBenzzCreations</span>
          <span style={{ color: "#ff7186" }}>DESIGN + ENGINEERING</span>
        </div>
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            fontSize: title.length > 35 ? 76 : 86,
            lineHeight: 1.08,
            letterSpacing: -3,
            maxWidth: 1030,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            height: 5,
            background: "#e52b4a",
            width: 150,
            marginBottom: 24,
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#c4c8d0",
          }}
        >
          <span>NEW DELHI / WORKING ACROSS INDIA</span>
          <span>thebenzzcreations.com</span>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: "Space Grotesk", data: font, weight: 700, style: "normal" },
        ],
      },
    );
    const output = await sharp(Buffer.from(await response.arrayBuffer()))
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer();
    await writeFile(path.join("public/social", `${page.key}.jpg`), output);
  }
  for (const project of projects) {
    const source = `public/images/${project.image}-source.png`;
    const sourceInfo = await stat(source);
    for (const width of [640, 960, 1440])
      for (const format of ["webp", "avif"] as const) {
        const target = `public/images/${project.image}-${width}.${format}`;
        const current = await stat(target).catch(() => undefined);
        if (current && current.mtimeMs >= sourceInfo.mtimeMs) continue;
        await sharp(source)
          .resize({ width, withoutEnlargement: true })
          [format]({ quality: format === "avif" ? 60 : 82 })
          .toFile(target);
      }
  }
  const brand = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" rx="100" fill="#141518"/><circle cx="256" cy="256" r="170" stroke="#e52b4a" stroke-width="12" fill="none"/><path fill="#f7f7f5" d="M185 139h72c50 0 77 24 77 61 0 25-12 41-32 50 27 8 42 26 42 56 0 43-31 68-86 68h-73zm43 38v57h26c25 0 37-9 37-28 0-20-12-29-37-29zm0 95v64h29c29 0 43-10 43-32 0-21-14-32-44-32z"/></svg>',
  );
  await sharp(brand)
    .png({ compressionLevel: 9 })
    .toFile("public/brand-mark.png");
  console.log(
    `Generated ${publicPages.length} social images and responsive portfolio images for ${projects.length} projects (${corePages.length} core pages).`,
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
