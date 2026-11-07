import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import HomeTools from "@/features/tool-catalog/HomeTools";
import HomeDoItAiSection from "@/features/homepage/HomeDoItAiSection";
import HomePortableToolsSection from "@/features/homepage/HomePortableToolsSection";
import {
  HomeWorkflows,
  HomeLearning,
  HomeFounder,
  HomeClosing,
} from "@/features/homepage/HomeSections";
import HomeResources from "@/features/homepage/HomeResources";

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
