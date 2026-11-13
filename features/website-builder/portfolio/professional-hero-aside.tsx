import Image from "next/image";
import { ArrowUpRight, Asterisk } from "lucide-react";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";

export function ProfessionalHeroAside({ document }: { document: SiteDocument }) {
  const initials = document.identity.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "VF";
  return <div className="professional-hero-aside" ><div className="professional-aside-top"><span>PERSONAL PORTFOLIO</span><Asterisk size={28} strokeWidth={1} /></div>{document.media.headshotUrl ? <div className="professional-hero-portrait"><Image src={document.media.headshotUrl} alt={document.media.headshotAlt || `${document.identity.name} portrait`} fill sizes="(max-width: 700px) 80vw, 420px" unoptimized /></div> : <strong aria-hidden="true">{initials}</strong>}<div className="professional-aside-bottom"><span>INSIGHT<br />MEETS<br />ACTION</span><ArrowUpRight size={40} strokeWidth={1} /></div></div>;
}
