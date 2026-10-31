import Link from 'next/link';
import { useState } from 'react';

const FAQSection = ({ faqs }) => {
  // Initialize with all items open (first 3 items for better performance)
  const [openItems, setOpenItems] = useState(new Set(faqs?.map((_, index) => index) || []));

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (


<div className="relative bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-800 dark:via-gray-800/50 dark:to-gray-700/50 rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 mb-8 mt-12 border border-blue-100 dark:border-gray-700 overflow-hidden">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, rgba(37, 99, 235, 0.3) 0%, transparent 50%),
                               radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)`,
          }}
        ></div>
      </div>

      {/* Decorative Corner Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-bl-full"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-400/10 to-transparent rounded-tr-full"></div>

      {/* Header with Icon */}
      <div className="relative text-left mb-8 pb-6 border-b-2 border-blue-200/50 dark:border-blue-700/30">
        <div className="flex items-center gap-3 mb-3">
          {/* FAQ Icon */}
          <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-600 dark:bg-blue-600 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Find quick answers to common questions
            </p>
          </div>
        </div>
      </div>
      
      {/* FAQ Items */}
      <div className="relative space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openItems.has(index);
          
          return (
            <div 
              key={index}
              className="group relative bg-white dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 hover:scale-[1.01]"
            >
              {/* Question Button */}
              <button
                onClick={() => toggleItem(index)}
                className="w-full text-left p-5 sm:p-6 bg-transparent hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-gray-700/30 dark:hover:to-gray-700/50 transition-all duration-300 flex items-start sm:items-center justify-between gap-4"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
              >
                {/* Question Number Badge */}
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-600 dark:bg-blue-600 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm sm:text-base">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="flex-1 text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {faq.question}
                </h3>
                
                {/* Enhanced Arrow Icon with Animation */}
                <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-300 shadow-md ${
                  isOpen 
                    ? 'rotate-180 bg-blue-600 dark:bg-blue-600 scale-110' 
                    : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50'
                }`}>
                  <svg 
                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${
                      isOpen ? 'text-white' : 'text-blue-600 dark:text-blue-400'
                    }`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {/* Answer Content with Smooth Animation */}
              <div 
                id={`faq-answer-${index}`}
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
                  {/* Decorative Divider */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-300 dark:via-blue-700 to-transparent"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-300 dark:via-blue-700 to-transparent"></div>
                  </div>

                  {/* Answer Text with Icon */}
                  <div className="flex gap-3">
                    {/* Answer Icon */}
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>

                    <div className="flex-1 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-gray-700/30 dark:to-gray-700/50 rounded-lg p-4 border-l-4 border-blue-500">
                      <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover Effect Border Glow */}
              <div className="absolute inset-0 rounded-xl opacity-0  transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-indigo-400/20 blur-sm"></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA or Note (Optional) */}
      <div className="relative mt-8 pt-6 border-t-2 border-blue-200/50 dark:border-blue-700/30">
       <p className="text-sm sm:text-base text-center text-gray-700 dark:text-gray-300">
      Still have questions?{" "}
      <Link 
        href="/contact" 
        className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline hover:no-underline transition-colors"
      >
        Contact our support team
      </Link>
      {" "}for personalized assistance.
    </p>
      </div>
    </div>
  );
};

export default FAQSection;