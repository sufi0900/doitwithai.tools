import Link from "next/link";
import { WebsiteSettingsClientLoader } from "@/features/website-builder/studio/WebsiteSettingsClientLoader";

export const dynamic = "force-dynamic";

export default function RootWebsiteStudioSettingsPage({
  params,
}: {
  params: { projectId: string };
}) {
  if (params.projectId === "demo") {
    return (
      <main className="website-builder-scope flow-page">
        <header className="flow-nav">
          <Link href="/ai-website-builder/studio/demo">Back to Demo Studio</Link>
          <strong className="flow-brand">DOITWITHAI STUDIO</strong>
          <Link href="/ai-website-builder/claim">Claim Draft</Link>
        </header>
        <div className="empty-projects">
          <h2>Settings require a saved website project</h2>
          <p>
            Visitor AI Agent document uploads and opportunity shares become
            available after saving or claiming your website draft into your
            DoItWithAI account.
          </p>
          <div className="flow-actions">
            <Link className="primary-action" href="/ai-website-builder/claim">
              Claim Browser Draft
            </Link>
            <Link
              className="secondary-action"
              href="/ai-website-builder/studio/demo"
            >
              Return to Demo Studio
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <WebsiteSettingsClientLoader projectId={params.projectId} />;
}
