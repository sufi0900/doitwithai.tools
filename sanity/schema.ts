import { type SchemaTypeDefinition } from "sanity";
import { aitool } from "./ai-tool";
import { coding } from "./code";
import { freeairesources } from "./freeairesources";
import { makemoney } from "./make-money";
import { seo } from "./seo";
import { news } from "./news";
import { blog } from "./blogs";
import { complexTable } from "./complextable";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [complexTable, blog, makemoney, news, coding, freeairesources, seo ],
};
