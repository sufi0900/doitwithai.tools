/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
'use client';

import React from 'react';
import Link from 'next/link';
import HomeIcon from '@mui/icons-material/Home';
import BuildIcon from '@mui/icons-material/Build';
import CodeIcon from '@mui/icons-material/Code';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';
import ArticleIcon from '@mui/icons-material/Article';
import HelpIcon from '@mui/icons-material/Help';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EmailIcon from '@mui/icons-material/Email';

export default function NavigationClient() {
  return (
    <div className="min-h-screen ">
      {/* Hero Section */}
     <div className="container mx-auto px-4 pt-16 pb-8">
  <div className="text-center mb-16">
    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
      <AutoAwesomeIcon className="text-white text-4xl" />
    </div>
    <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 pb-4">
      Navigate Your AI Journey with doitwithai.tools
    </h1>
    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
      doitwithai.tools is your ultimate guide to mastering AI. Explore our comprehensive resources to boost your productivity, elevate your SEO, and transform your digital presence with cutting-edge AI tools and insights.
    </p>
  </div>
</div>

      {/* Homepage Section */}
     <section className="container mx-auto px-4 mb-16">
  {/* UPDATED COLORS: Deeper, more technical gradient */}
  <div className="bg-gradient-to-r from-gray-800 via-blue-900 to-indigo-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
    <div className="flex flex-col md:flex-row items-center justify-between">
      <div className="md:w-2/3 mb-8 md:mb-0">
        <div className="flex items-center mb-4">
          <HomeIcon className="text-4xl mr-4" />
          <h2 className="text-3xl md:text-4xl font-bold">Start Your AI Journey</h2>
        </div>
        {/* UPDATED DESCRIPTION: Now includes "SEO" and emphasizes actionable knowledge */}
        <p className="text-xl mb-6 opacity-90">
          Start your AI journey here. Our homepage is your gateway to the latest AI tools, trending insights, and core categories, designed to empower you with immediate, actionable knowledge to boost your productivity and SEO performance.
        </p>
        {/* UPDATED BUTTON COLOR: Aligns with the deeper theme, still contrasting white text */}
        <Link
          href="/"
          className="inline-flex items-center bg-white text-gray-800 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
        >
          <HomeIcon className="mr-2" />
          Visit Homepage
        </Link>
      </div>
      <div className="md:w-1/3 text-center">
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
          <div className="text-3xl font-bold mb-2">5+</div>
          <div className="text-sm opacity-80">Dynamic Categories</div>
        </div>
      </div>
    </div>
  </div>
</section>
      {/* AI Tools Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="text-center mb-8">
          <BuildIcon className="text-5xl text-blue-600 mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            AI Tools & Reviews
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover comprehensive reviews, comparisons, and tutorials on the most effective AI tools for productivity, content creation, and business growth.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-blue-500">
            <TrendingUpIcon className="text-3xl text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Productivity Tools</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">AI-powered tools to streamline workflows and boost efficiency</p>
            <Link href="/ai-tools" className="text-blue-500 hover:text-blue-600 font-medium">
              Explore Tools →
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-green-500">
            <AutoAwesomeIcon className="text-3xl text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Content Creation</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">AI solutions for writing, design, and multimedia content</p>
            <Link href="/ai-tools" className="text-green-500 hover:text-green-600 font-medium">
              Create Better →
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-purple-500">
            <RocketLaunchIcon className="text-3xl text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Business Growth</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Scale your business with intelligent automation and analytics</p>
            <Link href="/ai-tools" className="text-purple-500 hover:text-purple-600 font-medium">
              Grow Faster →
            </Link>
          </div>
        </div>
      </section>

      {/* AI Code Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="bg-gray-900 dark:bg-gray-800 rounded-3xl p-8 md:p-12 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <CodeIcon className="text-4xl text-yellow-400 mr-4" />
                <h2 className="text-3xl md:text-4xl font-bold">AI Code & Development</h2>
              </div>
              <p className="text-xl mb-8 text-gray-300">
                Master AI-powered development with hands-on guides, coding walkthroughs, and developer-friendly content. Learn to integrate AI into your applications and automate your development workflow.
              </p>
             <Link
                href="/ai-code"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-500 transition-all duration-300"
              >
                <CodeIcon className="mr-2" />
                Start Coding
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-2">OpenAI</div>
                <div className="text-sm text-gray-400">API Integration</div>
              </div>
              <div className="bg-gray-800 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-2">LangChain</div>
                <div className="text-sm text-gray-400">AI Workflows</div>
              </div>
              <div className="bg-gray-800 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-2">Next.js</div>
                <div className="text-sm text-gray-400">AI Apps</div>
              </div>
              <div className="bg-gray-800 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-2">Python</div>
                <div className="text-sm text-gray-400">ML Scripts</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Learn & Earn Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <SchoolIcon className="text-4xl text-indigo-600 mr-2" />
            <MonetizationOnIcon className="text-4xl text-green-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Learn & Earn with AI
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Unlock learning paths and income strategies that use AI for skill development and digital monetization—from freelancing to AI-powered side hustles.
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4">
              <div className="bg-indigo-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <SchoolIcon className="text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Skill Development</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">AI-powered learning paths</p>
            </div>
            <div className="text-center p-4">
              <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <MonetizationOnIcon className="text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Freelancing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">AI service opportunities</p>
            </div>
            <div className="text-center p-4">
              <div className="bg-purple-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <RocketLaunchIcon className="text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Digital Products</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">AI-generated offerings</p>
            </div>
            <div className="text-center p-4">
              <div className="bg-pink-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUpIcon className="text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Side Hustles</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">AI business ideas</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link 
              href="/ai-learn-earn" 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 inline-flex items-center"
            >
              <SchoolIcon className="mr-2" />
              Start Learning & Earning
            </Link>
          </div>
        </div>
      </section>

      {/* AI SEO Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-8 md:p-12 text-white">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-2/3 mb-8 mr-5 lg:mb-0">
              <div className="flex items-center mb-6">
                <SearchIcon className="text-5xl mr-4" />
                <h2 className="text-3xl md:text-4xl font-bold">AI-Powered SEO</h2>
              </div>
              <p className="text-xl mb-6 opacity-90">
                Revolutionize your search rankings with AI. Discover data-driven strategies for advanced keyword research, intelligent content optimization, and automated technical audits that double your visibility and outpace the competition.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">Keyword Research</span>
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">Content Optimization</span>
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">Technical SEO</span>
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">Analytics</span>
              </div>
              <Link href="/ai-seo" className="inline-flex items-center bg-white text-blue-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300">
                <SearchIcon className="mr-2" />
                Boost Your Rankings
              </Link>
            </div>
            <div className="lg:w-1/3">
              <div className="   bg-sky-200/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold mb-2">10x</div>
                <div className="text-lg opacity-80">SEO Efficiency</div>
                <div className="text-sm opacity-60 mt-2">With AI automation</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Free AI Resources Section */}
    <section className="container mx-auto px-4 mb-16">
  <div className="text-center mb-8">
    <DownloadIcon className="text-5xl text-green-600 mb-4" />
    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
      Free AI Resources
    </h2>
    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
      Access our growing library of free, downloadable AI assets including images, videos, documents, templates, and tools. Curated to save time, boost creativity, and give users a head start with zero cost.
    </p>
  </div>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
    <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 text-white text-center">
      <div className="text-3xl font-bold mb-2">50+</div>
      <div className="text-sm opacity-80">Free Templates</div>
    </div>
    <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-6 text-white text-center">
      <div className="text-3xl font-bold mb-2">25+</div>
      <div className="text-sm opacity-80">Video Tutorials</div>
    </div>
    <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl p-6 text-white text-center">
      <div className="text-3xl font-bold mb-2">100+</div>
      <div className="text-sm opacity-80">AI Prompts</div>
    </div>
    <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 text-white text-center">
      <div className="text-3xl font-bold mb-2">15+</div>
      <div className="text-sm opacity-80">Tools & Scripts</div>
    </div>
  </div>

  <div className="text-center">
    <Link
      href="/free-ai-resources"
      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-full font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 inline-flex items-center"
    >
      <DownloadIcon className="mr-2" />
      Browse Free Resources
    </Link>
  </div>
</section>

      {/* Contact & Newsletter Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <ContactMailIcon className="text-4xl text-blue-400 mr-4" />
                <h2 className="text-3xl md:text-4xl font-bold">Get In Touch</h2>
              </div>
              <p className="text-xl mb-6 text-gray-300">
                Have questions, suggestions, or want to collaborate? We'd love to hear from you. Plus, subscribe to our newsletter for the latest AI insights delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact" className="inline-flex items-center bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full font-semibold transition-colors">
                  <ContactMailIcon className="mr-2" />
                  Contact Us
                </Link>
                <button className="inline-flex items-center border border-gray-400 hover:border-white px-6 py-3 rounded-full font-semibold transition-colors">
                  <EmailIcon className="mr-2" />
                  Newsletter Signup
                </button>
              </div>
            </div>
            <div className="bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <ContactMailIcon className="mr-3 text-blue-400" />
                  <span>24-hour response time</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <EmailIcon className="mr-3 text-green-400" />
                  <span>Weekly AI updates</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <PersonIcon className="mr-3 text-purple-400" />
                  <span>Expert AI insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Pages Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            More Pages to Explore
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Discover additional resources and information about our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* About Page */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 dark:border-blue-800">
            <InfoIcon className="text-3xl text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">About Us</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Learn about our mission to democratize AI knowledge and empower creators worldwide.</p>
            <Link href="/about" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Our Story →
            </Link>
          </div>

          {/* Author Page */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100 dark:border-purple-800">
            <PersonIcon className="text-3xl text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Meet Sufian</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Get to know Sufian Mustafa, the creator and solo author behind DoItWithAI.tools.</p>
            <Link href="/author/sufian-mustafa" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
              Author Profile →
            </Link>
          </div>

          {/* All Blogs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100 dark:border-green-800">
            <ArticleIcon className="text-3xl text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">All Articles</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Browse every article, guide, and update published across all our categories in one place.</p>
            <Link href="/blogs" className="text-green-600 hover:text-green-700 font-medium text-sm">
              View All Blogs →
            </Link>
          </div>

          {/* FAQ Page */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100 dark:border-orange-800">
            <HelpIcon className="text-3xl text-orange-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">FAQ</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Find answers to common questions about AI tools, resources, and our platform.</p>
            <Link href="/faq" className="text-orange-600 hover:text-orange-700 font-medium text-sm">
              Get Answers →
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
     <section className="container mx-auto px-4 pb-16">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-white text-center">
          <AutoAwesomeIcon className="text-6xl mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your AI Journey?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Join thousands of creators, developers, marketers, and entrepreneurs who are already leveraging AI to build better, faster, and smarter. Boost your SEO, streamline campaigns, and innovate with AI. Your AI-powered future starts now.
          </p>
          <Link 
            href="/" 
            className="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 inline-flex items-center transform hover:scale-105"
          >
            <RocketLaunchIcon className="mr-2" />
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
}