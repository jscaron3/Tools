# Per-Image Height Override - Test Checklist

## ✅ Feature Testing Guide

### Test 1: Auto-Height with Different Aspect Ratios
```
Steps:
1. Upload 2 images with different aspect ratios
   - Image A: 2000 × 1000 (ratio: 0.5)
   - Image B: 1000 × 1500 (ratio: 1.5)
2. Set width to 400
3. Leave height (#ch) EMPTY
4. Click "Apply Size"

Expected Results:
✓ Image A: canvas width=400, height=200 (400 × 0.5)
✓ Image B: canvas width=400, height=600 (400 × 1.5)
✓ Each image has different height based on ITS aspect ratio
```

### Test 2: Manual Height Override
```
Steps:
1. With images from Test 1, height inputs are empty
2. In Card 1, enter "250" in Height field
3. Leave Card 2 Height field empty
4. Click "Apply Size" again

Expected Results:
✓ Card 1: canvas height = 250 (manual override)
✓ Card 2: canvas height = 600 (auto-calculated from ratio)
✓ Manual value takes precedence over auto-calculation
```

### Test 3: Draggable Canvas Edge
```
Steps:
1. Hover near top or bottom edge of canvas (within 8px)
2. Should see cursor change to "↕ resize"
3. Click and drag UP to decrease height
4. Click and drag DOWN to increase height

Expected Results:
✓ Cursor changes to ns-resize on hover
✓ Canvas height changes when dragging
✓ Height input field updates automatically
✓ Minimum height enforced (50px minimum)
```

### Test 4: Global Height Value Override
```
Steps:
1. Set width to 400, height to 300 (fill #ch with value)
2. Click "Apply Size"
3. Upload image (ignore per-image auto-height)

Expected Results:
✓ Image WITHOUT customHeight set: height = 300 (global value)
✓ Image WITH customHeight set: height = customHeight (override)
✓ Per-image customHeight always takes precedence
```

### Test 5: Reset Button
```
Steps:
1. Set per-image heights to various values
2. Drag some canvas edges
3. Click "Reset" button on any card

Expected Results:
✓ customHeight cleared (back to null)
✓ Height input field clears
✓ Canvas recalculates height from aspect ratio (or global #ch)
✓ Scale, position, and other controls reset
```

### Test 6: Export with Different Heights
```
Steps:
1. Set different heights for each image
2. Download each image
3. Check exported dimensions

Expected Results:
✓ Downloaded images have correct dimensions
✓ Width matches global setting
✓ Height matches each image's canvas height
✓ Content is properly rendered (not distorted)
```

### Test 7: Contain/Cover Fit with Per-Image Heights
```
Steps:
1. Set images with different heights
2. Click "Contain" or "Cover" button
3. Verify scaling applies to each image individually

Expected Results:
✓ Each image scales based on ITS canvas dimensions
✓ Fit calculation uses that image's canvasW and canvasH
✓ No errors or visual glitches
```

### Test 8: Responsive Input Validation
```
Steps:
1. Enter negative number in Height field
2. Enter 0 in Height field
3. Enter very large number (5000)
4. Leave field empty, then clear it multiple times

Expected Results:
✓ Negative/0 values handled gracefully
✓ Large values work (minimum 50px enforced by dragging only)
✓ Empty field = auto-calculation
✓ No console errors
```

## 🔧 Technical Verification

### Code Quality Checks
- [ ] No syntax errors: `node -c script.js`
- [ ] All variables properly scoped
- [ ] No memory leaks (test with long sessions)
- [ ] Canvas properly cleared on re-render
- [ ] Event listeners don't duplicate (no multiple listeners on same element)

### Edge Cases
- [ ] Single image: auto-height works
- [ ] Many images (10+): performance acceptable
- [ ] Very small widths (50px): height calculation works
- [ ] Very large widths (5000px): doesn't crash
- [ ] Switching between empty and filled #ch: correct recalculation

### Browser Compatibility
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Mobile browsers: touch drag works

## 📊 Visual Checks
- [ ] Height input styling matches other controls
- [ ] Placeholder text visible when empty
- [ ] Focus state visible (blue outline)
- [ ] ns-resize cursor appears on canvas edge
- [ ] No layout shifting when entering/clearing height values
- [ ] Card layout stable with varying heights

## 🚀 Performance Checks
- [ ] Click "Apply Size" with 20 images: under 100ms
- [ ] Dragging canvas edge: smooth (60fps)
- [ ] No lag when editing height input
- [ ] Rendering doesn't stutter with large images

## ✨ User Experience
- [ ] Height field placeholder clearly indicates "auto"
- [ ] Dragging edge provides visual feedback
- [ ] Reset button feels responsive
- [ ] Workflow is intuitive (empty = auto, value = manual)
- [ ] Error messages (if any) are clear
