import "../components/Hero/critical-hero.css";
import "@/features/homepage/homepage.css";
import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import HomeTools from "@/features/tool-catalog/HomeTools";

const HomeDoItAiSection = dynamic(
  () => import("@/features/homepage/HomeDoItAiSection"),
  { ssr: true }
);
const HomePortableToolsSection = dynamic(
  () => import("@/features/homepage/HomePortableToolsSection"),
  { ssr: true }
);
const HomeLearning = dynamic(
  () =>
    import("@/features/homepage/HomeSections").then((mod) => mod.HomeLearning),
  { ssr: true }
);
const HomeResources = dynamic(
  () => import("@/features/homepage/HomeResources"),
  { ssr: true }
);
const HomeWorkflows = dynamic(
  () =>
    import("@/features/homepage/HomeSections").then((mod) => mod.HomeWorkflows),
  { ssr: true }
);
const HomeFounder = dynamic(
  () =>
    import("@/features/homepage/HomeSections").then((mod) => mod.HomeFounder),
  { ssr: true }
);
const HomeClosing = dynamic(
  () =>
    import("@/features/homepage/HomeSections").then((mod) => mod.HomeClosing),
  { ssr: true }
);
const Contact = dynamic(() => import("@/components/Contact"), { ssr: true });

export default function HomePage({ initialServerData }) {
  const { articles = [], resources = [] } = initialServerData || {};
  return (
    <>
      <Hero />
      <HomeTools />
      <HomeDoItAiSection />
      <HomePortableToolsSection />
      <HomeLearning articles={articles} />
      <HomeResources resources={resources} />
      <HomeWorkflows articles={articles} resources={resources} />
      <HomeFounder />
      <HomeClosing />
      <Contact homepage />
    </>
  );
}
