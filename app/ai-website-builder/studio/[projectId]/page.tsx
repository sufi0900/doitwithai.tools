import { PortfolioStudio } from "@/features/website-builder/studio/portfolio-studio";
import { WebsiteStudioClientLoader } from "@/features/website-builder/studio/WebsiteStudioClientLoader";
import { getTemplate } from "@/features/website-builder/domain/templates";
import { DEFAULT_WEBSITE_TEMPLATE_ID } from "@/features/website-builder/ecosystem-bridge";

export const dynamic = "force-dynamic";

export default function WebsiteStudioPage({
  params,
  searchParams,
}: {
  params: { projectId: string };
  searchParams?: { welcome?: string; template?: string };
}) {
  const { projectId } = params;

  if (projectId === "demo") {
    const requestedTemplate = searchParams?.template || DEFAULT_WEBSITE_TEMPLATE_ID;
    const chosen = getTemplate(requestedTemplate) ?? getTemplate(DEFAULT_WEBSITE_TEMPLATE_ID);
    return (
      <PortfolioStudio
        initialDocument={chosen!.document}
        projectName={chosen!.name || "Interactive Flagship Demo"}
        persistence="local"
      />
    );
  }

  return (
    <WebsiteStudioClientLoader
      projectId={projectId}
      welcomeFromVox={searchParams?.welcome === "vox"}
    />
  );
}
