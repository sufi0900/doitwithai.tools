// components/TrustpilotSidebarInvite.js

import React from 'react';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';

const TrustpilotSidebarInvite = () => {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
      <div className="p-4">
        {/* Rating and Title Section */}
        <Link
          href="https://www.trustpilot.com/review/doitwithai.tools"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 mb-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00b67a] shadow-sm">
            <Star className="h-5 w-5 fill-white text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-800 dark:text-white">
              Trustpilot
            </h3>
            <div className="flex items-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-4 w-4 fill-[#00b67a] text-[#00b67a]" />
              ))}
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1">
                (5.0 out of 5)
              </span>
            </div>
          </div>
        </Link>
        
        {/* Engaging Question with new professional styling */}
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
          <span className="text-base font-bold text-gray-800 dark:text-white">Found this article useful?</span>{' '}
          <span className="font-normal">Help others by sharing your thoughts.</span>
        </p>

        {/* Call-to-Action Button */}
        <Link
          href="https://www.trustpilot.com/review/doitwithai.tools"
          target="_blank"
          rel="noopener noreferrer"
          className="group/cta w-full flex items-center justify-center gap-2 rounded-lg bg-[#00b67a] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#009b69] hover:shadow-lg"
        >
          Write a Review
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
        </Link>
        
        <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
          It only takes a minute to help us grow!
        </p>
      </div>
    </div>
  );
};

export default TrustpilotSidebarInvite;