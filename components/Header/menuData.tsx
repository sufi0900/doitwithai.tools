import { Menu } from "@/types/menu";

const menuData: Menu[] = [
  {
    id: 1,
    title: "Home",
    path: "/",
    newTab: false,
  },
  {
    id: 100,
    title: "Tools",
    path: "/tools",
    newTab: false,
  },
  {
    id: 101,
    title: "Do It AI",
    path: "/do-it-ai",
    newTab: false,
  },
  {
    id: 105,
    title: "Extension",
    path: "/chrome-extension",
    newTab: false,
  },
  {
    id: 2,
    title: "SEO Hub",
    path: "/ai-seo",
    newTab: false,
  },
  {
    id: 43,
    title: "Blogs",
    path: "/blogs",
    newTab: false,
  },
  {
    id: 102,
    title: "Prompts",
    path: "/prompts",
    newTab: false,
  },

  {
    id: 6,
    title: "Pages",
    newTab: false,
    submenu: [
      {
        id: 110,
        title: "What Our AI Tool Can Do",
        path: "/what-our-ai-tool-can-do",
        newTab: false,
      },
      {
        id: 111,
        title: "Portable AI Tools (.ZIP)",
        path: "/download-and-embed",
        newTab: false,
      },
      { id: 42, title: "Contact Us", path: "/contact", newTab: false },
      {
        id: 3,
        title: "Free AI Resources",
        path: "/free-ai-resources",
        newTab: false,
      },
      {
        id: 41,
        title: "About Us",
        path: "/about",
        newTab: false,
      },
      {
        id: 48,
        title: "Tool Categories",
        path: "/tools/categories",
        newTab: false,
      },
      {
        id: 31,
        title: "AiTools Hub",
        path: "/ai-tools",
        newTab: false,
      },
      {
        id: 4,
        title: "Earn with AI",
        path: "/ai-learn-earn",
        newTab: false,
      },
      {
        id: 46,
        title: "FAQ",
        path: "/faq",
        newTab: false,
      },
      {
        id: 47,
        title: "Author",
        path: "/author/sufian-mustafa",
        newTab: false,
      },
    ],
  },
];
export default menuData;
