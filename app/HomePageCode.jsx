import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import HomeTools from "@/features/tool-catalog/HomeTools";
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
      <HomeLearning articles={articles} />
      <HomeResources resources={resources} />
      <HomeWorkflows />
      <HomeFounder />
      <HomeClosing />
      <Contact homepage />
    </>
  );
}
