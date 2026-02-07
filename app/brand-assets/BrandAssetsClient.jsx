'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { brandImages, getCategories } from './brandImagesData';

export default function BrandAssetsClient() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredImage, setHoveredImage] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  const categories = getCategories();

  const filteredImages = activeCategory === 'All' 
    ? brandImages 
    : brandImages.filter(img => img.category === activeCategory);

  const copyImageUrl = (src, e) => {
    e.stopPropagation();
    const fullUrl = `https://doitwithai.tools${src}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(src);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const downloadImage = (src, title, e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = src;
    link.download = title.replace(/\s+/g, '-').toLowerCase();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-900 dark:via-blue-950/20 dark:to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Modern Header */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center px-4 py-2 mb-4 bg-[#5271ff]/10 rounded-full">
            <svg className="w-4 h-4 mr-2 text-[#5271ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span className="text-sm font-semibold text-[#5271ff]">Brand Assets Gallery</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
            <span className="text-[#5271ff]">Do It With AI Tools</span>
            <br />
            <span className="text-3xl md:text-4xl lg:text-5xl text-gray-700 dark:text-gray-300">Official Brand Assets</span>
          </h1>
          
           <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            High-quality brand assets for <strong className="text-gray-900 dark:text-white">Do It With AI Tools</strong>. 
            Download and use with proper attribution.
          </p>
        </header>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 border ${
                activeCategory === cat
                  ? 'bg-[#5271ff] text-white border-[#5271ff] shadow-lg shadow-[#5271ff]/30 scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-[#5271ff] hover:text-[#5271ff]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Improved Gallery Grid: 1 Col Mobile, 3 Col Desktop */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {filteredImages.map((image, index) => (
            <div
              key={index}
              className="group relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-200 dark:border-gray-700 transform hover:-translate-y-1"
              onMouseEnter={() => setHoveredImage(image.id)}
               onMouseLeave={() => setHoveredImage(null)}
            >
              {/* Image Container - Larger Aspect Ratio */}
<div className="relative aspect-[4/3] p-10 flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-white font-bold text-xl mb-6 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    {image.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 transform translate-y-8 group-hover:translate-y-0 transition-transform delay-75">
                    {/* View Icon - Dark Glass Style */}
                    <button
                      onClick={() => setLightboxImage(image)}
                      className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/20 transition-all"
                      title="View Full Size"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    {/* Download Icon - Brand Color */}
                    <button
                      onClick={(e) => downloadImage(image.src, image.title, e)}
                      className="w-14 h-14 flex items-center justify-center bg-[#5271ff] hover:bg-[#415edb] text-white rounded-full shadow-lg shadow-[#5271ff]/40 transition-all scale-110 hover:scale-125"
                      title="Download Asset"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                      </svg>
                    </button>

                    {/* Copy URL Icon - Subtle Style */}
                    <button
                      onClick={(e) => copyImageUrl(image.src, e)}
                      className="w-12 h-12 flex items-center justify-center bg-gray-800/80 hover:bg-gray-700 text-white rounded-full border border-gray-600 transition-all"
                      title="Copy Link"
                    >
                      {copiedUrl === image.src ? (
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Card Footer */}
              <div className="p-6 bg-white dark:bg-gray-800 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-[#5271ff] uppercase tracking-widest mb-1">{image.category}</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{image.format} Asset</p>
                </div>
                <div className="text-[10px] px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-500 dark:text-gray-400 font-mono">
                  {image.width}x{image.height}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {lightboxImage && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
            onClick={() => setLightboxImage(null)}
          >
            <div 
              className="max-w-6xl w-full max-h-[90vh] bg-white dark:bg-gray-800 rounded-3xl overflow-hidden flex flex-col" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 overflow-y-auto p-6 md:p-12">
                <Image
                  src={lightboxImage.src}
                  alt={lightboxImage.alt}
                  width={lightboxImage.width}
                  height={lightboxImage.height}
                  className="w-full h-auto object-contain rounded-xl"
                  quality={100}
                />
              </div>
           <div className="px-8 pb-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {lightboxImage.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {lightboxImage.description}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={(e) => downloadImage(lightboxImage.src, lightboxImage.title, e)}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                      </svg>
                      Download
                    </button>
                    <button
                      onClick={(e) => copyImageUrl(lightboxImage.src, e)}
                      className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                      </svg>
                      {copiedUrl === lightboxImage.src ? 'Copied!' : 'Copy URL'}
                    </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guidelines & Contact */}
        <section className="bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Brand Usage Policy</h2>
            <div className="grid md:grid-cols-2 gap-12 mb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-green-600 font-bold mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                  <span>Permitted Use</span>
                </div>
                <ul className="text-gray-600 dark:text-gray-400 space-y-3 text-sm">
                  <li className="flex gap-2"><span>•</span> Editorial and media news coverage</li>
                  <li className="flex gap-2"><span>•</span> Partners and authorized integrations</li>
                  <li className="flex gap-2"><span>•</span> Educational content and community reviews</li>
                </ul>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-red-500 font-bold mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                  <span>Restricted Use</span>
                </div>
                <ul className="text-gray-600 dark:text-gray-400 space-y-3 text-sm">
                  <li className="flex gap-2"><span>•</span> Modifying colors, aspect ratio, or typography</li>
                  <li className="flex gap-2"><span>•</span> Using assets for competing AI directories</li>
                  <li className="flex gap-2"><span>•</span> Misrepresenting brand endorsement</li>
                </ul>
              </div>
            </div>
            
       <div className="text-center pt-8 border-t border-gray-100 dark:border-gray-700">
  <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">
    Need a custom format or have questions about brand licensing?
  </p>
  <a 
    href="/contact" 
    className="
      inline-flex items-center px-10 py-4 
      bg-[#5271ff] text-white font-extrabold rounded-2xl 
      border border-white/10
      shadow-xl shadow-[#5271ff]/30 
      
      /* Smooth Transitions */
      transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
      
      /* Hover State */
      hover:bg-[#415edb] 
      hover:shadow-2xl hover:shadow-[#5271ff]/50 
      hover:-translate-y-1.5
      
      /* Active Click State */
      active:scale-95 active:translate-y-0
    "
  >
    Get In Touch
    <svg 
      className="ml-2 w-5 h-5 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-1" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
    </svg>
  </a>
</div>
          </div>
        </section>

        {/* Professional Footer */}
      

      </div>
    </div>
  );
}