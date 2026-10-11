import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import fallback from "@/assets/watermark.webp";

/**
 * Site-wide watermark. Uses the image the Admin set in the panel (site_content key "watermark"),
 * otherwise the bundled society watermark. It fits any screen and never blocks clicks.
 */
export function SiteWatermark() {
  const { data } = useQuery({
    queryKey: ["site-watermark"],
    staleTime: 60_000,
    queryFn: async () =>
      (await supabase.from("site_content").select("image_url,body").eq("key", "watermark").maybeSingle()).data,
  });
  if (data?.body === "off") return null;
  const src = data?.image_url || fallback;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[5] grid place-items-center overflow-hidden print:hidden">
      <img src={src} alt="" className="watermark-img w-[min(92vw,1100px)] max-h-[80vh] object-contain" />
    </div>
  );
}
