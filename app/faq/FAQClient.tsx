/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import FAQCategorySection from './FAQCategorySection';
import FAQCTASection from './FAQCTASection';
import { faqsData } from './faqs'; // Import the centralized data

export default function FAQComponent () {
 const [animationPhase, setAnimationPhase] = useState(0);
  // Change activeIndex to an array, initialized with all indices
  const [activeIndex, setActiveIndex] = useState<number[]>([]); // Initialize as empty array, will populate in useEffect


 useEffect(() => {
    // This effect runs once on mount.
    // Set all FAQs to be open initially.
    setActiveIndex(faqsData.map((_, i) => i));

    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
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

  const bgColors = [
    'bg-cyan-200 dark:bg-cyan-900',
    'bg-green-200 dark:bg-green-900',
    'bg-amber-200 dark:bg-amber-900',
    'bg-purple-200 dark:bg-purple-900',
    'bg-red-200 dark:bg-red-900',
    'bg-indigo-200 dark:bg-indigo-900',
    'bg-blue-200 dark:bg-blue-900',
    'bg-pink-200 dark:bg-pink-900'
  ];

  return (
    <div className="container mx-auto px-4 mb-16">
      {/* <FAQHero /> */}
  

      {/* FAQ Header */}
      

      {/* Main FAQ Accordion */}
       <div className="mb-10 text-center">
        <h1 className="relative inline-block text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-6 after:absolute after:bottom-[-12px] after:left-1/2 after:transform after:-translate-x-1/2 after:h-1 after:w-24 after:bg-blue-600">
          Frequently Asked Questions
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Find answers to common questions about AI tools, resources, and how our platform can help you.
        </p>
      </div>

      {/* Main FAQ Accordion */}
      <div className="max-w-4xl mx-auto grid gap-8 mb-12">
        {faqsData.map((faq, index) => (
          <div
            key={index}
            className="transform transition-all duration-300 hover:scale-[1.01]"
          >
            <div
              onClick={() => toggleFAQ(index)}
              className={`cursor-pointer rounded-lg shadow-md overflow-hidden ${activeIndex.includes(index) ? 'ring-2 ring-primary' : ''}`}
            >
              <div
                className={`flex justify-between items-center p-5 ${bgColors[index % bgColors.length]} transition-all duration-300`}
              >
                <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`transition-transform duration-300 text-gray-700 dark:text-gray-200 ${activeIndex.includes(index) ? 'rotate-180' : ''}`}
                  size={24}
                />
              </div>

              <div
                className={`overflow-hidden transition-all duration-300 bg-white dark:bg-gray-800 ${activeIndex.includes(index) ? 'max-h-[500px] py-5 px-6' : 'max-h-0'}`}
              >
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
   

      {/* CTA */}
      <FAQCTASection />
  <FAQCategorySection />
      {/* Contact Prompt */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl p-8 shadow-lg text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
          Still Have Questions?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          We're here to help! Reach out and we'll get back to you ASAP.
        </p>
        <Link
          href="/contact"
          className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors duration-300"
        >
          Contact Us
        </Link>
      </div>
        
    </div>
  );
}
