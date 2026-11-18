# Per-Image Height Override Feature

## Overview
Each image now has independent height control, allowing:
1. **Auto-height calculation** when global #ch is empty (based on each image's aspect ratio)
2. **Manual height override** per image for custom cropping
3. **Draggable canvas edges** for visual height adjustment

## How It Works

### 1. Auto-Height Calculation
When the global height input (#ch) is empty:
- Each image calculates its canvas height based on **its own aspect ratio**
- Formula: `height = width × (image_height / image_width)`
- Example: 
  - Image: 2000 × 1000 pixels (ratio = 0.5)
  - Width set to: 400
  - Auto-height: 400 × 0.5 = **200 pixels**

### 2. Manual Height Override (Per-Image)
Each card has a "Height (empty=auto)" input:
- Leave empty → uses auto-calculated height from that image's ratio
- Enter value → uses specified height for that image
- Useful for custom cropping different images to different heights

### 3. Draggable Canvas Edges
Hover over canvas top or bottom edge (within 8px):
- Cursor changes to `↕ resize`
- Drag to adjust height manually
- Updates the per-image height override input field automatically

## Implementation Details

### Item Properties
```javascript
item.customHeight = null;     // null = use auto, number = override
item.aspectRatio = h/w;       // Each image's aspect ratio
```

### Height Calculation Flow
1. `applyCanvasSize()` sets global `CANVAS_W`
2. `updateCanvasSize(item)` calculates each item's height:
   - If customHeight is set → use it
   - Else if ch is empty → use `CANVAS_W × item.aspectRatio`
   - Else use global ch value
3. Each canvas gets independent width/height
4. `draw(item)` uses local `canvasW` and `canvasH`

### UI Changes
- Added height input to each card controls
- Added canvas edge detection and dragging
- Added CSS styling for height override input

## Usage Example

1. **Upload an image** (e.g., 2000×1000)
2. **Set width** to 400 in global input #cw
3. **Leave height #ch empty**
4. **Click "Apply size"**
5. **Result:**
   - Card 1 (if 2000×1000): canvas = 400×200
   - Card 2 (if 1000×1500): canvas = 400×600
   - Each image's aspect ratio is preserved!
6. **To override:** Enter a value in the card's "Height" input or drag the canvas edge

## Key Features
- ✅ Each image has independent aspect ratio
- ✅ Auto-height uses each image's specific ratio
- ✅ Manual override per image for cropping
- ✅ Draggable edges for visual adjustment
- ✅ Reset button clears all customizations
