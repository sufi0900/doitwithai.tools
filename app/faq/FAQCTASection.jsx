// components/FAQCTASection.js
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Mail, MessageCircle, FileText } from 'lucide-react';
import Link from 'next/link';

export default function FAQCTASection () {
  return (
    <div className="container mx-auto px-4 py-10 mb-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Didn't Find What You're Looking For?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We're here to help! Choose one of the options below to get assistance
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Email Support */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-8 text-center shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 dark:border-blue-800/30">
            <div className="bg-blue-100 dark:bg-blue-800/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-blue-600 dark:text-blue-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Email Support
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Send us an email with your question and we'll respond within 24 hours
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300"
            >
              Contact Us
            </Link>
          </div>
          
          {/* Live Chat */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-8 text-center shadow-md hover:shadow-lg transition-all duration-300 border border-purple-100 dark:border-purple-800/30">
            <div className="bg-purple-100 dark:bg-purple-800/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-8 h-8 text-purple-600 dark:text-purple-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Community Forum
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Join our community forum to get answers from our team and other users
            </p>
             <Link 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-300"
            >
              Join Forum
            </Link>
          </div>
          
          {/* Knowledge Base */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-8 text-center shadow-md hover:shadow-lg transition-all duration-300 border border-green-100 dark:border-green-800/30">
            <div className="bg-green-100 dark:bg-green-800/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-green-600 dark:text-green-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Knowledge Base
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Browse our extensive documentation for detailed guides and tutorials
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-300"
            >
              Explore Resources
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

