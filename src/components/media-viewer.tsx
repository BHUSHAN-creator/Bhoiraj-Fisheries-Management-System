import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2, ExternalLink } from "lucide-react";
import { fileKind } from "@/lib/media-helpers";

export type ViewerItem = { url: string; title?: string | null; caption?: string | null; type?: string | null };

/** Full-screen viewer for photos, PDFs, Word/Excel files and videos. */
export function MediaViewer({ items, index, onClose }: { items: ViewerItem[]; index: number; onClose: () => void }) {
  const [i, setI] = useState(index);
  const item = items[i];
  useEffect(() => setI(index), [index]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((v) => (v + 1) % items.length);
      if (e.key === "ArrowLeft") setI((v) => (v - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [items.length, onClose]);
  if (!item) return null;
  const kind = fileKind(item.type || item.url.split("?")[0]);

  return (
    <div role="dialog" aria-modal="true" aria-label={item.title ?? "पहा"} className="fixed inset-0 z-[60] flex flex-col bg-foreground/90 backdrop-blur-md animate-in fade-in">
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-background">
        <div className="min-w-0">
          <div className="truncate font-display text-lg font-semibold">{item.title}</div>
          {item.caption && <div className="truncate text-xs opacity-80">{item.caption}</div>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {kind !== "image" && (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-background/15 px-3 py-2 text-xs hover:bg-background/25">
              <ExternalLink className="h-4 w-4" /> नवीन टॅबमध्ये उघडा
            </a>
          )}
          <button onClick={onClose} aria-label="बंद करा" className="grid h-10 w-10 place-items-center rounded-full bg-background/15 hover:bg-background/30">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center p-3" onContextMenu={(e) => e.preventDefault()}>
        {kind === "image" && <img src={item.url} alt={item.title ?? ""} className="max-h-full max-w-full select-none rounded-lg object-contain shadow-2xl" draggable={false} />}
        {kind === "pdf" && <iframe title={item.title ?? "PDF"} src={`${item.url}#toolbar=0`} className="h-full w-full max-w-5xl rounded-lg bg-background" />}
        {kind === "office" && (
          <iframe title={item.title ?? "Document"} src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(item.url)}`} className="h-full w-full max-w-6xl rounded-lg bg-background" />
        )}
        {kind === "video" && <video src={item.url} controls className="max-h-full max-w-full rounded-lg" />}
        {kind === "other" && (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-background px-6 py-4 font-semibold text-foreground">फाईल उघडा</a>
        )}
        {items.length > 1 && (
          <>
            <button onClick={() => setI((v) => (v - 1 + items.length) % items.length)} aria-label="मागील" className="absolute left-3 grid h-11 w-11 place-items-center rounded-full bg-background/80 text-foreground shadow-lg hover:bg-background"><ChevronLeft /></button>
            <button onClick={() => setI((v) => (v + 1) % items.length)} aria-label="पुढील" className="absolute right-3 grid h-11 w-11 place-items-center rounded-full bg-background/80 text-foreground shadow-lg hover:bg-background"><ChevronRight /></button>
          </>
        )}
      </div>
      {items.length > 1 && <div className="pb-3 text-center text-xs text-background/80">{i + 1} / {items.length}</div>}
    </div>
  );
}

/** Drag (or let it auto-spin) to look around a photo in 360°. Works best with panorama photos. */
export function Panorama360({ src, title, className = "h-64" }: { src: string; title?: string; className?: string }) {
  const [offset, setOffset] = useState(0);
  const [auto, setAuto] = useState(true);
  const [full, setFull] = useState(false);
  const drag = useRef<{ x: number; o: number } | null>(null);

  useEffect(() => {
    if (!auto) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0; let last = performance.now();
    const tick = (t: number) => { setOffset((o) => o - (t - last) * 0.03); last = t; raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [auto]);

  const view = (
    <div
      role="img"
      aria-label={`${title ?? ""} 360° दृश्य`}
      className={`relative cursor-grab touch-none select-none overflow-hidden active:cursor-grabbing ${full ? "h-full w-full" : `${className} w-full rounded-xl`}`}
      style={{ backgroundImage: `url(${src})`, backgroundSize: "auto 100%", backgroundRepeat: "repeat-x", backgroundPositionX: `${offset}px`, backgroundPositionY: "center" }}
      onPointerDown={(e) => { setAuto(false); drag.current = { x: e.clientX, o: offset }; (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
      onPointerMove={(e) => { if (drag.current) setOffset(drag.current.o + (e.clientX - drag.current.x)); }}
      onPointerUp={() => { drag.current = null; }}
    >
      <div className="absolute left-3 top-3 rounded-full bg-background/85 px-3 py-1 text-xs font-bold text-foreground shadow">360° · ओढून फिरवा</div>
      <button onClick={(e) => { e.stopPropagation(); setFull((v) => !v); }} aria-label="पूर्ण स्क्रीन" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-background/85 text-foreground shadow">
        {full ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>
    </div>
  );
  if (full) return <div className="fixed inset-0 z-[60] bg-foreground">{view}</div>;
  return view;
}
