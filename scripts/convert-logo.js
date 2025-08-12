// // scripts/convert-logo-optimized.js
// const fs = require('fs');
// const path = require('path');

// try {
//   const logoPath = path.join(process.cwd(), 'public', 'd3.png');
  
//   if (!fs.existsSync(logoPath)) {
//     console.error('❌ Logo file not found at:', logoPath);
//     console.log('Make sure d3.png exists in your public folder');
//     process.exit(1);
//   }

//   const logoBuffer = fs.readFileSync(logoPath);
//   const logoSize = logoBuffer.length;
  
//   console.log(`📁 Logo file size: ${(logoSize / 1024).toFixed(2)} KB`);
  
//   // Check if file is too large for base64 in OG images (recommended max: 1MB)
//   if (logoSize > 1024 * 1024) {
//     console.warn('⚠️  Logo file is quite large. Consider optimizing it first.');
//   }
  
//   const logoBase64 = logoBuffer.toString('base64');
//   const dataUri = `data:image/png;base64,${logoBase64}`;
  
//   console.log(`📏 Base64 length: ${logoBase64.length} characters`);
  
//   // Create the constants file
//   const constantsContent = `// Auto-generated logo constants
// export const LOGO_BASE64 = "${dataUri}";

// // Metadata
// export const LOGO_METADATA = {
//   originalSize: ${logoSize},
//   base64Length: ${logoBase64.length},
//   generatedAt: "${new Date().toISOString()}"
// };
// `;

//   // Ensure lib directory exists
//   const libDir = path.join(process.cwd(), 'lib');
//   if (!fs.existsSync(libDir)) {
//     fs.mkdirSync(libDir, { recursive: true });
//   }

//   // Write to file
//   const outputPath = path.join(libDir, 'logo-constants.js');
//   fs.writeFileSync(outputPath, constantsContent);

//   console.log('✅ Base64 logo successfully generated!');
//   console.log('📝 Saved to:', outputPath);
//   console.log('');
//   console.log('🔧 Import in your OG route:');
//   console.log('import { LOGO_BASE64 } from "../../../lib/logo-constants.js"');
//   console.log('');
  
//   // Test the data URI length (Edge Runtime has limits)
//   if (dataUri.length > 2000000) { // 2MB limit
//     console.warn('⚠️  Warning: Base64 string might be too large for Edge Runtime');
//     console.log('💡 Consider using Method 2 (fetch from URL) instead');
//   } else {
//     console.log('✅ Base64 size looks good for Edge Runtime');
//   }

// } catch (error) {
//   console.error('❌ Error converting logo:', error.message);
//   process.exit(1);
// }

// // Run with: node scripts/convert-logo-optimized.js