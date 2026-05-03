#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');

// Directories to minify
const directories = [
  './src',
  './public/assets/css'
];

const extensions = ['.css'];
let totalSaved = 0;
let filesProcessed = 0;

// Recursive function to find and minify CSS files
function minifyCSSFiles(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively process subdirectories
      minifyCSSFiles(filePath);
    } else if (extensions.includes(path.extname(file)) && !file.endsWith('.min.css')) {
      // Skip already minified files
      try {
        const originalContent = fs.readFileSync(filePath, 'utf8');
        const originalSize = Buffer.byteLength(originalContent, 'utf8');
        
        const minified = new CleanCSS().minify(originalContent);
        
        if (minified.errors.length > 0) {
          console.error(`Error minifying ${filePath}:`, minified.errors);
          return;
        }

        const minifiedSize = Buffer.byteLength(minified.styles, 'utf8');
        const saved = originalSize - minifiedSize;
        const savedPercent = ((saved / originalSize) * 100).toFixed(2);

        // Write minified content back to the same file
        fs.writeFileSync(filePath, minified.styles, 'utf8');

        console.log(`✓ ${filePath}`);
        console.log(`  Original: ${(originalSize / 1024).toFixed(2)} KB → Minified: ${(minifiedSize / 1024).toFixed(2)} KB`);
        console.log(`  Saved: ${(saved / 1024).toFixed(2)} KB (${savedPercent}%)\n`);

        totalSaved += saved;
        filesProcessed++;
      } catch (err) {
        console.error(`Error processing ${filePath}:`, err.message);
      }
    }
  });
}

console.log('🔄 Starting CSS minification...\n');

directories.forEach(dir => {
  minifyCSSFiles(dir);
});

console.log(`\n✅ Minification complete!`);
console.log(`📊 Stats:`);
console.log(`   Files processed: ${filesProcessed}`);
console.log(`   Total size saved: ${(totalSaved / 1024).toFixed(2)} KB`);
