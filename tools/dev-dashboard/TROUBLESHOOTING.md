# Troubleshooting Guide

## Changelog Tab Not Working

### Issue Fixed ✅
The changelog data files were moved from `tools/divi-changelog/data/` to `tools/dev-dashboard/data/`, and the app.js paths have been updated to use relative paths.

### What Changed
**Before:**
```javascript
const SOURCES = { 
  "divi-4": "tools/divi-changelog/data/divi-4.json", 
  "divi-5": "tools/divi-changelog/data/divi-5.json" 
};
const META_PATH = "tools/divi-changelog/data/meta.json";
```

**After:**
```javascript
const SOURCES = { 
  "divi-4": "./data/divi-4.json", 
  "divi-5": "./data/divi-5.json" 
};
const META_PATH = "./data/meta.json";
```

This ensures the data files are found correctly when the tool is loaded from anywhere.

## Data Files Location

All Divi changelog data is now located in:
- `/Users/eclate/Documents/GitHub/Tools/tools/dev-dashboard/data/divi-4.json`
- `/Users/eclate/Documents/GitHub/Tools/tools/dev-dashboard/data/divi-5.json`
- `/Users/eclate/Documents/GitHub/Tools/tools/dev-dashboard/data/meta.json`

## If Changelog Still Doesn't Load

### Step 1: Check Browser Console
Open Developer Tools (F12) and check the Console tab for any error messages.

### Step 2: Clear Cache
1. Open Developer Tools
2. Go to Application → Local Storage
3. Find and delete:
   - `merged-change-cache-v1`
   - `merged-prefs-v1`
4. Refresh the page

### Step 3: Check Network Tab
1. Open Developer Tools → Network tab
2. Click the "Refresh changelog" button
3. Look for requests to `./data/divi-4.json` and `./data/divi-5.json`
4. Check if they return 200 status and valid JSON

## Expected Behavior

### On First Load
- Changelog tab shows "Loading…"
- Loads Divi 4 (370 releases) and Divi 5 (45 releases)
- After ~1-2 seconds, displays combined view

### After Loading
- Shows releases sorted by newest first
- Product selector defaults to "Combined"
- All change types are selected by default
- Status bar shows release count

### After Clicking "Refresh changelog"
- Reloads data from the JSON files
- Updates cache with fresh data
- Shows any errors if files can't be loaded

## Common Issues

### Issue: "No releases match your filters"
**Solution:** Click "Reset filters" to restore default filter selections

### Issue: "Some data could not be loaded"
**Cause:** Network error or file not found
**Solution:** 
1. Check that data files exist in `./data/` directory
2. Verify JSON files are not corrupted
3. Refresh the page

### Issue: Can only see Vulnerabilities, Changelog tab shows nothing
**Solution:** This was the original issue. It's now fixed by updating the paths in app.js to use relative paths (`./data/` instead of `tools/divi-changelog/data/`)

## Verification

To verify everything is working:

1. **Files Check**: All three files should exist in `/tools/dev-dashboard/data/`
   - `divi-4.json` (~1.2MB)
   - `divi-5.json` (~560KB)
   - `meta.json` (~0.4KB)

2. **JavaScript Check**: Search app.js for `./data/` - should find 3 matches

3. **Functionality Check**: 
   - Click "📋 Changelog" tab
   - Should show combined releases from both Divi 4 and 5
   - Total: 415 releases (370 + 45)

## Need More Help?

Check the following documentation files:
- `README.md` - User guide and feature overview
- `FEATURES.md` - Complete feature checklist
- `MERGE_NOTES.md` - Technical merge details
