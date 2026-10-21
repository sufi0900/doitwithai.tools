import registry from "./registry.json";
import { tools, type CatalogTool } from "./catalog";
export const topics = registry.topics.filter((topic) =>
  tools.some((tool) => tool.topics.includes(topic.id)),
);
export function matchesTopic(tool: CatalogTool, topic: string) {
  return !topic || tool.topics.includes(topic);
}
