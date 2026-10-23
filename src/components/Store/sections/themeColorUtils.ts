export function isDarkColor(color?: string): boolean {
  if (!color) return false;
  let hex = color.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((part) => part + part).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return false;
  const channels = [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const linear = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  return luminance < 0.42;
}

export function readableTextColor(background?: string): string {
  return isDarkColor(background) ? "#F8FAFC" : "#1F2937";
}
