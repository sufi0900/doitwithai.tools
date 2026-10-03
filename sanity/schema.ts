import { type SchemaTypeDefinition } from "sanity";
import { aitool } from "./ai-tool";
import { coding } from "./code";
import { makemoney } from "./make-money";
import { seo } from "./seo";
import { news } from "./news";
import { blog } from "./blogs";
import { brands } from "./brands";
import { seoSubcategory } from "./seoSubcategory";
import { blogCategory } from "./blog-category";
import { blogPost } from "./blog-post";
import { blogTag } from "./blog-tag";
import { guide } from "./guide";
import { freeResources } from "./legacy-free-resources";


export const schema: { types: SchemaTypeDefinition[] } = {
  types: [freeResources, guide, blogPost, blogCategory, blogTag, blog, aitool, makemoney, news, coding, brands, seo, seoSubcategory ],
};
