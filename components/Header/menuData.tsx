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
    id: 108,
    title: "AI Content Writer",
    path: "/ai-content-writer",
    newTab: false,
  },
  {
    id: 107,
    title: "AI Agents",
    path: "/agents",
    newTab: false,
  },
  {
    id: 2,
    title: "SEO Hub",
    path: "/ai-seo",
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
    title: "Resources",
    newTab: false,
    submenu: [
      {
        id: 110,
        title: "What Our AI Tool Can Do",
        path: "/what-our-ai-tool-can-do",
        newTab: false,
      },
      {
        id: 3,
        title: "Free AI Resources",
        path: "/free-ai-resources",
        newTab: false,
      },
      {
        id: 4,
        title: "AI Learn & Earn",
        path: "/ai-learn-earn",
        newTab: false,
      },
      {
        id: 105,
        title: "Chrome Extension",
        path: "/chrome-extension",
        newTab: false,
      },
    ],
  },
];

export default menuData;
