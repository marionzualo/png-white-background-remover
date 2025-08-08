#!/usr/bin/env node

const sharp = require('sharp');
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

const program = new Command();

program
  .name('png-white-background-remover')
  .description('Remove white background from PNG images and make it transparent')
  .version('1.0.0');

program
  .argument('<input>', 'input PNG file path')
  .option('-o, --output <file>', 'output file path (default: adds _no_bg suffix)')
  .option('-t, --tolerance <number>', 'white detection tolerance (0-255)', '10')
  .option('-s, --size <size>', 'resize output to specific size (e.g., 32x32, 64x64)', '')
  .option('--favicon', 'generate favicon sizes (16x16, 32x32, 48x48)')
  .action(async (input, options) => {
    try {
      await processImage(input, options);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

async function processImage(inputPath, options) {
  // Validate input file
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const tolerance = parseInt(options.tolerance);
  if (isNaN(tolerance) || tolerance < 0 || tolerance > 255) {
    throw new Error('Tolerance must be a number between 0 and 255');
  }

  // Generate output filename if not provided
  let outputPath = options.output;
  if (!outputPath) {
    const ext = path.extname(inputPath);
    const name = path.basename(inputPath, ext);
    const dir = path.dirname(inputPath);
    outputPath = path.join(dir, `${name}_no_bg${ext}`);
  }

  console.log(`Processing: ${inputPath}`);
  console.log(`Output: ${outputPath}`);
  console.log(`Tolerance: ${tolerance}`);

  // Load the image
  let image = sharp(inputPath);
  
  // Get image metadata
  const metadata = await image.metadata();
  console.log(`Input dimensions: ${metadata.width}x${metadata.height}`);

  // Ensure PNG format
  if (metadata.format !== 'png') {
    console.log('Converting to PNG format...');
  }

  // Process the image to remove white background
  image = image.png();

  // Apply white background removal
  // This uses a threshold approach to make white/near-white pixels transparent
  const buffer = await image.raw().toBuffer();
  const channels = metadata.channels || 4;
  const width = metadata.width;
  const height = metadata.height;

  // Create new buffer with alpha channel
  const newBuffer = Buffer.alloc(width * height * 4); // RGBA

  for (let i = 0; i < buffer.length; i += channels) {
    const r = buffer[i];
    const g = buffer[i + 1];
    const b = buffer[i + 2];
    const a = channels === 4 ? buffer[i + 3] : 255;

    // Check if pixel is white or near-white
    const isWhite = r >= (255 - tolerance) && 
                   g >= (255 - tolerance) && 
                   b >= (255 - tolerance);

    const outputIndex = Math.floor(i / channels) * 4;
    newBuffer[outputIndex] = r;     // R
    newBuffer[outputIndex + 1] = g; // G
    newBuffer[outputIndex + 2] = b; // B
    newBuffer[outputIndex + 3] = isWhite ? 0 : a; // A (transparent if white)
  }

  // Create sharp instance from processed buffer
  let processedImage = sharp(newBuffer, {
    raw: {
      width: width,
      height: height,
      channels: 4
    }
  }).png();

  // Apply resizing if requested
  if (options.size) {
    const [w, h] = options.size.split('x').map(n => parseInt(n));
    if (isNaN(w) || isNaN(h)) {
      throw new Error('Size format should be WIDTHxHEIGHT (e.g., 32x32)');
    }
    console.log(`Resizing to: ${w}x${h}`);
    processedImage = processedImage.resize(w, h);
  }

  // Save the processed image
  await processedImage.toFile(outputPath);
  console.log(`✓ Processed image saved: ${outputPath}`);

  // Generate favicon sizes if requested
  if (options.favicon) {
    const faviconSizes = [16, 32, 48];
    const baseName = path.basename(outputPath, path.extname(outputPath));
    const dir = path.dirname(outputPath);

    console.log('\nGenerating favicon sizes...');
    for (const size of faviconSizes) {
      const faviconPath = path.join(dir, `${baseName}_${size}x${size}.png`);
      await processedImage.clone().resize(size, size).toFile(faviconPath);
      console.log(`✓ Generated ${size}x${size}: ${faviconPath}`);
    }
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled error:', error.message);
  process.exit(1);
});

program.parse();