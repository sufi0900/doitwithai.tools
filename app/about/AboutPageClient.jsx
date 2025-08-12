/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
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
// import SpeedIcon from '@mui/icons-material/Speed';
import GroupIcon from '@mui/icons-material/Group';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import VerifiedIcon from '@mui/icons-material/Verified';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HandshakeIcon from '@mui/icons-material/Handshake';
import { LightbulbIcon, Star, ArrowRight, Twitter, Linkedin, Facebook } from "lucide-react";
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
  return (
    <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-900/20 dark:to-indigo-900/30 rounded-3xl p-8 md:p-12 mb-20 shadow-lg border border-blue-100 dark:border-blue-800/20">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
          Connect with Us
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Join our growing community and stay updated with the latest AI insights and tools.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        <Link 
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 shadow-md hover:scale-110 hover:shadow-xl transition-all duration-300"
        >
          <Twitter className="h-8 w-8 text-white group-hover:text-white/80 transition-colors" />
        </Link>
        <Link 
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center h-16 w-16 rounded-full bg-blue-700 shadow-md hover:scale-110 hover:shadow-xl transition-all duration-300"
        >
          <Linkedin className="h-8 w-8 text-white group-hover:text-white/80 transition-colors" />
        </Link>
        <Link 
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center h-16 w-16 rounded-full bg-blue-800 shadow-md hover:scale-110 hover:shadow-xl transition-all duration-300"
        >
          <Facebook className="h-8 w-8 text-white group-hover:text-white/80 transition-colors" />
        </Link>
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