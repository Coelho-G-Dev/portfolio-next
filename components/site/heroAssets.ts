import manifestJson from "@/public/hero/manifest.json";
import { loadManifest } from "@/lib/heroManifest";

// Manifest dos vídeos do personagem (gerado por tools/hero-video.mjs).
export const heroManifest = loadManifest(manifestJson);
export const heroUrl = (file: string) => `/hero/${file}`;
