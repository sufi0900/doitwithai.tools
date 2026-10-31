import React from "react";

const ModalLoadingAnimation = () => {
  return (
    <>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-gradient-to-br from-gray-900/80 to-black/80 animate-pulse-fade">
        <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mb-2 sm:mb-4">
          <div className="absolute inset-0 rounded-full border-3 sm:border-4 border-t-3 sm:border-t-4 border-blue-400 border-opacity-30 animate-spin-slow"></div>
          <div className="absolute inset-0 rounded-full border-3 sm:border-4 border-t-3 sm:border-t-4 border-blue-500 animate-spin-fast"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <p className="text-white text-sm sm:text-lg font-semibold tracking-wide">Loading</p>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white animate-dot-1"></div>
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white animate-dot-2"></div>
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white animate-dot-3"></div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes pulse-fade {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-fade { animation: pulse-fade 2s ease-in-out infinite; }
        
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 2s linear infinite; }
        
        @keyframes spin-fast {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        .animate-spin-fast { animation: spin-fast 1s linear infinite; }
        
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
        .animate-dot-1 { animation: dot-bounce 1.4s infinite ease-in-out; animation-delay: 0s; }
        .animate-dot-2 { animation: dot-bounce 1.4s infinite ease-in-out; animation-delay: 0.2s; }
        .animate-dot-3 { animation: dot-bounce 1.4s infinite ease-in-out; animation-delay: 0.4s; }
        
        @media(max-width: 640px) {
          .border-3 { border-width: 3px; }
          .border-t-3 { border-top-width: 3px; }
        }
      `}</style>
    </>
  );
};

export default ModalLoadingAnimation;
