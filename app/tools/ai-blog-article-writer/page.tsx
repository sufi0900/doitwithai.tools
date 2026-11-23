import { permanentRedirect } from "next/navigation";

export default function RedirectLegacyAiBlogArticleWriterToRoot() {
  permanentRedirect("/ai-content-writer");
}
