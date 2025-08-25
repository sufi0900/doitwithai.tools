/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FAQCategorySection from './FAQCategorySection';
import FAQCTASection from './FAQCTASection';
import { faqsData } from './faqs'; // Import the centralized data
import { ChevronDown, Zap } from 'lucide-react'; // ⬅️ Add Zap icon here

export default function FAQComponent () {
  const [activeIndex, setActiveIndex] = useState<number[]>([]);

  useEffect(() => {
    // This effect runs once on mount.
    // Set all FAQs to be open initially.
    setActiveIndex(faqsData.map((_, i) => i));
  }, []);

  const toggleFAQ = (index: number) => {
    setActiveIndex((prevActiveIndex) => {
      if (prevActiveIndex.includes(index)) {
        // If it's already open, close it (remove from array)
        return prevActiveIndex.filter((i) => i !== index);
      } else {
        // If it's closed, open it (add to array)
        return [...prevActiveIndex, index];
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-16">
      {/* FAQ Header */}
      <div className="mb-10 text-center">
        <h1 className="relative inline-block text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-6">
          Frequently Asked Questions
          <div className="absolute bottom-[-12px] left-1/2 transform -translate-x-1/2 h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Find answers to common questions about AI tools, resources, and how our platform can help you.
        </p>
      </div>

      {/* Main FAQ Accordion */}
  

<div className="max-w-4xl mx-auto grid gap-6 mb-12">
  {faqsData.map((faq, index) => (
    <div
      key={index}
      className="rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
    >
      <div
        onClick={() => toggleFAQ(index)}
        className={`flex justify-between items-center p-5 cursor-pointer bg-white dark:bg-gray-800 transition-all duration-300 ${activeIndex.includes(index) ? 'border-b-2 border-blue-500 dark:border-blue-400' : ''}`}
      >
        {/* ⬅️ ADD THIS NEW DIV */}
        <div className="flex items-center space-x-3">
          <Zap 
            className="text-blue-500 dark:text-blue-400" 
            size={20} 
          />
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
            {faq.question}
          </h3>
        </div>
        
        <ChevronDown
          className={`transition-transform duration-300 text-gray-500 dark:text-gray-400 ${activeIndex.includes(index) ? 'rotate-180 text-blue-500 dark:text-blue-400' : ''}`}
          size={24}
        />
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 bg-gray-50 dark:bg-gray-900 ${activeIndex.includes(index) ? 'max-h-[500px] py-5 px-6' : 'max-h-0'}`}
      >
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {faq.answer}
        </p>
      </div>
    </div>
  ))}
</div>

   
      {/* CTA */}
      {/* <FAQCTASection /> */}
      <FAQCategorySection />

      {/* Contact Prompt */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl p-8 shadow-lg text-center mt-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
          Still Have Questions?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          We're here to help! Reach out and we'll get back to you as soon as possible.
        </p>
        <Link
          href="/contact"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          Contact Us
        </Link>
      </div>
        
    </div>
  );
}