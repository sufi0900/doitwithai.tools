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
    id: 112,
    title: "AI Website Builder",
    path: "/ai-website-builder",
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
        id: 120,
        title: "✦ My DIY Studio (/studio)",
        path: "/studio",
        newTab: false,
      },
      {
        id: 121,
        title: "Plans & Pricing",
        path: "/pricing",
        newTab: false,
      },
      {
        id: 114,
        title: "Do It AI Command Workspace",
        path: "/do-it-ai",
        newTab: false,
      },
      {
        id: 102,
        title: "650+ SEO Prompt Packs",
        path: "/prompts",
        newTab: false,
      },
      {
        id: 110,
        title: "What Our AI Tool Can Do",
        path: "/what-our-ai-tool-can-do",
        newTab: false,
      },
      {
        id: 111,
        title: "Download & Embed 90+ Tools",
        path: "/tools/downloadable-ai-tools",
        newTab: false,
      },
      {
        id: 49,
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
        id: 45,
        title: "AI Learn & Earn",
        path: "/ai-learn-earn",
        newTab: false,
      },
      {
        id: 3,
        title: "About Us",
        path: "/about",
        newTab: false,
      },
      {
        id: 42,
        title: "Contact Us",
        path: "/contact",
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
