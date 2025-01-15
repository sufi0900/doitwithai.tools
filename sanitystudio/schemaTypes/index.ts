import { type SchemaTypeDefinition } from 'sanity';
import { aitool } from './ai-tool';
import { coding } from './code';
import { makemoney } from './make-money';
import { seo } from './seo';
import { news } from './news';
import { blog } from './blogs';
import { brands } from './brands';
import { seoSubcategory } from './seoSubcategory';
import { Article, Devices, AttachMoney, Newspaper, Code, Business, Search, Category, AtmOutlined, AtmSharp } from '@mui/icons-material';

export const schemaTypes: SchemaTypeDefinition[] = [
  { ...blog, icon: Article },
  { ...aitool, icon: Devices },
  { ...makemoney, icon: AtmSharp },
  { ...news, icon: Newspaper },
  { ...coding, icon: Code },
  { ...brands, icon: Business },
  { ...seo, icon: Search },
  { ...seoSubcategory, icon: Category },
];
