// scripts/inline-critical-css.js
const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css'); // For robust minification

// Initialize CleanCSS for minification
const cleanCss = new CleanCSS({});

function inlineCriticalCSS() {
  const criticalCSSPath = path.join(process.cwd(), 'components/Hero/critical-hero.css');
  let criticalCSS = '';

  try {
    criticalCSS = fs.readFileSync(criticalCSSPath, 'utf8');
  } catch (error) {
    console.error(`Error reading critical CSS file: ${criticalCSSPath}`, error);
    return ''; // Return empty string if file not found or error
  }

  // Minify CSS using clean-css
  const minifiedOutput = cleanCss.minify(criticalCSS);
  if (minifiedOutput.errors.length > 0) {
    console.error('CleanCSS errors:', minifiedOutput.errors);
  }
  if (minifiedOutput.warnings.length > 0) {
    console.warn('CleanCSS warnings:', minifiedOutput.warnings);
  }

  return minifiedOutput.styles;
}

// Export for use in other files
module.exports = { inlineCriticalCSS };