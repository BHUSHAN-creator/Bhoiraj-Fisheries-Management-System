import { Facebook, Instagram, Youtube, Twitter, Linkedin, Send, MessageCircle, Globe } from "lucide-react";
import { detectPlatform, type SocialPlatform } from "@/lib/media-helpers";

const ICONS: Record<SocialPlatform, typeof Globe> = {
  facebook: Facebook, instagram: Instagram, youtube: Youtube, whatsapp: MessageCircle,
  x: Twitter, linkedin: Linkedin, telegram: Send, website: Globe,
};

export function SocialIcon({ url, platform, className = "h-4 w-4" }: { url: string; platform?: string | null; className?: string }) {
  const key = (platform && platform in ICONS ? platform : detectPlatform(url)) as SocialPlatform;
  const Icon = ICONS[key] ?? Globe;
  return <Icon className={className} />;
}
