/*eslint-disable @next/next/no-img-element*/
/*eslint-disable react/no-unescaped-entities*/
"use client"
import Link from "next/link";
import React, { useState, useEffect } from 'react';
import dynamic from "next/dynamic";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CodeIcon from '@mui/icons-material/Code';
import SchoolIcon from '@mui/icons-material/School';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import GetAppIcon from '@mui/icons-material/GetApp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VerifiedIcon from '@mui/icons-material/Verified';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import HandshakeIcon from '@mui/icons-material/Handshake';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function AboutPageClient() {
  const [animationPhase, setAnimationPhase] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);
  const pulseIntensity = Math.abs(Math.sin(animationPhase * 0.1)) * 0.5 + 0.5;

  const categories = [
    {
      title: "AI Tools",
      icon: <AutoAwesomeIcon className="text-blue-600" fontSize="large" />,
      description: "Discover powerful AI tools to streamline SEO tasks, automate workflows, and boost productivity.",
      link: "/ai-tools",
      color: "from-blue-50 to-white dark:from-blue-900/30 dark:to-gray-800",
      borderColor: "border-blue-200 dark:border-blue-800/30"
    },
    {
      title: "AI SEO",
      icon: <TrendingUpIcon className="text-blue-600" fontSize="large" />,
      description: "Master AI-powered SEO strategies to boost your rankings and improve your online presence.",
      link: "/ai-seo",
      color: "from-blue-50 to-white dark:from-blue-900/30 dark:to-gray-800",
      borderColor: "border-blue-200 dark:border-blue-800/30"
    },
    {
      title: "AI Code",
      icon: <CodeIcon className="text-blue-600" fontSize="large" />,
      description: "Accelerate development and solve coding challenges using AI-powered programming tools.",
      link: "/ai-code",
      color: "from-blue-50 to-white dark:from-blue-900/30 dark:to-gray-800",
      borderColor: "border-blue-200 dark:border-blue-800/30"
    },
    {
      title: "AI Learn & Earn",
      icon: <MonetizationOnIcon className="text-blue-600" fontSize="large" />,
      description: "Acquire in-demand skills and unlock income opportunities through AI-powered learning.",
      link: "/ai-learn-earn",
      color: "from-blue-50 to-white dark:from-blue-900/30 dark:to-gray-800",
      borderColor: "border-blue-200 dark:border-blue-800/30"
    },
    {
      title: "Free AI Resources",
      icon: <GetAppIcon className="text-blue-600" fontSize="large" />,
      description: "Access a library of free downloadable AI resources including templates, prompts, and guides.",
      link: "/ai-free-resources",
      color: "from-blue-50 to-white dark:from-blue-900/30 dark:to-gray-800",
      borderColor: "border-blue-200 dark:border-blue-800/30"
    }
  ];

  const features = [
    {
      icon: <VerifiedIcon className="text-blue-600" fontSize="large" />,
      title: "Authentic & Trusted Insights",
      description: "Every tool, strategy, and guide is meticulously tested and used for my daily workflow before being recommended to you. We focus on delivering proven, reliable information you can trust."
    },
    {
      icon: <LightbulbIcon className="text-blue-600" fontSize="large" />,
      title: "Practical & Beginner-Friendly",
      description: "We believe in making AI accessible to everyone. Our content breaks down complex concepts into simple, actionable steps, ensuring users of all skill levels can easily implement our strategies."
    },
    {
      icon: <HandshakeIcon className="text-blue-600" fontSize="large" />,
      title: "Freemium Tools & Resources",
      description: "Discover a wide range of freemium tools and a growing library of free downloadable assets. We're committed to lowering the barrier to entry, so you can start your AI journey without a hefty investment."
    },
    {
      icon: <FavoriteIcon className="text-blue-600" fontSize="large" />,
      title: "User-Centric Approach",
      description: "Our content is built with immense respect for our users. We think from your perspective, ensuring that every sentence, heading, and resource is relevant, necessary, and helps you achieve your goals."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="relative inline-block mb-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-600 dark:text-blue-400 leading-tight">
              About DoitwithAITools
            </h1>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-300" style={{ width: `${60 + pulseIntensity * 20}%` }} />
          </div>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
            This is your go-to platform for mastering AI tools that **boost SEO** and **double everyday productivity**. We're dedicated to empowering you with the knowledge to thrive in the AI-driven world.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/ai-seo" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              Explore AI SEO
            </Link>
            <Link href="/ai-tools" className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              Browse AI Tools
            </Link>
          </div>
        </div>

        {/* Our Mission Section */}
        <div className="bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/30 dark:to-gray-800 rounded-2xl p-8 md:p-12 mb-16 shadow-lg">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6">Our Mission: Democratizing AI for Everyone</h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              At **doitwithai.tools**, we believe artificial intelligence should empower everyone. Our platform bridges the gap between complex AI technology and practical, real-world applications. We're here to help a wide range of individuals, from seasoned marketers and developers to new content creators and small business owners.
            </p>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Our core focus is on **AI-powered SEO strategies**. But we also provide comprehensive resources for anyone looking to harness AI’s potential for their personal and professional projects.
            </p>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">Explore Our Five Dynamic Categories</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Each category is carefully curated with dynamic content, tools, and resources to help you succeed with AI.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Link href={category.link} key={index}>
                <div className={`bg-gradient-to-br ${category.color} rounded-xl p-6 shadow-md hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 ${category.borderColor} border cursor-pointer h-full`}>
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg mr-4">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      {category.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {category.description}
                  </p>
                  <div className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                    Explore {category.title} →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">Why Choose DoitwithAITools?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We're more than a platform. We are your partner in navigating the AI landscape with trust and clarity.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                <div className="flex items-start">
                  <div className="p-3 bg-blue-50 dark:bg-gray-700 rounded-lg mr-6 flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Creator Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 mb-16 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6 text-center">Meet the Creator</h2>
            <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-300 leading-relaxed">
              <p className="text-lg mb-6">
                I'm **Sufian Mustafa**, the sole creator and developer behind DoitwithAITools. As a passionate web developer and AI strategist, I've experienced firsthand how artificial intelligence can transform both technical workflows and business outcomes.
              </p>
              <p className="text-lg mb-6">
                This platform was born from my journey of discovering how AI could not only automate repetitive tasks but also fundamentally change how we approach **SEO optimization**, content creation, and digital strategy. Every article, tool recommendation, and resource is carefully curated based on my real-world testing and proven results.
              </p>
              <p className="text-lg mb-6">
                My mission is simple: to make cutting-edge AI accessible to everyone, regardless of their technical background. I do this while maintaining a strong focus on **practical, actionable strategies** that deliver measurable results.
              </p>
              <p className="text-lg">
                I believe in providing valuable knowledge and tools while respecting your time and effort. I write every piece of content with the user's perspective in mind, ensuring it's always relevant and necessary for your success.
              </p>
            </div>
          </div>
        </div>

        {/* AI Collaboration Section */}
      {/* // AI Collaboration Section */}
<div className="bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/30 dark:to-gray-800 rounded-2xl p-8 md:p-12 mb-16 shadow-lg border border-gray-100 dark:border-gray-700">
  <div className="max-w-4xl mx-auto text-center">
    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6">
      Our Approach: Human-Led, AI-Enhanced
    </h2>
    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
      This platform itself is a testament to the power of human-AI collaboration. From its initial design and development to its final code, this site was built with the assistance of advanced AI tools. This showcases what's possible when we embrace AI as a creative partner.
    </p>
    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
      **AI serves as a powerful assistant for my content creation process.** I use it for research, structuring, and enhancing my drafts, but it is never a replacement for human expertise. Every piece of content is shaped by my personal insights and rigorous testing, ensuring it is 100% authentic, trustworthy, and genuinely helpful for your success.
    </p>
  </div>
</div>

        {/* Final CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Begin Your AI-Powered Journey Today</h2>
            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              Start with our expert strategies and tools to enhance your SEO and streamline your daily productivity, regardless of your skill level.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/ai-seo" className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg">
                Start Learning Now
              </Link>
              <Link href="/contact" className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transform hover:scale-105 transition-all duration-300 shadow-lg">
                Contact Our Team
              </Link>
            </div>
            <p className="mt-8 text-sm opacity-70">
              Thank you for being here and joining us on this journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}