import "@/features/website-builder/styles/website-builder.css";
import "@/features/website-builder/portfolio/collection-templates.css";
import "@/features/website-builder/portfolio/section-cinema.css";
import "@/features/website-builder/portfolio/section-cinema-velocity.css";

export default function ShareWebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
