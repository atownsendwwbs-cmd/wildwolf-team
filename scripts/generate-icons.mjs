import { ImageResponse } from "next/og.js";
import { writeFile } from "node:fs/promises";

const AMBER_GRADIENT = "linear-gradient(135deg, #ff8f1f 0%, #db6600 55%, #6b3009 100%)";

async function renderIcon({ size, fontSize, filename }) {
  const image = new ImageResponse(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: AMBER_GRADIENT,
        },
        children: {
          type: "div",
          props: {
            style: {
              fontSize,
              lineHeight: 1,
              display: "flex",
              fontWeight: 800,
              color: "#17130e",
              letterSpacing: -4,
              fontFamily: "sans-serif",
            },
            children: "WW",
          },
        },
      },
    },
    { width: size, height: size }
  );

  const buffer = Buffer.from(await image.arrayBuffer());
  await writeFile(`public/icons/${filename}`, buffer);
  console.log(`wrote public/icons/${filename} (${size}x${size})`);
}

// Standard "any" purpose icons
await renderIcon({ size: 192, fontSize: 84, filename: "icon-192.png" });
await renderIcon({ size: 512, fontSize: 224, filename: "icon-512.png" });

// Maskable icon — Android crops to circle/squircle/etc, so keep the
// monogram smaller and well inside the safe zone
await renderIcon({ size: 512, fontSize: 168, filename: "icon-maskable-512.png" });

// Apple touch icon — iOS applies its own rounding, wants a full-bleed square
await renderIcon({ size: 180, fontSize: 80, filename: "apple-touch-icon.png" });
