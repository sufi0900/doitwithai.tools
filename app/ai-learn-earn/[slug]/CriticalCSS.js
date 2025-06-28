// components/CriticalCSS.js
// Inline critical CSS to prevent render-blocking

export default function CriticalCSS() {
  return (
    <style jsx>{`
      /* Critical CSS - Above the fold styles only */
      
      /* Reset and base styles */
      * {
        box-sizing: border-box;
      }
      
      html {
        scroll-behavior: smooth;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #fff;
        margin: 0;
        padding: 0;
      }
      
      /* Container and layout */
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
      }
      
      /* Typography - Above the fold only */
      h1, h2, h3 {
        margin: 0 0 1rem 0;
        font-weight: 700;
        line-height: 1.2;
      }
      
      h1 {
        font-size: clamp(1.75rem, 4vw, 3rem);
        color: #1a1a1a;
      }
      
      h2 {
        font-size: clamp(1.5rem, 3vw, 2.5rem);
        color: #2a2a2a;
      }
      
      p {
        margin: 0 0 1rem 0;
        color: #4a5568;
      }
      
      /* Hero section - Critical for LCP */
      .hero-section {
        min-height: 400px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 2rem 0;
      }
      
      .hero-title {
        font-size: clamp(2rem, 5vw, 4rem);
        font-weight: 800;
        line-height: 1.1;
        margin-bottom: 1.5rem;
        color: #1a202c;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .hero-description {
        font-size: clamp(1rem, 2.5vw, 1.25rem);
        color: #4a5568;
        max-width: 600px;
        margin-bottom: 2rem;
        line-height: 1.6;
      }
      
      /* Hero image container - Prevent CLS */
      .hero-image-container {
        position: relative;
        width: 100%;
        height: 0;
        padding-bottom: 50%; /* 2:1 aspect ratio */
        border-radius: 0.5rem;
        overflow: hidden;
        background: #f7fafc;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      }
      
      .hero-image-container img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      /* Loading states - Prevent CLS */
      .loading-skeleton {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        background: #e2e8f0;
        border-radius: 0.25rem;
      }
      
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
      
      /* Article meta information */
      .article-meta {
        display: flex;
        align-items: center;
        gap: 1rem;
        font-size: 0.875rem;
        color: #718096;
        margin-bottom: 2rem;
        flex-wrap: wrap;
      }
      
      .article-meta time {
        font-weight: 500;
      }
      
      /* Reading progress bar - Fixed positioning */
      .reading-progress {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: rgba(0, 0, 0, 0.1);
        z-index: 1000;
        transform: translateZ(0); /* Hardware acceleration */
      }
      
      .reading-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #667eea, #764ba2);
        transform-origin: left;
        transition: transform 0.1s ease-out;
        will-change: transform;
      }
      
      /* Navigation - Above fold only */
      .sticky-nav {
        position: sticky;
        top: 0;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid #e2e8f0;
        z-index: 100;
        padding: 1rem 0;
        transform: translateZ(0);
      }
      
      /* Table of contents - Visible area only */
      .toc-container {
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 0.5rem;
        padding: 1.5rem;
        margin: 2rem 0;
      }
      
      .toc-title {
        font-size: 1.125rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: #2d3748;
      }
      
      .toc-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .toc-item {
        margin-bottom: 0.5rem;
      }
      
      .toc-link {
        color: #3182ce;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s ease;
      }
      
      .toc-link:hover {
        color: #2c5282;
        text-decoration: underline;
      }
      
      /* Responsive design - Mobile first */
      @media (max-width: 640px) {
        .container {
          padding: 0 0.75rem;
        }
        
        .hero-section {
          padding: 1rem 0;
          min-height: 300px;
        }
        
        .article-meta {
          font-size: 0.75rem;
          gap: 0.5rem;
        }
        
        .hero-image-container {
          padding-bottom: 60%; /* Adjust aspect ratio for mobile */
        }
      }
      
      @media (min-width: 768px) {
        .container {
          padding: 0 2rem;
        }
        
        .hero-section {
          padding: 3rem 0;
        }
      }
      
      /* Dark mode support - Critical styles only */
      @media (prefers-color-scheme: dark) {
        body {
          background: #1a202c;
          color: #e2e8f0;
        }
        
        .hero-title {
          color: #f7fafc;
        }
        
        .hero-description {
          color: #cbd5e0;
        }
        
        .article-meta {
          color: #a0aec0;
        }
        
        .sticky-nav {
          background: rgba(26, 32, 44, 0.95);
          border-bottom-color: #4a5568;
        }
        
        .toc-container {
          background: #2d3748;
          border-color: #4a5568;
        }
        
        .toc-title {
          color: #f7fafc;
        }
        
        .toc-link {
          color: #63b3ed;
        }
        
        .toc-link:hover {
          color: #90cdf4;
        }
        
        .loading-skeleton {
          background: #4a5568;
        }
      }
      
      /* Performance optimizations */
      img {
        max-width: 100%;
        height: auto;
        display: block;
      }
      
      /* Prevent FOUC (Flash of Unstyled Content) */
      .js-loading * {
        animation-duration: 0s !important;
        animation-delay: -1ms !important;
        animation-iteration-count: 1 !important;
        background-attachment: initial !important;
        scroll-behavior: auto !important;
      }
      
      /* Critical font loading */
      @font-display: swap;
      
      /* Hardware acceleration for animations */
      .animate-element {
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000;
      }
    `}</style>
  );
}