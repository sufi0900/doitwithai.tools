// Auto-enhance code elements - Add this to your main layout or component
import { useEffect } from 'react';

export const useCodeEnhancer = () => {
  useEffect(() => {
    const enhanceCodeElements = () => {
      // Find all code elements that aren't already enhanced
      const codeElements = document.querySelectorAll('code:not(.enhanced)');
      
      codeElements.forEach((codeEl, index) => {
        // Skip if it's inside a pre tag (handled by CSS)
        if (codeEl.closest('pre')) return;
        
        // Mark as enhanced
        codeEl.classList.add('enhanced');
        
        // Create wrapper
        const wrapper = document.createElement('span');
        wrapper.className = 'code-container inline-block group relative';
        
        // Create copy button
        const copyBtn = document.createElement('button');
        copyBtn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        `;
        copyBtn.className = 'opacity-0 group-hover:opacity-70 transition-opacity ml-2 hover:opacity-100 text-green-400';
        copyBtn.title = 'Copy code';
        
        // Copy functionality
        copyBtn.addEventListener('click', async () => {
          try {
            const text = codeEl.textContent || codeEl.innerText;
            await navigator.clipboard.writeText(text);
            
            // Visual feedback
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = `
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
            `;
            copyBtn.style.color = '#10b981';
            
            setTimeout(() => {
              copyBtn.innerHTML = originalHTML;
              copyBtn.style.color = '';
            }, 2000);
          } catch (err) {
            console.error('Failed to copy:', err);
          }
        });
        
        // Wrap the code element
        codeEl.parentNode.insertBefore(wrapper, codeEl);
        wrapper.appendChild(codeEl);
        codeEl.appendChild(copyBtn);
        
        // Add click to copy functionality to the code element itself
        codeEl.style.cursor = 'pointer';
        codeEl.addEventListener('click', () => copyBtn.click());
      });
    };

    // Run on initial load
    enhanceCodeElements();
    
    // Run when new content is added (for dynamic content)
    const observer = new MutationObserver(enhanceCodeElements);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);
};

// Usage in your component:
// import { useCodeEnhancer } from './path-to-code-enhancer';
// 
// const YourComponent = () => {
//   useCodeEnhancer();
//   return <div>Your content with PortableText</div>;
// };