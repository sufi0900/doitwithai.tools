import { PortfolioStudio } from "@/features/website-builder/studio/portfolio-studio";
import { WebsiteStudioClientLoader } from "@/features/website-builder/studio/WebsiteStudioClientLoader";
import { getTemplate } from "@/features/website-builder/domain/templates";
import { DEFAULT_WEBSITE_TEMPLATE_ID } from "@/features/website-builder/ecosystem-bridge";

export const dynamic = "force-dynamic";

export default function RootWebsiteStudioPage({
  params,
  searchParams,
}: {
  params: { projectId: string };
  searchParams?: { welcome?: string };
}) {
  const { projectId } = params;

  if (projectId === "demo") {
    const flagship = getTemplate(DEFAULT_WEBSITE_TEMPLATE_ID);
    return (
      <PortfolioStudio
        initialDocument={flagship!.document}
        projectName="Interactive Flagship Demo"
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
