# Logos Resizer - Per-Image Height Override Feature

## What's New

The logos resizer now supports **per-image height override** with automatic aspect ratio-based height calculation and draggable canvas edges.

## Key Features

### 1. Auto-Height from Aspect Ratio
- Leave global height (#ch) empty
- Each image calculates its own height based on its aspect ratio
- Formula: `height = width × (image_height / image_width)`

### 2. Per-Image Height Control
- Each card has a "Height (empty=auto)" input field
- Leave empty for automatic calculation
- Enter value to manually override and crop

### 3. Draggable Canvas Edges
- Hover near canvas top or bottom edge (within 8px)
- Cursor changes to resize indicator (↕)
- Drag to adjust height visually
- Height input updates automatically

## Usage

### Quick Start
1. Upload images
2. Set Width in global input
3. Leave Height empty
4. Click "Apply Size"
5. Each image gets height from its aspect ratio

### Manual Override
1. In any card, enter value in "Height" field
2. Or drag the canvas edge to resize
3. That image will use the specified height instead of auto-calculated

## Examples

**Image A (2000×1000)** with width 400
- Auto height: 400 × (1000/2000) = **200**

**Image B (1000×1500)** with width 400  
- Auto height: 400 × (1500/1000) = **600**

## Files Modified

- `script.js` - Core functionality (per-image height logic, dragging)
- `style.css` - Height input styling

## Documentation

See the following files for detailed information:
- `QUICK_START.md` - Quick usage guide
- `FEATURE_HEIGHT_OVERRIDE.md` - Detailed feature documentation
- `TEST_CHECKLIST.md` - Testing and verification guide

## Browser Compatibility

Works in all modern browsers:
- Chrome/Chromium
- Firefox  
- Safari
- Edge

## Questions?

Check the documentation files or the source code comments for more details.
