import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wild Wolf Warehouse",
    short_name: "Wild Wolf",
    description: "Daily briefs, inventory alerts, and end-of-day reports for the production floor.",
    start_url: "/",
    display: "standalone",
    background_color: "#0e0b07",
    theme_color: "#db6600",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
