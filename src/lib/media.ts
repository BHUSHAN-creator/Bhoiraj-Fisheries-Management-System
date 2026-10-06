import { supabase } from "@/integrations/supabase/client";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/** Uploads an image to the media bucket and returns a long-lived signed URL. */
export async function uploadMedia(file: File, folder: string): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) throw new Error("JPG, PNG, WebP किंवा GIF छायाचित्र निवडा.");
  if (file.size > 10 * 1024 * 1024) throw new Error("छायाचित्र १० MB पेक्षा लहान असावे.");
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  const { data, error: signErr } = await supabase.storage.from("media").createSignedUrl(path, TEN_YEARS);
  if (signErr || !data) throw signErr ?? new Error("Could not create image link");
  return data.signedUrl;
}
