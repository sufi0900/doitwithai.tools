// scripts/generate-critical-css.js
const fs = require('fs');
const path = require('path');

function generateCriticalCSS() {
  const criticalCSSPath = path.join(__dirname, '../components/Hero/hero.css');
  const criticalCSS = fs.readFileSync(criticalCSSPath, 'utf8');

  // Minify CSS
  const minifiedCSS = criticalCSS
    .replace(/\/\*.*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/;\s*}/g, '}') // Remove unnecessary semicolons
    .trim();

  // Define the output path for the generated JS file
  const outputPath = path.join(__dirname, '../lib/critical-hero-css.js'); // Or any other suitable location

  // Write the minified CSS to a JS file that exports it as a string
  const fileContent = `export const criticalHeroCSS = \`${minifiedCSS}\`;\n`;
  fs.writeFileSync(outputPath, fileContent, 'utf8');

  console.log('Critical CSS generated and written to:', outputPath);
}

// Execute the function when the script is run
generateCriticalCSS();