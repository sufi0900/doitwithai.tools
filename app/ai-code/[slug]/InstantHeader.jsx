const InstantHeader = ({ category = "AI Tools" }) => (
  <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Do It With AI Tools
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {category}
          </span>
        </div>
        <div className="animate-pulse w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
    </div>
  </div>
);

export default InstantHeader;