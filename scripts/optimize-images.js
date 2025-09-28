#!/usr/bin/env node

/**
 * Image Optimization Script for Astro Mahri Space
 * 
 * This script processes images in the frontend/public/images directory
 * and creates optimized versions with different sizes and formats.
 * 
 * Usage:
 *   node scripts/optimize-images.js [source-dir] [output-dir]
 * 
 * Requirements:
 *   npm install sharp glob --save-dev
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const glob = require('glob');

// Configuration
const config = {
  // Source and output directories
  sourceDir: process.argv[2] || path.join(__dirname, '../frontend/public/images'),
  outputDir: process.argv[3] || path.join(__dirname, '../frontend/public/images/optimized'),
  
  // Image processing settings
  formats: ['webp', 'jpg'],
  qualities: {
    webp: 80,
    jpg: 85,
    png: 90
  },
  
  // Size presets for different use cases
  presets: {
    product: {
      sizes: [300, 600, 900, 1200],
      aspectRatio: { width: 4, height: 3 }
    },
    hero: {
      sizes: [768, 1024, 1366, 1920],
      aspectRatio: { width: 16, height: 9 }
    },
    avatar: {
      sizes: [100, 200, 400],
      aspectRatio: { width: 1, height: 1 }
    },
    thumbnail: {
      sizes: [150, 300],
      aspectRatio: { width: 1, height: 1 }
    }
  }
};

/**
 * Ensure directory exists, create if not
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

/**
 * Get preset based on file path
 */
function getPresetForImage(imagePath) {
  const fileName = path.basename(imagePath, path.extname(imagePath));
  const dirName = path.dirname(imagePath);
  
  if (dirName.includes('hero') || fileName.includes('hero')) {
    return 'hero';
  } else if (dirName.includes('avatar') || fileName.includes('avatar') || fileName.includes('logo')) {
    return 'avatar';
  } else if (dirName.includes('thumb') || fileName.includes('thumb')) {
    return 'thumbnail';
  } else {
    return 'product'; // Default preset
  }
}

/**
 * Process a single image with multiple formats and sizes
 */
async function processImage(inputPath, outputDir) {
  const fileName = path.basename(inputPath, path.extname(inputPath));
  const preset = getPresetForImage(inputPath);
  const settings = config.presets[preset];
  
  console.log(`Processing ${inputPath} with preset: ${preset}`);
  
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // Process each size
    for (const size of settings.sizes) {
      // Calculate dimensions maintaining aspect ratio
      const aspectRatio = settings.aspectRatio.width / settings.aspectRatio.height;
      let width = size;
      let height = Math.round(size / aspectRatio);
      
      // For square images (avatars, thumbnails)
      if (settings.aspectRatio.width === settings.aspectRatio.height) {
        height = size;
      }
      
      // Process each format
      for (const format of config.formats) {
        const outputFileName = `${fileName}-${size}w.${format}`;
        const outputPath = path.join(outputDir, outputFileName);
        
        try {
          await image
            .resize(width, height, {
              fit: 'cover',
              position: 'center'
            })
            .toFormat(format, {
              quality: config.qualities[format] || 80,
              progressive: true
            })
            .toFile(outputPath);
            
          console.log(`  ✓ Created: ${outputFileName}`);
        } catch (err) {
          console.error(`  ✗ Failed to create ${outputFileName}:`, err.message);
        }
      }
    }
    
    // Also create original format in highest quality
    const originalFormat = metadata.format;
    if (originalFormat && config.formats.includes(originalFormat)) {
      const outputFileName = `${fileName}.${originalFormat}`;
      const outputPath = path.join(outputDir, outputFileName);
      
      try {
        await image
          .toFormat(originalFormat, {
            quality: config.qualities[originalFormat] || 90
          })
          .toFile(outputPath);
        console.log(`  ✓ Created original: ${outputFileName}`);
      } catch (err) {
        console.error(`  ✗ Failed to create original ${outputFileName}:`, err.message);
      }
    }
    
  } catch (err) {
    console.error(`Failed to process ${inputPath}:`, err.message);
  }
}

/**
 * Main processing function
 */
async function optimizeImages() {
  console.log('🎨 Astro Mahri Space - Image Optimization Script');
  console.log('================================================');
  console.log(`Source directory: ${config.sourceDir}`);
  console.log(`Output directory: ${config.outputDir}`);
  console.log('');
  
  // Ensure output directory exists
  ensureDir(config.outputDir);
  
  // Find all images in source directory
  const imagePattern = path.join(config.sourceDir, '**/*.{jpg,jpeg,png,gif,bmp,tiff}');
  const imageFiles = glob.sync(imagePattern, { ignore: '**/optimized/**' });
  
  if (imageFiles.length === 0) {
    console.log('No images found to optimize.');
    return;
  }
  
  console.log(`Found ${imageFiles.length} images to process:`);
  
  // Process each image
  for (const imageFile of imageFiles) {
    await processImage(imageFile, config.outputDir);
    console.log(''); // Add spacing between files
  }
  
  console.log('✨ Image optimization complete!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Update your components to use OptimizedImage component');
  console.log('2. Update image references to use optimized versions');
  console.log('3. Test responsive loading on different screen sizes');
}

/**
 * Generate a report of optimized images
 */
function generateReport() {
  const reportPath = path.join(config.outputDir, 'optimization-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    sourceDir: config.sourceDir,
    outputDir: config.outputDir,
    presets: config.presets,
    formats: config.formats,
    totalImages: 0,
    totalSize: 0,
    images: []
  };
  
  // This would be expanded to collect actual size data
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📊 Report saved to: ${reportPath}`);
}

// Run the optimization if this script is called directly
if (require.main === module) {
  // Check if sharp is installed
  try {
    require('sharp');
    require('glob');
  } catch (err) {
    console.error('Missing dependencies. Please install:');
    console.error('npm install sharp glob --save-dev');
    process.exit(1);
  }
  
  optimizeImages()
    .then(() => {
      generateReport();
      console.log('🚀 All done! Your images are now cosmic-level optimized!');
    })
    .catch(err => {
      console.error('❌ Optimization failed:', err);
      process.exit(1);
    });
}

module.exports = {
  optimizeImages,
  processImage,
  config
};