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
  const {
    articles = [],
    resources = [],
    workflowArticles = [],
  } = initialServerData || {};
  return (
    <>
      <Hero />
      <HomeTools />
      <HomeWorkflows articles={workflowArticles} />
      <HomeLearning articles={articles} />
      <HomeResources resources={resources} />
      <HomeFounder />
      <HomeClosing />
    </>
  );
}
