import classNames from 'classnames';

const FAQSection = ({ faqs }) => {
  const bgColors = [
    'bg-cyan-200',
    'bg-amber-200',  
    'bg-green-200',
    'bg-red-200',
    'bg-indigo-200'
  ];

  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
       <div className="bs1 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6 mt-10">
          <h2 className="text-3xl font-bold text-black dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
         
          {faqs && faqs.map((faq, index) => (
      <div key={faq.question} className="space-y-4">
        <details className="group" open>
          <summary
            className={classNames(
              'cursor-pointer text-lg font-medium text-black    p-4 mt-2 rounded-lg transition-all duration-300 hover:bg-gray-200 ',
              bgColors[index % bgColors.length] // Apply different background color
            )}
          >
            {faq.question}
          </summary>
          <div className="p-4 mt-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="mb-4 mt-1 text-lg  font-medium leading-relaxed text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out">
              {faq.answer}
            </p>
          </div>
        </details>
      </div>
    ))}
        </div>
  );
};

export default FAQSection;