import { STUDIO_MEDIA_ASSETS } from "../../../constants/studioThemeDefaults";

function svgBackdrop(bg1: string, bg2: string, accent: string, label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient></defs><rect width="800" height="500" fill="url(#g)"/><rect x="36" y="36" width="728" height="428" fill="none" stroke="${accent}" stroke-opacity="0.14" stroke-width="1"/><text x="50%" y="52%" text-anchor="middle" fill="${accent}" opacity="0.65" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="22" letter-spacing="8">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const STUDIO_BACKDROP_PRESETS: Array<{ label: string; url: string }> = [
  { label: "Éditorial Mode", url: STUDIO_MEDIA_ASSETS.fashion },
  { label: "Architecture High-Tech", url: STUDIO_MEDIA_ASSETS.tech },
  { label: "Studio Beauté", url: STUDIO_MEDIA_ASSETS.beauty },
  { label: "Mobilier Contemporain", url: STUDIO_MEDIA_ASSETS.interior },
  { label: "Performance Sport", url: STUDIO_MEDIA_ASSETS.sport },
  { label: "Obsidian Monolithe", url: svgBackdrop("#090D16", "#0F172A", "#F8FAFC", "STUDIO EDITION") },
  { label: "Cobalt Architectural", url: svgBackdrop("#0F172A", "#1E3A8A", "#E0F2FE", "COBALT SYSTEM") },
  { label: "Galerie Glacée", url: svgBackdrop("#F8FAFC", "#E2E8F0", "#0F172A", "GALLERY") },
];

