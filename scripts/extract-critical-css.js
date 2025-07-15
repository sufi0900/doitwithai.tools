const critical = require('critical');
const fs = require('fs');
const path = require('path');

async function extractCriticalCSS() {
  console.log('🔍 Extracting critical CSS...');
  
  try {
    // Extract critical CSS for homepage
    const { css } = await critical.generate({
      base: '.next/',
      src: 'index.html',
      target: {
        css: 'components/Hero/critical-hero-generated.css',
        html: 'optimized-index.html'
      },
      width: 1300,
      height: 900,
      minify: true,
      extract: true,
      inlineImages: true,
      timeout: 30000,
      dimensions: [
        {
          width: 320,
          height: 568
        },
        {
          width: 768,
          height: 1024
        },
        {
          width: 1300,
          height: 900
        }
      ]
    });

    console.log('✅ Critical CSS extracted successfully');
    console.log(`📊 Critical CSS size: ${css.length} bytes`);
    
    // Save metrics
    const metrics = {
      timestamp: new Date().toISOString(),
      criticalSize: css.length,
      status: 'success'
    };
    
    fs.writeFileSync(
      path.join(__dirname, '../metrics/critical-css-metrics.json'),
      JSON.stringify(metrics, null, 2)
    );
    
  } catch (error) {
    console.error('❌ Critical CSS extraction failed:', error);
    process.exit(1);
  }
}

// Run extraction
extractCriticalCSS();