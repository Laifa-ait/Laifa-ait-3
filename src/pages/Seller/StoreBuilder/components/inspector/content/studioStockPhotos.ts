function svgBackdrop(bg1: string, bg2: string, accent: string, label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient></defs><rect width="800" height="500" fill="url(#g)"/><circle cx="660" cy="110" r="180" fill="${accent}" opacity="0.16"/><circle cx="140" cy="410" r="140" fill="${accent}" opacity="0.12"/><text x="50%" y="52%" text-anchor="middle" fill="${accent}" opacity="0.7" font-family="Georgia, serif" font-size="28" letter-spacing="4">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const STUDIO_BACKDROP_PRESETS: Array<{ label: string; url: string }> = [
  { label: "Atelier Obsidian", url: svgBackdrop("#0F172A", "#1E293B", "#F8FAFC", "STUDIO EDITIONS") },
  { label: "Sable & Lin", url: svgBackdrop("#F4ECE1", "#E7DAC8", "#3D2518", "MAISON ARTISAN") },
  { label: "Vert Sauge", url: svgBackdrop("#ECFDF5", "#D1FAE5", "#064E3B", "BOTANIQUE") },
  { label: "Terre Cuite", url: svgBackdrop("#431407", "#7C2D12", "#FED7AA", "TERRITOIRE") },
  { label: "Azur Studio", url: svgBackdrop("#0C4A6E", "#0369A1", "#E0F2FE", "MÉDITERRANÉE") },
  { label: "Porcelaine", url: svgBackdrop("#F8FAFC", "#E2E8F0", "#0F172A", "GALERIE") },
  { label: "Visuel Produit", url: "/images/placeholders/product.svg" },
  { label: "Visuel Rayon", url: "/images/placeholders/category.svg" },
];

