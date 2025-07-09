
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
          You're Offline
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Your cached content is still available.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}