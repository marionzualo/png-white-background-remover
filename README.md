# PNG White Background Remover

A Node.js script that removes white backgrounds from PNG images and makes them transparent. Perfect for creating favicons or any images that need transparent backgrounds.

## Installation

1. Clone this repository:
```bash
git clone https://github.com/marionzualo/png-white-background-remover.git
cd png-white-background-remover
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Basic Usage
Remove white background from a PNG image:
```bash
node index.js input.png
```
This will create `input_no_bg.png` with transparent background.

### Advanced Options

**Specify output file:**
```bash
node index.js input.png -o output.png
```

**Adjust white detection tolerance (0-255):**
```bash
node index.js input.png -t 20
```
Higher tolerance will detect more "near-white" pixels as white.

**Resize the output:**
```bash
node index.js input.png -s 32x32
```

**Generate favicon sizes automatically:**
```bash
node index.js input.png --favicon
```
This creates 16x16, 32x32, and 48x48 versions perfect for favicons.

**Combine options:**
```bash
node index.js logo.png -o favicon.png -t 15 --favicon
```

## Command Line Options

- `-o, --output <file>`: Specify output file path
- `-t, --tolerance <number>`: White detection tolerance (0-255, default: 10)
- `-s, --size <size>`: Resize output (format: WIDTHxHEIGHT, e.g., 64x64)
- `--favicon`: Generate common favicon sizes (16x16, 32x32, 48x48)
- `-h, --help`: Show help
- `-V, --version`: Show version

## How It Works

The script analyzes each pixel in the PNG image and makes pixels that are white or near-white (based on tolerance) transparent. The tolerance setting allows you to fine-tune which shades of white should be removed:

- **Tolerance 0**: Only pure white pixels (RGB: 255,255,255) become transparent
- **Tolerance 10** (default): Pixels with RGB values 245+ become transparent
- **Tolerance 50**: Very light grays and off-whites become transparent

## Examples

### Creating a favicon from a logo:
```bash
# Process logo with moderate tolerance and generate favicon sizes
node index.js company-logo.png -t 15 --favicon -o favicon.png

# Output files:
# - favicon.png (original size, transparent background)
# - favicon_16x16.png (16x16 favicon)
# - favicon_32x32.png (32x32 favicon)  
# - favicon_48x48.png (48x48 favicon)
```

### Processing with different tolerance levels:
```bash
# Low tolerance - only very white pixels
node index.js image.png -t 5 -o result-low.png

# High tolerance - removes light grays too
node index.js image.png -t 30 -o result-high.png
```

## Requirements

- Node.js 14.0.0 or higher
- Dependencies: sharp, commander (installed via `npm install`)

## Features

- ✅ Removes white and near-white backgrounds
- ✅ Adjustable tolerance for white detection
- ✅ Automatic favicon size generation (16x16, 32x32, 48x48)
- ✅ Custom output sizing
- ✅ Command-line interface
- ✅ Error handling and validation
- ✅ Cross-platform compatibility

## License

MIT