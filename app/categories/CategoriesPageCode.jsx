"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  GraduationCap, 
  ArrowRight,
Search, 
  Code, 
  BookOpen, 
  Wrench, 
  Download,
  Zap,
  Users,
  Star,
  Play,
  FileText,
  Image,
  Video,
  Headphones,
  Text

} from 'lucide-react';

// MUI Icons (using lucide-react equivalents for compatibility)
const BuildIcon = Code;
const SearchIcon = Search;
const BarChartIcon = TrendingUp;
const MenuBookIcon = BookOpen;
const DownloadIcon = Download;

const CodeIcon = Code;
const SchoolIcon = BookOpen;


export default function CategoriesPageCode() {
  const [hoveredCategory, setHoveredCategory] = useState(null);


  const stats = [
    { icon: <BookOpen className="w-6 h-6" />, value: "148+", label: "Articles & Guides" },
    { icon: <Users className="w-6 h-6" />, value: "10K+", label: "Monthly Readers" },
    { icon: <Star className="w-6 h-6" />, value: "500+", label: "AI Tools Reviewed" },
    { icon: <Zap className="w-6 h-6" />, value: "24/7", label: "Fresh Content" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-white mb-6">
            Explore AI 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Categories</span>
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
       <div className="space-y-4">
          {/* SEO Category - Full Width Featured */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Link href="/ai-seo">
              <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-3xl p-8 md:p-12 overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-[1.02] shadow-2xl">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
                </div>
                
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between">
                  <div className="flex-1 text-white mb-8 lg:mb-0">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                        <SearchIcon className="w-8 h-8" />
                      </div>
                      <span className="px-4 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                        🚀 Most Popular
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                      AI SEO Mastery
                    </h2>
                    <p className="text-xl text-blue-100 mb-6 max-w-2xl">
                      Transform your search rankings with cutting-edge AI tools and strategies. 
                      From keyword research to content optimization, master every aspect of modern SEO.
                    </p>
                    
                    <div className="flex flex-wrap gap-4 mb-6">
                      <div className="flex items-center gap-2 text-blue-100">
                        <TrendingUp className="w-5 h-5" />
                        <span>Ranking Strategies</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-100">
                        <FileText className="w-5 h-5" />
                        <span>Content Optimization</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-100">
                        <Users className="w-5 h-5" />
                        <span>Competitor Analysis</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-blue-100">15+ Tools & Guides</span>
                      <ArrowRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                  
                  <div className="lg:w-64 xl:w-80">
                    <div className="relative">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                        <div className="space-y-3">
                          <div className="h-2 bg-white/30 rounded-full"></div>
                          <div className="h-2 bg-white/20 rounded-full w-3/4"></div>
                          <div className="h-2 bg-white/25 rounded-full w-1/2"></div>
                          <div className="flex justify-between items-center mt-4">
                            <div className="text-2xl font-bold">📈</div>
                            <div className="text-right">
                              <div className="text-sm text-blue-100">Growth</div>
                              <div className="text-lg font-bold">+247%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* AI Code & AI Learn & Earn - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* AI Code */}
            <Link href="/ai-code">
              <div 
                className="group relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-[1.02] shadow-xl"
                onMouseEnter={() => setHoveredCategory('code')}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-teal-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Floating code elements */}
                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                  <div className="text-white font-mono text-sm">
                    {'<AI/>'}
                  </div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <CodeIcon className="w-7 h-7 text-white" />
                    </div>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium text-white backdrop-blur-sm">
                      🔥 Trending
                    </span>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    AI Code Assistant
                  </h3>
                  <p className="text-emerald-100 mb-6 leading-relaxed">
                    Accelerate your development with AI-powered coding tools. Generate, debug, 
                    and optimize code faster than ever before.
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-emerald-100">
                      <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                      <span className="text-sm">Code Generation</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-100">
                      <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                      <span className="text-sm">Bug Detection</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-100">
                      <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                      <span className="text-sm">Code Optimization</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-100 text-sm">8+ Tools</span>
                    <ArrowRight className="w-5 h-5 text-white transform group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>

            {/* AI Learn & Earn */}
            <Link href="/ai-learn-earn">
              <div 
                className="group relative bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-8 overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-[1.02] shadow-xl"
                onMouseEnter={() => setHoveredCategory('learn')}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Floating elements */}
                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
                  <div className="text-white text-2xl">💡</div>
                </div>
                <div className="absolute bottom-4 right-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                  <div className="text-white text-3xl">💰</div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <SchoolIcon className="w-7 h-7 text-white" />
                    </div>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium text-white backdrop-blur-sm">
                      💎 Premium
                    </span>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    AI Learn & Earn
                  </h3>
                  <p className="text-orange-100 mb-6 leading-relaxed">
                    Unlock new income streams while mastering AI skills. 
                    From freelancing to creating AI-powered products.
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-orange-100">
                      <div className="w-2 h-2 bg-orange-300 rounded-full"></div>
                      <span className="text-sm">Skill Development</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-100">
                      <div className="w-2 h-2 bg-orange-300 rounded-full"></div>
                      <span className="text-sm">Income Strategies</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-100">
                      <div className="w-2 h-2 bg-orange-300 rounded-full"></div>
                      <span className="text-sm">Market Opportunities</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-orange-100 text-sm">12+ Guides</span>
                    <ArrowRight className="w-5 h-5 text-white transform group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* AI Tools - Full Width */}
          <Link href="/ai-tools" >
            <div className="mt-4 group relative bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-8 md:p-10 overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-[1.01] shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-700/20 to-indigo-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-8 right-8 w-32 h-32 border-2 border-white rounded-xl rotate-12"></div>
                <div className="absolute bottom-8 left-8 w-24 h-24 border-2 border-white rounded-full"></div>
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                <div className="flex-1 text-white mb-6 md:mb-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <BuildIcon className="w-7 h-7" />
                    </div>
                    <span className="px-4 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                      🛠️ Essential Tools
                    </span>
                  </div>
                  
                  <h3 className="text-3xl md:text-4xl font-bold mb-4">
                    AI Tools Collection
                  </h3>
                  <p className="text-purple-100 mb-6 text-lg max-w-2xl">
                    Discover and master the most powerful AI tools for productivity, creativity, 
                    and business growth. Comprehensive reviews and tutorials included.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">50+</div>
                      <div className="text-purple-200 text-sm">Tools Reviewed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">4.8★</div>
                      <div className="text-purple-200 text-sm">User Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">24/7</div>
                      <div className="text-purple-200 text-sm">Updates</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">Free</div>
                      <div className="text-purple-200 text-sm">& Premium</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center text-white">
                  <span className="mr-3">Explore Tools</span>
                  <ArrowRight className="w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </Link>

          {/* Free AI Resources - Unique Layout */}
          <Link href="/free-ai-resources">
  <div className="mt-4 group relative rounded-3xl p-8 md:p-10 overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-[1.01] shadow-2xl bg-gradient-to-br from-gray-800 via-gray-900 to-black dark:from-white dark:via-gray-100 dark:to-gray-200">
    
    {/* Hover overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

    {/* Animated background elements */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-4 right-4 w-16 h-16 rounded-lg opacity-20 animate-pulse bg-gradient-to-br from-yellow-400 to-orange-500" />
      <div className="absolute bottom-8 left-8 w-12 h-12 rounded-full opacity-15 animate-bounce bg-gradient-to-br from-green-400 to-blue-500" />
      <div className="absolute top-1/2 right-1/4 w-8 h-8 rounded-full opacity-20 bg-gradient-to-br from-purple-400 to-pink-500" />
    </div>

    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl">
          <DownloadIcon className="w-8 h-8 text-white dark:text-black" />
        </div>
        <div>
          <h3 className="text-3xl md:text-4xl font-bold text-white dark:text-gray-900 mb-2">
            Free AI Resources
          </h3>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white dark:text-black rounded-full text-sm font-bold">
              100% FREE
            </span>
            <span className="px-3 py-1 bg-white/10 text-white dark:bg-black/10 dark:text-black rounded-full text-sm font-medium backdrop-blur-sm">
              🎁 No Signup Required
            </span>
          </div>
        </div>
      </div>

      <p className="text-gray-300 dark:text-gray-700 mb-8 text-lg max-w-3xl">
        Access our extensive library of free AI resources including prompts, templates, 
        images, videos, and datasets. Everything you need to accelerate your AI journey.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Images", icon: <Image className="w-8 h-8 text-blue-400 mx-auto" />, desc: "500+ Assets" },
          { label: "Videos", icon: <Video className="w-8 h-8 text-purple-400 mx-auto" />, desc: "100+ Clips" },
          { label: "Templates", icon: <FileText className="w-8 h-8 text-green-400 mx-auto" />, desc: "200+ Files" },
          { label: "Prompts", icon: <Text className="w-8 h-8 text-orange-400 mx-auto" />, desc: "50+ Tracks" },
        ].map((item, i) => (
          <div key={i} className="text-center group/item">
            <div className="bg-white/10 dark:bg-black/10 rounded-2xl p-4 mb-3 backdrop-blur-sm group-hover/item:bg-white/20 dark:group-hover/item:bg-black/20 transition-colors duration-300">
              {item.icon}
            </div>
            <div className="font-medium text-white dark:text-gray-900">{item.label}</div>
            <div className="text-sm text-gray-400 dark:text-gray-600">{item.desc}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="flex items-center gap-2 text-gray-300 dark:text-gray-700">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span>Updated Weekly</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300 dark:text-gray-700">
            <Download className="w-5 h-5 text-green-400" />
            <span>Instant Download</span>
          </div>
        </div>

        <div className="flex items-center text-white dark:text-gray-900">
          <span className="mr-3 font-medium">Start Downloading</span>
          <ArrowRight className="w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300" />
        </div>
      </div>
    </div>
  </div>
</Link>

        </div>

        {/* Featured Section */}
        <div className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white mb-16">
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
              <div className="bg-green-100 dark:bg-green-800/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600 dark:text-green-300" />
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
              <div className="bg-purple-100 dark:bg-purple-800/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-6 h-6 text-purple-600 dark:text-purple-300" />
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