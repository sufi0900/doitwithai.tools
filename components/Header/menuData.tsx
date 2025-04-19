import { Menu } from "@/types/menu";

const menuData: Menu[] = [
  {
    id: 1,
    title: "Home",
    path: "/",
    newTab: false,
  },
  {
    id: 2,
    title: "SEO with AI",
    path: "/ai-seo",
    newTab: false,
  },
  {
    id: 3,
    title: "AiTools",
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
    id: 5,
    title: "Code With AI",
    path: "/ai-code",
    newTab: false,
  },
  
  {
    id: 6,
    title: "Pages",
    newTab: false,
    submenu: [
      {
        id: 41,
        title: "About Page",
        path: "/about",
        newTab: false,
      },
      {
        id: 42,
        title: "Contact Page",
        path: "/contact",
        newTab: false,
      },
      {
        id: 43,
        title: "All Blogs",
        path: "/blogs",
        newTab: false,
      },
     
      {
        id: 46,
        title: "Category",
        path: "/categories",
        newTab: false,
      },
      {
        id: 47,
        title: "author",
        path: "/author/sufian-mustafa",
        newTab: false,
      },
      {
        id: 48,
        title: "Error Page",
        path: "/error",
        newTab: false,
      },
     
    ],
  },
];
export default menuData;
