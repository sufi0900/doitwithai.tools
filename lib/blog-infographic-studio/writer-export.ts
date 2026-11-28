/** Prism Forge: normalize feature geometry at export boundaries without duplicating writer internals. */
import type { CanonicalBlogProjectState } from "@/lib/blog-writer/canonical-state";
import * as compiler from "../blog-writer/technical-seo-compiler";
import { lockInfographicGeometry } from "./layout-registry";
export type {
  CwvHtmlCompilerOptions,
  TechnicalCwvAuditItem,
} from "../blog-writer/technical-seo-compiler";

export function withFixedInfographicGeometry(
  project: CanonicalBlogProjectState,
): CanonicalBlogProjectState {
  return {
    ...project,
    sections: project.sections.map((section) => ({
      ...section,
      infographicConfig: lockInfographicGeometry(section.infographicConfig),
    })),
  };
}
function fixedGeometry<A extends unknown[], R>(
  compile: (project: CanonicalBlogProjectState, ...args: A) => R,
) {
  return (project: CanonicalBlogProjectState, ...args: A): R =>
    compile(withFixedInfographicGeometry(project), ...args);
}
export const resolveCanonicalAndSlug = compiler.resolveCanonicalAndSlug;
export const compileCleanCwvArticleHtml = fixedGeometry(
  compiler.compileCleanCwvArticleHtml,
);
export const compileCompleteJsonLdGraph = fixedGeometry(
  compiler.compileCompleteJsonLdGraph,
);
export const compileHeadMetaTagsHtml = fixedGeometry(
  compiler.compileHeadMetaTagsHtml,
);
export const compileRobotsAndSitemapSnippet = fixedGeometry(
  compiler.compileRobotsAndSitemapSnippet,
);
export const compileWordPressGutenbergHtml = fixedGeometry(
  compiler.compileWordPressGutenbergHtml,
);
export const compileCleanArticleMarkdown = fixedGeometry(
  compiler.compileCleanArticleMarkdown,
);
export const auditTechnicalSeoAndCwvReadiness = fixedGeometry(
  compiler.auditTechnicalSeoAndCwvReadiness,
);
