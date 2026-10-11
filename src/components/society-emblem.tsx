import logo from "@/assets/website_logo.webp";

/** The society's official logo (supplied by the Chairman), shown with a soft 3D lift. */
export function SocietyEmblem({ className = "h-14 w-14" }: { className?: string }) {
  return (
    <span className={`logo-3d inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-card ring-2 ring-saffron/60 ${className}`}>
      <img
        src={logo}
        alt="भोईराज मत्स्य व्यावसायिक सहकारी संस्था मर्यादित — बोधचिन्ह"
        className="h-full w-full object-contain p-0.5"
        width={512}
        height={468}
      />
    </span>
  );
}
