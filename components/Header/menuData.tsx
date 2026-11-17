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
    id: 6,
    title: "Resources",
    newTab: false,
    submenu: [
      {
        id: 115,
        title: "⚡ 24/7 AI Employee Agency (Landing)",
        path: "/ai-employee-agency",
        newTab: false,
      },
      {
        id: 116,
        title: "🏢 AI Agency Live Dashboard (V2)",
        path: "/ai-employee-agency/dashboard",
        newTab: false,
      },
      {
        id: 113,
        title: "Autonomous Agents & Social OS",
        path: "/ai-content-writer/automation",
        newTab: false,
      },
      {
        id: 107,
        title: "10 Specialized AI Agents",
        path: "/agents",
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
        title: "Download & Embed 125+ Tools",
        path: "/tools/downloadable-ai-tools",
        newTab: false,
      },
      {
        id: 105,
        title: "Chrome Extension",
        path: "/chrome-extension",
        newTab: false,
      },
      { id: 42, title: "Contact Us", path: "/contact", newTab: false },
      {
        id: 3,
        title: "About Us",
        path: "/about",
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
