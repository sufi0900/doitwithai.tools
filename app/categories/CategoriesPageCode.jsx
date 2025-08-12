"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  ArrowRight,
  Search, 
  Code, 
  BookOpen, 
  Download,
  Zap,
  Users,
  Star,
  FileText,
  Image,
  Video,
  Text,
} from 'lucide-react';

const SearchIcon = Search;
const BuildIcon = Code;
const SchoolIcon = BookOpen;
const CodeIcon = Code;
const DownloadIcon = Download;

export default function CategoriesPageCode() {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const stats = [
    { icon: <BookOpen className="w-6 h-6" />, value: "148+", label: "Articles & Guides" },
    { icon: <Users className="w-6 h-6" />, value: "10K+", label: "Monthly Readers" },
    { icon: <Star className="w-6 h-6" />, value: "500+", label: "AI Tools Reviewed" },
    { icon: <Zap className="w-6 h-6" />, value: "24/7", label: "Fresh Content" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            Explore AI 
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Categories</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Discover comprehensive AI resources across 5 dynamic categories. Explore AI tools for boosting SEO & productivity, automating tasks, learning to earn, coding assistance, and accessing free resources to work smarter with artificial intelligence.
          </p>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2 text-blue-600 dark:text-blue-400">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Grid */}
       <div className="space-y-6">
          {/* SEO Category - Full Width Featured */}
          <Link href="/ai-seo">
            <div className="group mb-4 relative bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl border-2 border-transparent hover:border-blue-500 dark:border-gray-700 dark:hover:border-blue-400">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500 rounded-full translate-y-24 -translate-x-24"></div>
              </div>
              
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between">
                <div className="flex-1 text-gray-900 dark:text-white mb-8 lg:mb-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-2xl">
                      <SearchIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="px-4 py-1 bg-blue-100 dark:bg-blue-800/30 rounded-full text-sm font-medium text-blue-600 dark:text-blue-300">
                      🚀 Most Popular
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                    AI <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">SEO Mastery</span>
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl">
                    Transform your search rankings with cutting-edge AI tools and strategies. 
                    From keyword research to content optimization, master every aspect of modern SEO.
                  </p>
                  
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span>Ranking Strategies</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span>Content Optimization</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span>Competitor Analysis</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">15+ Tools & Guides</span>
                    <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400 transform group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
                
                <div className="lg:w-64 xl:w-80">
                  <div className="relative">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-6 transform rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-md">
                      <div className="space-y-3">
                        <div className="h-2 bg-blue-300 rounded-full"></div>
                        <div className="h-2 bg-blue-200 rounded-full w-3/4"></div>
                        <div className="h-2 bg-blue-100 rounded-full w-1/2"></div>
                        <div className="flex justify-between items-center mt-4">
                          <div className="text-2xl font-bold">📈</div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Growth</div>
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">+247%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* AI Code & AI Learn & Earn - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Code */}
            <Link href="/ai-code">
              <div 
                className="group relative bg-white dark:bg-gray-800 rounded-3xl p-8 overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:shadow-xl border-2 border-transparent hover:border-blue-500 dark:border-gray-700 dark:hover:border-blue-400"
                onMouseEnter={() => setHoveredCategory('code')}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-2xl">
                      <CodeIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-800/30 rounded-full text-sm font-medium text-blue-600 dark:text-blue-300">
                      🔥 Trending
                    </span>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    AI Code Assistant
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    Accelerate your development with AI-powered coding tools. Generate, debug, 
                    and optimize code faster than ever before.
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Code Generation</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Bug Detection</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Code Optimization</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">8+ Tools</span>
                    <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400 transform group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>

            {/* AI Learn & Earn */}
            <Link href="/ai-learn-earn">
              <div 
                className="group relative bg-white dark:bg-gray-800 rounded-3xl p-8 overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:shadow-xl border-2 border-transparent hover:border-purple-500 dark:border-gray-700 dark:hover:border-purple-400"
                onMouseEnter={() => setHoveredCategory('learn')}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-2xl">
                      <SchoolIcon className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-800/30 rounded-full text-sm font-medium text-purple-600 dark:text-purple-300">
                      💎 Premium
                    </span>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    AI Learn & Earn
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    Unlock new income streams while mastering AI skills. 
                    From freelancing to creating AI-powered products.
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Skill Development</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Income Strategies</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Market Opportunities</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-purple-600 dark:text-purple-400 text-sm font-semibold">12+ Guides</span>
                    <ArrowRight className="w-5 h-5 text-purple-600 dark:text-purple-400 transform group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* AI Tools - Full Width */}
          <Link href="/ai-tools" >
            <div className="group mt-8 mb-8 relative bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-10 overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-[1.01] hover:shadow-xl border-2 border-transparent hover:border-indigo-500 dark:border-gray-700 dark:hover:border-indigo-400">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-8 right-8 w-32 h-32 border-2 border-indigo-400 rounded-xl rotate-12"></div>
                <div className="absolute bottom-8 left-8 w-24 h-24 border-2 border-indigo-400 rounded-full"></div>
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                <div className="flex-1 text-gray-900 dark:text-white mb-6 md:mb-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-2xl">
                      <BuildIcon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="px-4 py-1 bg-indigo-100 dark:bg-indigo-800/30 rounded-full text-sm font-medium text-indigo-600 dark:text-indigo-300">
                      🛠️ Essential Tools
                    </span>
                  </div>
                  
                  <h3 className="text-3xl md:text-4xl font-bold mb-4">
                    AI Tools Collection
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg max-w-2xl">
                    Discover and master the most powerful AI tools for productivity, creativity, 
                    and business growth. Comprehensive reviews and tutorials included.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">50+</div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm">Tools Reviewed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">4.8★</div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm">User Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">24/7</div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm">Updates</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Free</div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm">& Premium</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-semibold">
                  <span className="mr-3">Explore Tools</span>
                  <ArrowRight className="w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </Link>

          {/* Free AI Resources */}
          <Link href="/free-ai-resources">
            <div className="group relative bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-10 overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-[1.01] hover:shadow-xl border-2 border-transparent hover:border-green-500 dark:border-gray-700 dark:hover:border-green-400">
              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-4 right-4 w-16 h-16 rounded-lg opacity-20 animate-pulse bg-green-500"></div>
                <div className="absolute bottom-8 left-8 w-12 h-12 rounded-full opacity-15 animate-bounce bg-green-500"></div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-4 bg-green-100 dark:bg-green-800/30 rounded-2xl">
                    <DownloadIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      Free <span className="bg-gradient-to-r from-green-600 to-cyan-600 bg-clip-text text-transparent">AI Resources</span>
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-800/30 text-green-600 dark:text-green-300 rounded-full text-sm font-bold">
                        100% FREE
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm font-medium">
                        🎁 No Signup Required
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-8 text-lg max-w-3xl">
                  Access our extensive library of free AI resources including prompts, templates, 
                  images, videos, and datasets. Everything you need to accelerate your AI journey.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  {[
                    { label: "Images", icon: <Image className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto" />, desc: "500+ Assets" },
                    { label: "Videos", icon: <Video className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto" />, desc: "100+ Clips" },
                    { label: "Templates", icon: <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto" />, desc: "200+ Files" },
                    { label: "Prompts", icon: <Text className="w-8 h-8 text-cyan-600 dark:text-cyan-400 mx-auto" />, desc: "50+ Prompts" },
                  ].map((item, i) => (
                    <div key={i} className="text-center group/item">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 mb-3 group-hover/item:bg-gray-200 dark:group-hover/item:bg-gray-600 transition-colors duration-300">
                        {item.icon}
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">{item.label}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span>Updated Weekly</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span>Instant Download</span>
                    </div>
                  </div>

                  <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                    <span className="mr-3">Start Downloading</span>
                    <ArrowRight className="w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Featured Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-center text-white mb-16 shadow-lg">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            New to AI? Start Here!
          </h2>
          <p className="text-xl mb-8 opacity-95 max-w-3xl mx-auto">
            Not sure where to begin? Our AI SEO category is perfect for beginners and experts alike. 
            Learn how to double your website traffic using cutting-edge AI strategies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ai-seo">
              <button className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-xl hover:bg-gray-100 transition-colors duration-300 flex items-center justify-center">
                Start with AI SEO
                <TrendingUp className="w-5 h-5 ml-2" />
              </button>
            </Link>
            <Link href="/free-ai-resources">
              <button className="border-2 border-white text-white font-semibold py-3 px-8 rounded-xl hover:bg-white hover:text-blue-600 transition-colors duration-300 flex items-center justify-center">
                Get Free Resources
                <Download className="w-5 h-5 ml-2" />
              </button>
            </Link>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
            Quick Navigation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-800/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">For Beginners</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Start with our AI Tools and Free Resources to get familiar with AI basics.
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/ai-tools" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Browse AI Tools →
                </Link>
                <Link href="/free-ai-resources" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Free Resources →
                </Link>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-800/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">For Marketers</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Focus on AI SEO and Learn & Earn to grow your business and income.
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/ai-seo" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Master AI SEO →
                </Link>
                <Link href="/ai-learn-earn" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Learn & Earn →
                </Link>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-800/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">For Developers</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Dive into AI Code and Tools to enhance your development workflow.
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/ai-code" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Explore AI Code →
                </Link>
                <Link href="/ai-tools" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Developer Tools →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}