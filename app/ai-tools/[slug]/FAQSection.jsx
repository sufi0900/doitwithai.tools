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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 mt-10 border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="text-left mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          Frequently Asked Questions
        </h2>
      </div>
      
      {/* FAQ Items */}
      <div className="space-y-3 sm:space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openItems.has(index);
          
          return (
            <div 
              key={index}
              className="group border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500"
            >
              {/* Question Button */}
              <button
                onClick={() => toggleItem(index)}
                className="w-full text-left p-4 sm:p-5 lg:p-6 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 flex items-center justify-between group"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
              >
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white pr-4 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {faq.question}
                </h3>
                
                {/* Enhanced Arrow Icon */}
                <div className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-180 bg-blue-500 dark:bg-blue-600' : 'group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50'}`}>
                  <svg 
                    className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors duration-300 ${isOpen ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {/* Answer Content */}
              <div 
                id={`faq-answer-${index}`}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-4 sm:px-5 lg:px-6 pb-4 sm:pb-5 lg:pb-6 pt-0">
                  <div className="border-t border-gray-100 dark:border-gray-600 pt-4">
                    <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-gray-600 dark:text-gray-300 font-medium">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      
    </div>
  );
};

export default FAQSection;