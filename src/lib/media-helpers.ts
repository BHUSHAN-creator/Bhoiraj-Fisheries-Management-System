/** Browser-safe helpers for maps, social links, dates and grouping published media. */

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** Formats as DD:MON:YYYY:HH:MN:SS AM/PM (e.g. 06:OCT:2026:10:18:57 AM). */
export function formatDateTime(value: string | Date | null | undefined, withTime = true): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  const date = `${p(d.getDate())}:${MONTHS[d.getMonth()]}:${d.getFullYear()}`;
  if (!withTime) return date;
  const h = d.getHours() % 12 || 12;
  return `${date}:${p(h)}:${p(d.getMinutes())}:${p(d.getSeconds())} ${d.getHours() < 12 ? "AM" : "PM"}`;
}

/** Returns a link that always opens Google Maps at the dam's location. */
export function googleMapsLink(d: { map_url?: string | null; location_name?: string | null; name?: string | null; village?: string | null; taluka?: string | null; district?: string | null }): string {
  if (d.map_url) {
    try {
      const u = new URL(d.map_url);
      if (u.protocol === "https:") return u.toString();
    } catch { /* fall through */ }
  }
  const q = [d.location_name || d.name, d.village, d.taluka, d.district || "Jalgaon", "Maharashtra"].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export type DamRow = {
  id: string; name: string; village: string | null; taluka: string | null; district: string | null;
  water_area: string | null; capacity: string | null; description: string | null; image_url: string | null;
  latest_news: string | null; map_url: string | null; location_name: string | null;
  panorama_url?: string | null; gallery_urls?: string[] | null; created_at?: string;
};

export type DamGroup = DamRow & { photos: string[]; news: string[]; ids: string[] };

/** Merges rows that describe the same dam (same name) into one entry. */
export function groupDams(rows: DamRow[]): DamGroup[] {
  const map = new Map<string, DamGroup>();
  for (const r of rows) {
    const key = r.name.trim().toLowerCase().replace(/\s+/g, " ");
    const photos = [r.image_url, ...(r.gallery_urls ?? [])].filter((x): x is string => !!x);
    const g = map.get(key);
    if (!g) {
      map.set(key, { ...r, photos: [...new Set(photos)], news: r.latest_news ? [r.latest_news] : [], ids: [r.id] });
      continue;
    }
    g.ids.push(r.id);
    for (const p of photos) if (!g.photos.includes(p)) g.photos.push(p);
    if (r.latest_news && !g.news.includes(r.latest_news)) g.news.push(r.latest_news);
    for (const k of ["village", "taluka", "district", "water_area", "capacity", "description", "map_url", "location_name", "panorama_url"] as const) {
      if (!g[k] && r[k]) (g as Record<string, unknown>)[k] = r[k];
    }
  }
  return [...map.values()].map((g) => ({ ...g, image_url: g.photos[0] ?? null }));
}

export type SocialPlatform = "facebook" | "instagram" | "youtube" | "whatsapp" | "x" | "linkedin" | "telegram" | "website";

/** Detects the social platform from a link's address. */
export function detectPlatform(url: string): SocialPlatform {
  let host = "";
  try { host = new URL(url).hostname.toLowerCase(); } catch { return "website"; }
  if (host.includes("facebook") || host === "fb.com" || host.endsWith("fb.me")) return "facebook";
  if (host.includes("instagram")) return "instagram";
  if (host.includes("youtube") || host === "youtu.be") return "youtube";
  if (host.includes("whatsapp") || host === "wa.me") return "whatsapp";
  if (host === "x.com" || host.includes("twitter")) return "x";
  if (host.includes("linkedin")) return "linkedin";
  if (host === "t.me" || host.includes("telegram")) return "telegram";
  return "website";
}

export const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  facebook: "Facebook", instagram: "Instagram", youtube: "YouTube", whatsapp: "WhatsApp",
  x: "X (Twitter)", linkedin: "LinkedIn", telegram: "Telegram", website: "संकेतस्थळ",
};

export type FileKind = "image" | "pdf" | "office" | "video" | "other";

export function fileKind(nameOrType: string | null | undefined): FileKind {
  const n = (nameOrType ?? "").toLowerCase();
  if (/(png|jpe?g|webp|gif|bmp|svg)$/.test(n) || n.startsWith("image")) return "image";
  if (n.endsWith("pdf")) return "pdf";
  if (/(docx?|xlsx?|pptx?|csv)$/.test(n)) return "office";
  if (/(mp4|webm|mov)$/.test(n)) return "video";
  return "other";
}
