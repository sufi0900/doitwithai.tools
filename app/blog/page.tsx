
"use client"
import Link from "next/link";
import React, { useState, useEffect } from 'react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CodeIcon from '@mui/icons-material/Code';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import GetAppIcon from '@mui/icons-material/GetApp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
// import SpeedIcon from '@mui/icons-material/Speed';

import VerifiedIcon from '@mui/icons-material/Verified';
import HandshakeIcon from '@mui/icons-material/Handshake';
import { LightbulbIcon, Star, ArrowRight, } from "lucide-react";
import FavoriteIcon from '@mui/icons-material/Favorite';

// New Combined CTA and Trustpilot Component

// Combined CTA and Trustpilot Invite Component
const CombinedCTASection = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-900/20 dark:to-indigo-900/30 rounded-3xl p-8 md:p-12 mb-20 shadow-lg border border-blue-100 dark:border-blue-800/20">
      
      {/* Full Width Engaging Question */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
          What's Your Next AI Adventure?
        </h2>
      </div>

      {/* Full Width Supporting Text */}
      <div className="text-center mb-10">
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
          Now that you know our story and understand our human-AI collaboration approach, 
          we'd love to continue building this connection with you. There are two wonderful ways we can keep growing together.
        </p>
      </div>

      {/* Two-Column Action Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side - Write a Review */}
        <div className="bg-white/60 dark:bg-slate-800/60 rounded-2xl p-8 text-center border border-white/50 dark:border-slate-700/50">
          {/* Trustpilot Logo and Stars */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">Trustpilot</span>
              <div className="bg-[#00b67a] px-2 py-1 rounded-lg flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 text-white fill-white" />
                ))}
              </div>
            </div>
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-4">
            Share Your Experience
          </h3>
          
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            Your thoughts and experiences matter deeply to us, and sharing them on Trustpilot guides fellow AI enthusiasts to these authentic resources.
          </p>

          <Link 
            href="https://www.trustpilot.com/review/doitwithai.tools"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 rounded-lg bg-[#00b67a] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#009b69] hover:shadow-lg w-full"
          >
            Write a Review
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Right Side - Read Our Blog */}
        <div className="bg-white/60 dark:bg-slate-800/60 rounded-2xl p-8 text-center border border-white/50 dark:border-slate-700/50">
          {/* Blog Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-600 rounded-full">
              <LightbulbIcon className="w-8 h-8 text-white" />
            </div>
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-4">
            Explore Our Insights
          </h3>
          
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            Meanwhile, our blog awaits with fresh AI strategies and tutorials crafted with the same authentic approach you've just discovered.
          </p>

          <Link 
            href="/blogs"
            className="group inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-blue-700 hover:shadow-lg w-full"
          >
            Read Our Blog
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

      </div>

      {/* Optional: Small motivational footer */}
      <div className="text-center mt-8">
        <p className="text-sm text-slate-500 dark:text-slate-400 italic">
          Every review and every reader helps us build a stronger AI community 🚀
        </p>
      </div>

    </div>
  );
};


// New Social Media Component
const SocialMediaLinks = () => {
  const socialPlatforms = [
    {
      name: "YouTube",
      url: "https://www.youtube.com/@doitwithaitools",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800/30",
      hoverColor: "hover:from-red-600 hover:to-red-700",
      description: "Watch AI tutorials, tool reviews, and practical guides"
    },
    {
      name: "Pinterest",
      url: "https://www.pinterest.com/doitwithai/",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
        </svg>
      ),
      color: "from-red-600 to-red-700",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800/30",
      hoverColor: "hover:from-red-700 hover:to-red-800",
      description: "Discover AI tips, infographics, and visual inspiration"
    },
    {
      name: "X (Twitter)",
      url: "https://x.com/doitwithaitools",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
        </svg>
      ),
      color: "from-gray-800 to-black",
      bgColor: "bg-gray-50 dark:bg-gray-900/20",
      borderColor: "border-gray-200 dark:border-gray-800/30",
      hoverColor: "hover:from-gray-900 hover:to-black",
      description: "Get daily AI updates, quick tips, and industry insights"
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/company/do-it-with-ai-tools",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      color: "from-blue-600 to-blue-700",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800/30",
      hoverColor: "hover:from-blue-700 hover:to-blue-800",
      description: "Connect with our professional AI community"
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/profile.php?id=61579751720695&mibextid=ZbWKwL",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800/30",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
      description: "Join our AI community discussions and updates"
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@doitwithai.tools",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      ),
      color: "from-pink-500 to-red-500",
      bgColor: "bg-pink-50 dark:bg-pink-900/20",
      borderColor: "border-pink-200 dark:border-pink-800/30",
      hoverColor: "hover:from-pink-600 hover:to-red-600",
      description: "Watch quick AI tips and behind-the-scenes content"
    }
  ];

  return (
    <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-900/20 dark:to-indigo-900/30 rounded-3xl p-8 md:p-12 shadow-lg border border-blue-100 dark:border-blue-800/20">
      
      {/* Header Section */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
          Connect With Us Across Platforms
        </h2>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Join our growing community across multiple social platforms. Each platform offers unique content and ways to engage with the latest AI trends and tools.
        </p>
      </div>

      {/* Social Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {socialPlatforms.map((platform, index) => (
          <a
            key={index}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group bg-white/60 dark:bg-slate-800/60 ${platform.bgColor} rounded-2xl p-6 border ${platform.borderColor} hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer`}
          >
            <div className="flex items-center mb-4">
              <div className={`p-3 bg-gradient-to-r ${platform.color} ${platform.hoverColor} text-white rounded-xl mr-4 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                {platform.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                {platform.name}
              </h3>
            </div>
            
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
              {platform.description}
            </p>
            
            <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
              Follow us
              <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </a>
        ))}
      </div>

      {/* Call to Action Footer */}
      <div className="text-center bg-white/60 dark:bg-slate-800/60 rounded-2xl p-6 border border-white/50 dark:border-slate-700/50">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
          Stay Updated with the Latest AI Trends
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          Choose your favorite platform and never miss our latest AI tools, tutorials, and industry insights.
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Daily Updates
          </span>
          <span className="mx-2">•</span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            Exclusive Content
          </span>
          <span className="mx-2">•</span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            Community Discussions
          </span>
        </div>
      </div>
      
    </div>
  );
};

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
      description: "Discover powerful AI tools to streamline workflows, automate tasks, and boost daily productivity across various industries.",
      link: "/ai-tools",
      color: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
      borderColor: "border-blue-200 dark:border-blue-800/30"
    },
    {
      title: "AI SEO", 
      icon: <TrendingUpIcon className="text-blue-600" fontSize="large" />,
      description: "Master comprehensive SEO strategies using AI for content optimization, technical analysis, and performance tracking.",
      link: "/ai-seo",
      color: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
      borderColor: "border-blue-200 dark:border-blue-800/30"
    },
    {
      title: "AI Code",
      icon: <CodeIcon className="text-blue-600" fontSize="large" />,
      description: "Accelerate development and solve coding challenges using AI-powered programming tools and automation techniques.",
      link: "/ai-code", 
      color: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
      borderColor: "border-blue-200 dark:border-blue-800/30"
    },
    {
      title: "AI Learn & Earn",
      icon: <MonetizationOnIcon className="text-blue-600" fontSize="large" />,
      description: "Acquire in-demand skills and unlock income opportunities through AI-powered learning and monetization strategies.",
      link: "/ai-learn-earn",
      color: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", 
      borderColor: "border-blue-200 dark:border-blue-800/30"
    },
    {
      title: "Free AI Resources",
      icon: <GetAppIcon className="text-blue-600" fontSize="large" />,
      description: "Access free downloadable AI resources including templates, prompts, guides, and tools for immediate use.",
      link: "/ai-free-resources",
      color: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
      borderColor: "border-blue-200 dark:border-blue-800/30"
    }
  ];

    const features = [
      {
        icon: <VerifiedIcon className="text-blue-600" fontSize="large" />,
        title: "Authentic & Trusted Insights",
        description: "Every tool, strategy, and guide is carefully tested and used for my daily workflow before being recommended to you. We focus on delivering proven, reliable information you can trust."
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Hero Section - Enhanced with Brand Blue */}
        <div className="text-center mb-20">
          <div className="relative inline-block mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent leading-tight">
              About Do It With AI Tools
            </h1>
            <div 
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full transition-all duration-300"
              style={{ width: `${60 + pulseIntensity * 20}%` }}
            />
          </div>
          
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed mb-8">
            Discover the story, mission, and vision behind 
            <span className="font-semibold text-blue-600 dark:text-blue-400"> Do It With AI Tools</span> - 
            your comprehensive platform designed to empower professionals and enthusiasts with practical AI knowledge and proven tools.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/blogs"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Read Our Blog
            </Link>
            <Link 
              href="/ai-free-resources"
              className="px-8 py-4 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold rounded-xl border-2 border-blue-200 dark:border-blue-700 hover:border-blue-600 dark:hover:border-blue-500 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Get Free Resources
            </Link>
          </div>
        </div>

        {/* Mission Statement - Enhanced */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100/80 dark:from-blue-900/20 dark:to-blue-800/30 rounded-3xl p-8 md:p-12 mb-20 shadow-lg border border-blue-100 dark:border-blue-800/20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-8">
              Our Mission: Making AI Accessible to Everyone
            </h2>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              At <span className="font-semibold text-blue-600 dark:text-blue-400">Do It With AI Tools</span>, 
              we believe artificial intelligence should empower everyone. Our platform serves small business owners, 
              content creators, enterprise marketers, developers, and anyone seeking practical AI solutions for their work and projects.
            </p>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              We bridge the gap between complex AI technology and real-world applications. From 
              <span className="font-semibold text-blue-600 dark:text-blue-400"> AI-powered SEO strategies </span> 
               to productivity tools and coding resources, we provide comprehensive solutions for anyone looking to harness AI's potential effectively.
            </p>
          </div>
        </div>

        {/* Categories Section - Brand Blue Focus */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-6">
              Explore Our Five Dynamic Categories
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Each category is carefully curated with dynamic content, tools, and resources to help you succeed with AI
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Link href={category.link} key={index}>
                <div className={`bg-gradient-to-br ${category.color} rounded-2xl p-8 shadow-md hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 ${category.borderColor} border cursor-pointer h-full group`}>
                  <div className="flex items-center mb-6">
                    <div className="p-4 bg-white/70 dark:bg-slate-700/70 rounded-xl mr-4 group-hover:bg-white dark:group-hover:bg-slate-600 transition-all duration-300">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                      {category.title}
                    </h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {category.description}
                  </p>
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                    Explore {category.title} →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Why Choose Us - Enhanced */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-6">
              Why Choose Do It With AI Tools?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              We're not just another AI blog - we're your trusted partner in AI-powered success with authentic, tested solutions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 dark:border-blue-800/20 group">
                <div className="flex items-start">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl mr-6 flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Creator Section - Enhanced */}
    
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 mb-20 shadow-lg border border-blue-100 dark:border-blue-800/20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-8 text-center">
              Meet the Creator
            </h2>
            
            <div className="prose prose-lg max-w-none text-slate-600 dark:text-slate-300 leading-relaxed">
              <p className="text-lg mb-6">
                I'm <Link href="/author/sufian-mustafa" className="font-semibold text-blue-600 dark:text-blue-400 underline hover:no-underline">Sufian Mustafa</Link>, 
                the sole creator and developer behind Do It With AI Tools. As a passionate web developer and AI strategist, 
                I've experienced firsthand how artificial intelligence can transform both technical workflows and business outcomes.
              </p>
              
              <p className="text-lg mb-6">
                This platform was born from my journey of discovering how AI could not only automate repetitive tasks 
                but fundamentally change how we approach 
                <span className="font-semibold text-blue-600 dark:text-blue-400"> SEO optimization</span>, 
                content creation, and digital strategy. Every article, tool recommendation, and resource is carefully 
                curated based on my real-world testing and proven results.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg text-center shadow-inner">
                <p className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  My mission is simple:
                </p>
                <p className="text-lg md:text-xl text-gray-800 dark:text-gray-200">
                  Make cutting-edge AI accessible to everyone, regardless of their technical background, while maintaining a strong focus on practical, actionable strategies that deliver measurable results.
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* AI Collaboration Section - Enhanced */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/30 rounded-3xl p-8 md:p-12 mb-20 shadow-lg border border-blue-100 dark:border-blue-800/20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-8">
              Built with AI, Powered by Human Expertise
            </h2>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              This platform itself demonstrates the power of human-AI collaboration. From its initial design and development to its final code, this site was built with the assistance of advanced AI tools like ChatGPT, Gemini and Claude. <span className="font-semibold text-blue-600 dark:text-blue-400">This showcases what's possible when we embrace AI as a creative partner.</span>
            </p>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              I apply a similar, human-led approach to our content. I use it for research, structuring, and enhancing my drafts, but it is never a replacement for human expertise. Every piece of content is shaped by my personal insights and rigorous testing, ensuring it is 100% authentic, trustworthy, and genuinely helpful for your success.
            </p>
            
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              The future is collaborative - humans and AI working together to create authentic, valuable solutions! 🤖✨
            </p>
          </div>
        </div>
        
      
          <CombinedCTASection />
          <SocialMediaLinks />


      </div>
    </div>
  );
};