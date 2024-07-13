import { type SchemaTypeDefinition } from "sanity";
import { aitool } from "./ai-tool";
import { coding } from "./code";
import { freeairesources } from "./freeairesources";
import { makemoney } from "./make-money";
import { seo } from "./seo";
import { news } from "./news";


export const schema: { types: SchemaTypeDefinition[] } = {
  types: [ aitool, makemoney, news, coding, freeairesources, seo ],
};
