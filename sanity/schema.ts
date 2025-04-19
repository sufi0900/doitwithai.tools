import { type SchemaTypeDefinition } from "sanity";
import { aitool } from "./ai-tools";
import { coding } from "./code";
import { makemoney } from "./make-money";
import { seo } from "./ai-seo";
import { news } from "./news";
import { blog } from "./blogs";
import { brands } from "./brands";
import { seoSubcategory } from "./ai-seoSubcategory";


export const schema: { types: SchemaTypeDefinition[] } = {
  types: [blog, aitool, makemoney, news, coding, brands, seo, seoSubcategory ],
};
