import { permanentRedirect } from "next/navigation";

export default function RedirectToolAiWebsiteBuilderToRoot() {
  permanentRedirect("/ai-website-builder");
}
