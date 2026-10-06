import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Waves } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function DamGallery() {
  const { lang } = useI18n();
  const title = lang === "en" ? "Our lakes & dams" : lang === "hi" ? "हमारी झीलें और बांध" : "आपले तलाव व धरणे";
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["dam-gallery"], staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.from("dams").select("id,name,image_url,map_url,location_name,village,taluka,district").eq("is_published", true).not("image_url", "is", null).order("created_at", { ascending: false }).limit(12);
      if (error) throw error;
      return data ?? [];
    },
  });
  return <section className="mx-auto max-w-7xl px-4 py-12">
    <div className="mb-7 flex items-center gap-3"><Waves className="h-7 w-7 text-teal" /><h2 className="font-display text-3xl font-bold">{title}</h2></div>
    {isLoading ? <p>छायाचित्रे लोड होत आहेत…</p> : error ? <p role="alert">छायाचित्रे सध्या उपलब्ध नाहीत.</p> : !data.length ? <p className="text-muted-foreground">अध्यक्षांनी प्रसिद्ध केलेली तलाव व धरणांची छायाचित्रे येथे दिसतील.</p> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.map(d => <article key={d.id} className="glass-panel overflow-hidden rounded-lg">
      {d.image_url && <img src={d.image_url} alt={d.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />}
      <div className="p-5"><h3 className="text-lg font-semibold">{d.name}</h3>{d.map_url && <a href={d.map_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><MapPin className="h-4 w-4" />{d.location_name || [d.village,d.taluka,d.district].filter(Boolean).join(", ") || "Google Maps वर स्थान पहा"}</a>}</div>
    </article>)}</div>}
  </section>;
}