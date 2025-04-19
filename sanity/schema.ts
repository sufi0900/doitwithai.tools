import { type SchemaTypeDefinition } from "sanity";
import { aitool } from "./ai-tool";
import { coding } from "./code";
import { makemoney } from "./make-money";
import { seo } from "./seo";
import { news } from "./news";
import { blog } from "./blogs";
import { brands } from "./brands";
import { seoSubcategory } from "./seoSubcategory";


export const schema: { types: SchemaTypeDefinition[] } = {
  types: [blog, aitool, makemoney, news, coding, brands, seo, seoSubcategory ],
};
