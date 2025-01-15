import { Menu } from "@/types/menu";

const menuData: Menu[] = [
  {
    id: 1,
    title: "Home",
    path: "/",
    newTab: false,
  },
  
  {
    id: 3,
    title: "AiTools",
    path: "/tools",
    newTab: false,
  },
  {
    id: 4,
    title: "Earn with AI",
    path: "/earning",
    newTab: false,
  },
  {
    id: 5,
    title: "Code With AI",
    path: "/coding",
    newTab: false,
  },
  // {
  //   id: 6,
  //   title: "Free AI Resources",
  //   path: "/free-resources",
  //   newTab: false,
  // },
  {
    id: 7,
    title: "SEO with AI",
    path: "/seo",
    newTab: false,
  },
  // {
  //   id: 8,
  //   title: "AI News",
  //   path: "/news",
  //   newTab: false,
  // },
  
  {
    id: 5,
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
      // {
      //   id: 44,
      //   title: "Blog Sidebar Page",
      //   path: "/blog-sidebar",
      //   newTab: false,
      // },
      // {
      //   id: 45,
      //   title: "Blog Details Page",
      //   path: "/blog-details",
      //   newTab: false,
      // },
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
      // {
      //   id: 43,
      //   title: "Blog Grid Page",
      //   path: "/blog",
      //   newTab: false,
      // },
    ],
  },
];
export default menuData;
