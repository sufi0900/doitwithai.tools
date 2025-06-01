const HeroSection = () => {
  return (
    <section className="relative z-10 overflow-hidden bg-teal-50 pt-16 pb-10 dark:bg-gray-800">
      <div className="container mx-auto">
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 h-72 w-72 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 h-80 w-80 bg-blue-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        
        {/* Main content */}
        <div className="relative text-center px-4 z-10">
          {/* Welcome with letter animation */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl text-center font-bold mb-2">
            {["F", "r", "e", "e", " ", "A", "I", " ", "R", "e", "s", "o", "u", "r", "c", "e", "s"].map((letter, index) => (
              <span
                key={index}
                className={`inline-block transform transition-all duration-400 hover:scale-150 
                  ${index % 10 === 0 ? 'hover:text-red-500' : ''} 
                  ${index % 10 === 1 ? 'hover:text-green-500' : ''} 
                  ${index % 10 === 2 ? 'hover:text-blue-500' : ''} 
                  ${index % 10 === 3 ? 'hover:text-amber-500' : ''} 
                  ${index % 10 === 4 ? 'hover:text-purple-500' : ''} 
                  ${index % 10 === 5 ? 'hover:text-pink-500' : ''} 
                  ${index % 10 === 6 ? 'hover:text-cyan-500' : ''} 
                  ${index % 10 === 7 ? 'hover:text-indigo-500' : ''} 
                  ${index % 10 === 8 ? 'hover:text-zinc-500' : ''} 
                  ${index % 10 === 9 ? 'hover:text-primary' : ''} 
                  animate__animated animate__fadeInDown`}
                style={{
                  animationDelay: `${index * 0.1 + 0.5}s`,
                  animationDuration: '0.6s',
                  ...(letter !== " " && {
                    animationFillMode: 'both',
                  }),
                }}
              >
                <span
                  className="inline-block"
                  style={{
                    animation: `float 2s ease-in-out infinite`,
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  {letter === " " ? "\u00A0" : letter}
                </span>
              </span>
            ))}
          </h1>

          {/* Subtitle with gradient */}
          <h2 className="text-2xl md:text-3xl font-bold mb-6 animate__animated animate__fadeIn" style={{animationDelay: '1.5s'}}>
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Premium Tools & Assets - 100% Free
            </span>
          </h2>

          {/* Description with styled elements */}
          <p className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-300 mb-8 animate__animated animate__fadeIn" style={{animationDelay: '2s'}}>
            Browse our carefully curated collection of 
            <span className="inline-block px-2 py-1 mx-1 bg-primary/10 text-primary font-semibold rounded-md">
              AI images
            </span>,
            <span className="inline-block px-2 py-1 mx-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold rounded-md">
              templates
            </span>, 
            <span className="inline-block px-2 py-1 mx-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold rounded-md">
              guides
            </span>, and 
            <span className="inline-block px-2 py-1 mx-1 bg-purple-100 dark:bg-violet-900/30 text-purple-700 dark:text-purple-300 font-semibold rounded-md">
              tools
            </span> 
            to elevate your AI projects.
          </p>

          {/* Resource counter */}
          <div className="flex justify-center gap-8 mb-8 animate__animated animate__fadeIn" style={{animationDelay: '2.5s'}}>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Free Resources</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">10+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">100%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Free to Use</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating icons */}
      <div className="absolute top-10 left-10 animate-bounce-slow opacity-20">
        <svg className="h-12 w-12 text-primary" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="absolute bottom-10 right-10 animate-pulse-slow opacity-20">
        <svg className="h-16 w-16 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;