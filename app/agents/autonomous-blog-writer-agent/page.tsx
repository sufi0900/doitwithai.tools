import { permanentRedirect } from "next/navigation";

export default function RedirectAutonomousBlogWriterAgentToRoot() {
  permanentRedirect("/ai-content-writer");
}
