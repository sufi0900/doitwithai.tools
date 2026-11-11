import { permanentRedirect } from "next/navigation";

export default function RedirectLegacyBlogToInfographicGenerator() {
  permanentRedirect("/tools/blog-section-infographic-generator");
}
