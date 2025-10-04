/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client"
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { 

  Code, 

  AutoAwesome, 
  Verified, 
  Handshake,
  Favorite 
} from '@mui/icons-material';
import { 
  Star, 
  ArrowRight, 
  Twitter, 
  Linkedin, 
  Facebook,
  User,
  Award,
  Target,
  Users,
  Lightbulb,
  LightbulbIcon
} from "lucide-react";
import Image from 'next/image';

// Hero Section - UPDATED with modern focus
const HeroSection = ({ animationPhase, pulseIntensity }) => (
  <div className="relative text-center mb-32 overflow-hidden">
    <div className="absolute inset-0 "></div>
    
    <div className="relative z-10">
      <div className="relative inline-block mb-8">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent leading-tight">
          About DoIt With AI Tools
        </h1>
        <div 
          className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 h-1.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full transition-all duration-300"
          style={{width: `${60 + pulseIntensity * 20}%`}}
        />
      </div>
      
      <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-5xl mx-auto leading-relaxed mb-12">
        Discover the story behind 
        <span className="font-semibold text-blue-600 dark:text-blue-400"> DoIt With AI Tools</span>
        — your modern AI hub for mastering content creation, SEO optimization (including AI search engines), and business scaling strategies that deliver real results.
      </p>
      
      <div className="flex flex-wrap justify-center gap-6">
        <Link href="/blogs" className="group px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl">
          <span className="flex items-center gap-2">
            Read Our Blog
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </span>
        </Link>
        <Link href="/ai-free-resources" className="px-10 py-5 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold rounded-2xl border-2 border-blue-200 dark:border-blue-700 hover:border-blue-600 dark:hover:border-blue-500 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl">
          Get Free Resources
        </Link>
      </div>
    </div>
  </div>
);

// Creator & Mission Section - UPDATED with specific focus
const CreatorMissionSection = () => (
  <div className="mb-32">
    <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-900/20 rounded-3xl overflow-hidden shadow-xl border border-blue-100 dark:border-blue-800/20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Image Section - UNCHANGED */}
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex items-center justify-center">
          <div className="text-center">
            <div className="w-64 h-64 mx-auto mb-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
              <Image
                src="/sufi.png"
                alt="Sufian Mustafa - Creator of DoItWithAITools"
                width={256}
                height={256}
                priority
                className="object-cover w-full h-full"
              />        
            </div>

            <div className="flex justify-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                <div className="flex items-center gap-2 text-white">
                  <Award className="w-5 h-5" />
                  <span className="font-semibold">AI Strategist</span>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                <div className="flex items-center gap-2 text-white">
                  <Code className="w-5 h-5" />
                  <span className="font-semibold">Web Developer</span>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <div className="flex items-center gap-4 justify-center">
                <div className="flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  <span className="font-semibold">Growing Community</span>
                </div>
                {/* <div className="w-px h-8 bg-white/30"></div>
                <span className="text-blue-100">10K+ Readers</span> */}
              </div>
            </div>
          </div>
          <div className="absolute top-6 right-6 w-20 h-20 bg-white/10 rounded-full blur-sm"></div>
          <div className="absolute bottom-8 left-8 w-16 h-16 bg-white/10 rounded-full blur-sm"></div>
        </div>

        {/* Content Section - UPDATED with specific positioning */}
        <div className="p-12">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <User className="w-4 h-4" />
              Meet the Creator
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-6">
              Making Modern AI Strategies Accessible
            </h2>
          </div>

          <div className="prose prose-lg max-w-none text-slate-600 dark:text-slate-300 leading-relaxed space-y-6">
            <p>
              I'm <Link href="/author/sufian-mustafa" className="font-semibold text-blue-600 dark:text-blue-400 underline hover:no-underline">Sufian Mustafa</Link>, 
              the creator and developer behind DoItWithAITools. As a web developer, AI strategist, and SEO specialist, 
              I've experienced firsthand how generative AI transforms content creation, search optimization, and business outcomes.
            </p>
            
            <p>
              At <span className="font-bold text-blue-600 dark:text-blue-400">DoItWithAITools</span>, we focus on what matters most: 
              helping content creators, marketers, SEO specialists, and business owners master AI-powered strategies for 
              creating high-quality content optimized for traditional search engines (SEO), AI-powered search (GEO), and answer engines (AEO).
            </p>

            {/* Mission highlight box - UPDATED */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 rounded-2xl border border-blue-200 dark:border-blue-800/30 not-prose">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-600 rounded-xl">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">Our Mission</h3>
                  <p className="text-gray-700 dark:text-gray-200">
                    To be your modern AI hub that makes cutting-edge content creation and SEO strategies accessible to everyone, 
                    with practical workflows that help you scale your business and boost productivity through proven AI-powered methods.
                  </p>
                </div>
              </div>
            </div>

            {/* <p>
              We bridge the gap between complex AI technology and real-world content success. From 
              <span className="font-semibold text-blue-600 dark:text-blue-400"> AI-powered content strategies</span> to 
              modern SEO optimization and productivity workflows, we provide comprehensive solutions for the next generation of digital success.
            </p> */}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// AI Collaboration - SLIGHT UPDATE to add content context
const AICollaborationSection = () => (
  <div className="mb-32">
    <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-900/20 rounded-3xl p-12 md:p-16 shadow-xl border border-blue-100 dark:border-blue-800/20 relative overflow-hidden">
      <div className="absolute top-8 right-8 text-6xl opacity-10">🤖</div>
      <div className="absolute bottom-8 left-8 text-4xl opacity-10">✨</div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-6 py-3 rounded-full text-sm font-semibold mb-8">
          <AutoAwesome className="w-5 h-5" />
          Human-AI Collaboration
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-8">
          Built with AI, Powered by Human Expertise
        </h2>
        
        <div className="space-y-6 text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            This platform itself demonstrates the power of human-AI collaboration. From design and development 
            to content creation and SEO optimization, this site was built with advanced AI tools like 
            ChatGPT, Gemini, and Claude. <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            This showcases what's possible when we embrace AI as a strategic partner in content and business growth.</span>
          </p>
          
          <p>
            I apply the same human-led approach to all our content. AI assists with research, structuring, and 
            optimization, but every strategy, insight, and recommendation is shaped by real testing and expertise. 
            This ensures our content is 100% authentic, trustworthy, and genuinely helpful for scaling your projects and achieving measurable results.
          </p>
        </div>
        
        <div className="mt-12 p-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white">
          <p className="text-xl md:text-2xl font-bold">
            The future is collaborative - humans and AI working together to create authentic content and business success! 🤖✨
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Categories Section - UPDATED descriptions for content/SEO/business focus
// const CategoriesSection = ({ categories }) => (
//   <div className="mb-32">
//     <div className="text-center mb-16">
//       <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-6 py-3 rounded-full text-sm font-semibold mb-6">
//         <Lightbulb className="w-5 h-5" />
//         What We Offer
//       </div>
//       <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-6">
//         Your Complete Modern AI Hub
//       </h2>
//       <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
//         Five strategic categories designed to help you master AI for content creation, SEO optimization, and business growth
//       </p>
//     </div>
    
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//       {categories.map((category, index) => (
//         <Link href={category.link} key={index}>
//           <div className={`bg-gradient-to-br ${category.color} rounded-3xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-300 ${category.borderColor} border cursor-pointer h-full group relative overflow-hidden`}>
//             <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
            
//             <div className="relative z-10">
//               <div className="flex items-center mb-6">
//                 <div className="p-4 bg-white/70 dark:bg-slate-700/70 rounded-2xl mr-4 group-hover:bg-white dark:group-hover:bg-slate-600 transition-all duration-300 group-hover:scale-110">
//                   {category.icon}
//                 </div>
//                 <h3 className="text-xl font-bold text-slate-800 dark:text-white">
//                   {category.title}
//                 </h3>
//               </div>
              
//               <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
//                 {category.description}
//               </p>
              
//               <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
//                 Explore {category.title}
//                 <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
//               </div>
//             </div>
//           </div>
//         </Link>
//       ))}
//     </div>
//   </div>
// );

// Why Choose Us - UPDATED with modern SEO/content focus
const WhyChooseUsSection = ({ features }) => (
  <div className="mb-32">
    <div className="text-center mb-16">
      <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-6 py-3 rounded-full text-sm font-semibold mb-6">
        <Award className="w-5 h-5" />
        Why Choose Us
      </div>
      <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-6">
        Your Modern AI Content & SEO Partner
      </h2>
      <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
        Not just another AI blog — we're your strategic partner specializing in modern content creation, next-generation SEO, and business scaling
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {features.map((feature, index) => (
        <div key={index} className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100 dark:border-blue-800/20 group hover:-translate-y-2">
          <div className="flex items-start">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl mr-6 flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-all duration-300 group-hover:scale-110">
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
);

// CTA Section - UNCHANGED (already effective)
const CombinedCTASection = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-900/20 dark:to-indigo-900/30 rounded-3xl p-8 md:p-12 mb-20 shadow-lg border border-blue-100 dark:border-blue-800/20">
      
      {/* Full Width Engaging Question & Supporting Text remain unchanged */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
          What's Your Next AI Adventure?
        </h2>
      </div>

      <div className="text-center mb-10">
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
          Now that you know our story and understand our human-AI collaboration approach, 
          we'd love to continue building this connection with you. There are two wonderful ways we can keep growing together.
        </p>
      </div>

      {/* Two-Column Action Section - IMPORTANT: Add h-full to this grid container's children */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side - Write a Review */}
        <div className="bg-white/60 dark:bg-slate-800/60 rounded-2xl p-8 text-center border border-white/50 dark:border-slate-700/50">
          {/* Apply Flex classes here to align button to the bottom */}
          <div className="flex flex-col h-full justify-between "> 
            <div>
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
            </div>

            <Link 
              href="https://www.trustpilot.com/review/doitwithai.tools"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-[#00b67a] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#009b69] hover:shadow-lg w-full mt-auto" // mt-auto optional, but good practice
            >
              Write a Review
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Right Side - Read Our Blog */}
        <div className="bg-white/60 dark:bg-slate-800/60 rounded-2xl p-8 text-center border border-white/50 dark:border-slate-700/50">
          {/* Apply Flex classes here to align button to the bottom */}
          <div className="flex flex-col h-full justify-between">
            <div>
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
            </div>

            <Link 
              href="/blogs"
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-blue-700 hover:shadow-lg w-full mt-auto" // mt-auto optional, but good practice
            >
              Read Our Blog
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
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


// Main component with UPDATED data
export default function ImprovedAboutPage() {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const pulseIntensity = Math.abs(Math.sin(animationPhase * 0.1)) * 0.5 + 0.5;

  // UPDATED categories with content/SEO/business focus
  

  // UPDATED features with modern SEO/content focus
  const features = [
    {
      icon: <Verified className="text-blue-600" fontSize="large" />,
      title: "Modern SEO Expertise",
      description: "Every strategy is tested across traditional search (SEO), AI-powered search engines (GEO), and answer engines (AEO). We focus on what works today and tomorrow, not outdated tactics."
    },
    {
      icon: <Lightbulb className="text-blue-600" />,
      title: "Content Creation Mastery",
      description: "Learn how to create high-quality content using AI that maintains your authentic voice while optimizing for all modern search platforms. Practical workflows for content creators and marketers."
    },
    {
      icon: <Handshake className="text-blue-600" fontSize="large" />,
      title: "Business Scaling Focus",
      description: "We prioritize strategies that help you scale—saving 10+ hours weekly, boosting productivity, and growing your business with proven AI workflows and free implementation resources."
    },
    {
      icon: <Favorite className="text-blue-600" fontSize="large" />,
      title: "Human-AI Collaboration",
      description: "Our approach combines human expertise with AI capabilities. Every recommendation, workflow, and strategy respects your goals while showing you how to leverage AI as a strategic partner."
    }
  ];

const SocialMediaLinks = () => {

const LinktreeIcon = (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V8h2v4z"/>
  </svg>
);

// New Instagram Icon (simple gradient style)
const InstagramIcon = (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.772 1.691 4.974 4.974.058 1.265.069 1.645.069 4.849 0 3.204-.012 3.584-.069 4.849-.202 3.283-1.722 4.834-4.974 4.974-1.265.058-1.645.069-4.849.069s-3.585-.012-4.849-.069c-3.252-.148-4.773-1.691-4.974-4.974-.058-1.265-.069-1.645-.069-4.849s.012-3.584.069-4.849c.202-3.283 1.722-4.834 4.974-4.974 1.265-.057 1.645-.069 4.849-.069zm0 2.115c-3.262 0-3.64.012-4.908.07-.361.016-.68.083-.984.202-.303.12-.569.294-.821.546-.252.252-.427.518-.546.821-.12.304-.187.623-.202.984-.058 1.268-.07 1.645-.07 4.908s.012 3.64.07 4.908c.016.361.083.68.202.984.12.303.294.569.546.821.252.252.518.427.821.546.304.12.623.187.984.202 1.268.058 1.645.07 4.908.07s3.64-.012 4.908-.07c.361-.016.68-.083.984-.202.303-.12.569-.294.821-.546.252-.252.427-.518.546-.821.12-.304.187-.623.202-.984.058-1.268.07-1.645.07-4.908s-.012-3.64-.07-4.908c-.016-.361-.083-.68-.202-.984-.12-.303-.294-.569-.546-.821-.252-.252-.518-.427-.821-.546-.304-.12-.623-.187-.984-.202-1.268-.058-1.645-.07-4.908-.07zm0 1.666c2.585 0 4.686 2.101 4.686 4.686s-2.101 4.686-4.686 4.686-4.686-2.101-4.686-4.686 2.101-4.686 4.686-4.686zm0 1.996c-1.488 0-2.69 1.202-2.69 2.69s1.202 2.69 2.69 2.69 2.69-1.202 2.69-2.69-1.202-2.69-2.69-2.69zm5.353-2.674c0 .641-.523 1.164-1.164 1.164s-1.164-.523-1.164-1.164.523-1.164 1.164-1.164 1.164.523 1.164 1.164z"/>
  </svg>
);

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
    },
     {
      name: "Free AI Resources",
      url: "/free-ai-resources", // Use internal Next.js link
      icon: <LightbulbIcon className="w-6 h-6" />,
      color: "from-green-500 to-teal-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800/30",
      hoverColor: "hover:from-green-600 hover:to-teal-600",
      description: "Get templates, prompts, and assets for instant use on your projects."
    },
  
    {
      name: "Instagram",
      url: "https://www.instagram.com/doitwithaitools/", // Assuming this URL is correct
      icon: InstagramIcon,
      color: "from-fuchsia-500 via-pink-500 to-orange-400", // Instagram-like gradient
      bgColor: "bg-fuchsia-50 dark:bg-fuchsia-900/20",
      borderColor: "border-fuchsia-200 dark:border-fuchsia-800/30",
      hoverColor: "hover:from-fuchsia-600 hover:via-pink-600 hover:to-orange-500",
      description: "Find short-form engaging content, reels, and visual AI insights."
    },
  
    {
      name: "Linktree",
      url: "https://linktr.ee/doitwithaitools", // Assuming this URL is correct
      icon: LinktreeIcon,
      color: "from-lime-500 to-cyan-500", // Unique blend for Linktree (often uses multiple colors)
      bgColor: "bg-lime-50 dark:bg-lime-900/20",
      borderColor: "border-lime-200 dark:border-lime-800/30",
      hoverColor: "hover:from-lime-600 hover:to-cyan-600",
      description: "Find all our links, resources, and latest content in one place."
    },
    
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
      className={`social-card bg-white/60 dark:bg-slate-800/60 ${platform.bgColor} rounded-2xl p-6 border ${platform.borderColor} cursor-pointer`}
    >
      <div className="flex items-center mb-4">
        <div className={`social-icon p-3 bg-gradient-to-r ${platform.color} text-white rounded-xl mr-4 shadow-lg`}>
          {platform.icon}
        </div>
        <h3 className="social-title text-xl font-bold text-slate-800 dark:text-white">
          {platform.name}
        </h3>
      </div>
      
      <p className="social-description text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
        {platform.description}
      </p>
      
      <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
        Follow us
        <ArrowRight className="social-arrow h-4 w-4 ml-2" />
      </div>
    </a>
        ))}
      </div>

      {/* Call to Action Footer (Remains the same) */}
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <HeroSection animationPhase={animationPhase} pulseIntensity={pulseIntensity} />
        <CreatorMissionSection/>
        <AICollaborationSection />
        {/* <CategoriesSection categories={categories} /> */}
        <WhyChooseUsSection features={features} />
        <CombinedCTASection />
<SocialMediaLinks/>

      </div>
    </div>
  );
}