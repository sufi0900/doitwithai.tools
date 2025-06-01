/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client"
import Link from "next/link";
import React, { useState, useEffect } from 'react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CodeIcon from '@mui/icons-material/Code';
import SchoolIcon from '@mui/icons-material/School';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import GetAppIcon from '@mui/icons-material/GetApp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SpeedIcon from '@mui/icons-material/Speed';
import GroupIcon from '@mui/icons-material/Group';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';


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
      icon: <AutoAwesomeIcon className="text-blue-500" fontSize="large" />,
      description: "Discover powerful AI tools to streamline SEO tasks, automate workflows, and boost productivity.",
      link: "/ai-tools",
      color: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
      borderColor: "border-blue-200 dark:border-blue-800/30"
    },
    {
      title: "AI SEO",
      icon: <TrendingUpIcon className="text-green-500" fontSize="large" />,
      description: "Master modern SEO using AI for keyword research, content optimization, and technical SEO.",
      link: "/ai-seo",
      color: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
      borderColor: "border-green-200 dark:border-green-800/30"
    },
    {
      title: "AI Code",
      icon: <CodeIcon className="text-purple-500" fontSize="large" />,
      description: "Accelerate development and solve coding challenges using AI-powered programming tools.",
      link: "/ai-code",
      color: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
      borderColor: "border-purple-200 dark:border-purple-800/30"
    },
    {
      title: "AI Learn & Earn",
      icon: <MonetizationOnIcon className="text-amber-500" fontSize="large" />,
      description: "Acquire in-demand skills and unlock income opportunities through AI-powered learning.",
      link: "/ai-learn-earn",
      color: "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20",
      borderColor: "border-amber-200 dark:border-amber-800/30"
    },
    {
      title: "Free AI Resources",
      icon: <GetAppIcon className="text-cyan-500" fontSize="large" />,
      description: "Access free downloadable AI resources including templates, prompts, and tools.",
      link: "/ai-free-resources",
      color: "from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20",
      borderColor: "border-cyan-200 dark:border-cyan-800/30"
    }
  ];

  const features = [
    {
      icon: <SpeedIcon className="text-blue-500" fontSize="large" />,
      title: "Lightning Fast Results",
      description: "Double your SEO performance and productivity with AI-powered automation and optimization strategies."
    },
    {
      icon: <SecurityIcon className="text-green-500" fontSize="large" />,
      title: "Trusted & Reliable",
      description: "Research-backed insights and proven AI strategies that deliver consistent, measurable results."
    },
    {
      icon: <GroupIcon className="text-purple-500" fontSize="large" />,
      title: "Growing Community",
      description: "Join thousands of professionals who are transforming their work and success with AI tools."
    },
    {
      icon: <SupportAgentIcon className="text-amber-500" fontSize="large" />,
      title: "Expert Guidance",
      description: "Get actionable insights from AI experts who understand both technical implementation and business impact."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="relative inline-block mb-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
              About Do it with AI Tools
            </h1>
            <div 
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${60 + pulseIntensity * 20}%` }}
            />
          </div>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
            Your comprehensive platform for mastering <span className="font-bold text-blue-600 dark:text-blue-400">SEO with AI</span> and 
            exploring cutting-edge artificial intelligence tools that <span className="font-bold text-purple-600 dark:text-purple-400">double your productivity</span>.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/ai-seo" 
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Explore AI SEO
            </Link>
            <Link 
              href="/ai-tools" 
              className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Browse AI Tools
            </Link>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl p-8 md:p-12 mb-16 shadow-lg">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6">
              Our Mission: Democratizing AI for Everyone
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              At <span className="font-bold text-blue-600 dark:text-blue-400">Do it with AI Tools</span>, we believe artificial intelligence should empower 
              everyone - from small business owners and content creators to enterprise marketers and developers. Our platform bridges the gap between 
              complex AI technology and practical, real-world applications.
            </p>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              We specialize in <span className="font-bold text-purple-600 dark:text-purple-400">AI-powered SEO strategies</span> while providing comprehensive 
              resources for anyone looking to harness AI's potential in their personal and professional projects.
            </p>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Explore Our Five Dynamic Categories
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Each category is carefully curated with dynamic content, tools, and resources to help you succeed with AI
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

        {/* Why Choose Us */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Why Choose Do it with AI Tools?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We're not just another AI blog - we're your strategic partner in AI-powered success
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                <div className="flex items-start">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mr-6 flex-shrink-0">
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6 text-center">
              Meet the Creator
            </h2>
            <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-300 leading-relaxed">
              <p className="text-lg mb-6">
                I'm <span className="font-bold text-blue-600 dark:text-blue-400">Sufian Mustafa</span>, the sole creator and developer behind 
                Do it with AI Tools. As a passionate web developer and AI strategist, I've experienced firsthand how artificial intelligence 
                can transform both technical workflows and business outcomes.
              </p>
              <p className="text-lg mb-6">
                This platform was born from my journey of discovering how AI could not only automate repetitive tasks but fundamentally 
                change how we approach <span className="font-bold text-purple-600 dark:text-purple-400">SEO optimization</span>, 
                content creation, and digital strategy. Every article, tool recommendation, and resource is carefully curated based on 
                real-world testing and proven results.
              </p>
              <p className="text-lg">
                My mission is simple: make cutting-edge AI accessible to everyone, regardless of their technical background, while 
                maintaining a strong focus on <span className="font-bold text-green-600 dark:text-green-400">practical, actionable strategies</span> 
                that deliver measurable results.
              </p>
            </div>
          </div>
        </div>

        {/* AI Collaboration */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-8 md:p-12 mb-16 shadow-lg">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6">
              Built with AI, For AI Enthusiasts
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              This platform itself is a testament to the power of human-AI collaboration. Built with the assistance of advanced AI tools 
              like <span className="font-bold text-purple-600 dark:text-purple-400">ChatGPT</span> and 
              <span className="font-bold text-blue-600 dark:text-blue-400"> Claude</span>, every aspect from design to content creation 
              showcases what's possible when we embrace AI as a creative partner.
            </p>
            <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              The future is collaborative - humans and AI working together! 🤖✨
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Success with AI?
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Join thousands of professionals who are already doubling their SEO performance and productivity with our AI-powered strategies and tools.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/ai-seo" 
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Start with AI SEO
              </Link>
              <Link 
                href="/ai-free-resources" 
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-300"
              >
                Get Free Resources
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

