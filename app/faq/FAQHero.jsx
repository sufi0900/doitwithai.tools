// components/FAQHero.js
import React from 'react';
import { Search } from 'lucide-react';

export default function FAQHero () {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 py-16 md:py-24 mb-12 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${Math.random() * 12 + 4}px`,
                height: `${Math.random() * 12 + 4}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.3
              }}
            ></div>
          ))}
        </div>
        <svg className="absolute bottom-0 left-0 right-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#ffffff" fillOpacity="0.2" d="M0,128L48,144C96,160,192,192,288,176C384,160,480,96,576,96C672,96,768,160,864,186.7C960,213,1056,203,1152,186.7C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            How Can We Help You?
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Find answers to the most common questions about AI tools and resources
          </p>
          
          {/* Search Bar - For visual appeal (non-functional in this example) */}
          <div className="max-w-2xl mx-auto relative">
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-full shadow-xl overflow-hidden">
              <div className="pl-5">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for questions..."
                className="w-full py-4 px-4 text-gray-700 dark:text-white bg-transparent focus:outline-none"
              />
              <button className="bg-primary hover:bg-primary-dark text-white px-6 py-4 font-medium transition-colors duration-300">
                Search
              </button>
            </div>
          </div>
          
          {/* FAQ Categories */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {["General", "AI Tools", "SEO", "Resources"].map((category, index) => (
              <div 
                key={index}
                className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-lg p-4 cursor-pointer hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-300"
              >
                <span className="text-white font-medium">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

