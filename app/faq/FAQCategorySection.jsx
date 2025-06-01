// components/FAQCategorySection.js

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import Link from 'next/link';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BuildIcon from '@mui/icons-material/Build';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import DevicesIcon from '@mui/icons-material/Devices';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BarChartIcon from '@mui/icons-material/BarChart';
import HomeIcon from '@mui/icons-material/Home';

export default function FAQCategorySection() {
  const categories = [
    {
      title: "About This Site",
      icon: <HelpOutlineIcon className="text-blue-500" fontSize="large" />,
      description: "Learn what doitwithai.tools is all about and how it can help you grow with AI.",
      count: 3,
      link: "/about"
    },
    {
      title: "AI Tools",
      icon: <BuildIcon className="text-green-500" fontSize="large" />,
      description: "In-depth reviews and how-to guides for the best AI tools available today.",
      count: 14,
      link: "/ai-tools"
    },
    {
      title: "Code with AI",
      icon: <DevicesIcon className="text-red-500" fontSize="large" />,
      description: "Discover how to build faster with AI-assisted code and automation.",
      count: 9,
      link: "/ai-code"
    },
    {
      title: "SEO with AI",
      icon: <SearchIcon className="text-purple-500" fontSize="large" />,
      description: "Boost your search rankings using AI for keyword research, content, and audits.",
      count: 11,
      link: "/ai-seo"
    },
   
    {
      title: "Learn with AI",
      icon: <MenuBookIcon className="text-cyan-500" fontSize="large" />,
      description: "Explore AI-powered learning methods and educational resources.",
      count: 6,
      link: "/ai-learn-earn"
    },
    {
      title: "Free AI Resources",
      icon: <DownloadIcon className="text-amber-500" fontSize="large" />,
      description: "Access free prompts, templates, tools, and datasets curated for AI users.",
      count: 10,
      link: "/free-ai-resources"
    },
    {
      title: "Homepage Overview",
      icon: <HomeIcon className="text-teal-500" fontSize="large" />,
      description: "Start here to explore top AI tools, latest blogs, and popular categories in one place.",
      count: 6,
      link: "/"
    },
    {
      title: "All Blog Articles",
      icon: <BarChartIcon className="text-indigo-500" fontSize="large" />,
      description: "Browse every article, guide, and update published across all categories.",
      count: 30,
      link: "/blogs"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-10 mb-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Browse by Category
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Quickly find what you’re looking for by exploring our main content areas
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {categories.map((category, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 mr-4">
                {category.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                {category.title}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
              {category.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {category.count} articles
              </span>
              <Link href={category.link}>
                <button className="text-primary hover:text-primary-dark text-sm font-medium transition-colors duration-300">
                  View All
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
