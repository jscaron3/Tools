# Quick Start: Per-Image Height Override Feature

## 🎯 Basic Usage

### Auto-Height Mode (Recommended for batch processing)
```
1. Upload images
2. Set Width: 400
3. Leave Height EMPTY
4. Click "Apply Size"
→ Each image gets height based on its aspect ratio
```

### Manual Mode (For custom cropping)
```
1. Upload images
2. Set Width: 400
3. Set Height: 300 (or leave empty)
4. Click "Apply Size"
5. For each image:
   a. Click in "Height (empty=auto)" field
   b. Enter custom value (e.g., 250)
   c. OR drag canvas edge to resize
→ Each image uses its own height
```

---

## 🎨 Interaction Guide

### Input Field
- **Empty** = Use auto-height based on that image's aspect ratio
- **Value** = Use that specific height (crop as needed)

### Canvas Dragging
1. Hover near canvas **top or bottom edge** (8 pixels from edge)
2. Cursor changes to **↕** (resize indicator)
3. **Drag up** = Decrease height
4. **Drag down** = Increase height
5. Height field auto-updates

### Reset Button
Click to:
- Clear custom height
- Reset scale/position
- Return to original settings

---

## 📐 Examples

### Example 1: Different Aspect Ratios
```
Image A: 2000×1000 (ratio 0.5)
Image B: 1000×1500 (ratio 1.5)
Width: 400, Height: EMPTY

Result:
Image A → 400×200
Image B → 400×600
```

### Example 2: Mixed Auto and Manual
```
Image A: 2000×1000, Height: EMPTY → 400×200 (auto)
Image B: 1000×1500, Height: 400 → 400×400 (manual)
Image C: 1500×1500, Height: 300 → 400×300 (manual)
```

### Example 3: Custom Cropping
```
Image A:
1. Set Height field: 150
2. OR drag canvas edge down
3. Result: 400×150 (custom crop)
```

---

## ⚙️ How Height is Calculated

### Priority Order:
1. **Custom Height** (if set in per-image field) ← Highest priority
2. **Auto Height** (if global #ch empty) = width × aspect_ratio
3. **Global Height** (if #ch has value)

### Formula for Auto-Height:
```
canvas_height = canvas_width × (image_height / image_width)
```

Example:
```
Image: 2000×1000
Aspect Ratio: 1000÷2000 = 0.5
Width: 400
Auto Height: 400 × 0.5 = 200 ✓
```

---

## 🔧 Tips & Tricks

✅ **Batch Processing**
- Leave #ch empty for fastest workflow
- Each image uses its own aspect ratio
- Set width once, apply to all

✅ **Consistent Heights**
- Use per-image "Height" input to set specific height
- Overrides aspect ratio-based calculation
- Good for creating uniform grids

✅ **Fine Tuning**
- Use dragging for visual adjustment
- Use input field for precise values
- Both update each other automatically

✅ **Minimum Height**
- Minimum 50 pixels (enforced by dragging)
- Input field accepts any value
- Use carefully for very small heights

---

## 🚫 Common Mistakes

❌ **Mistake 1:** Expecting global #ch to apply equally
- If #ch has value, each image needs customHeight to override
- Leave #ch empty for per-image auto-height

❌ **Mistake 2:** Dragging in wrong area
- Must hover near **edge** (top 8px or bottom 8px)
- Cursor should change to ↕ resize
- Center of canvas won't trigger resize

❌ **Mistake 3:** Forgetting to click "Apply Size"
- Height changes only apply after clicking ➜ button
- Dragging changes are immediate
- Input field changes need Apply Size click

---

## 📊 Workflow Comparison

### Traditional (Global Height Only)
```
Global: W=400, H=300
All images: 400×300 (may distort some images)
```

### New (Per-Image Height)
```
Global: W=400, H=EMPTY
Image A: 400×200 (aspect preserved)
Image B: 400×600 (aspect preserved)
Image C: 400×250 (manual override)
```

---

## ✨ Summary

| Feature | Before | After |
|---------|--------|-------|
| Different aspect ratios | Same height (distorts) | Each own height ✓ |
| Manual height override | N/A | Per-image field ✓ |
| Visual resizing | N/A | Draggable edges ✓ |
| Auto-calculation | Global only | Per-image ✓ |
| Flexibility | Limited | High ✓ |

Ready to use! Questions? Check TEST_CHECKLIST.md for detailed tests.
