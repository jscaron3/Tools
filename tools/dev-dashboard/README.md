# Changelog & Vulnerabilities Tool

A unified tool that combines changelog tracking and security vulnerability monitoring in one intuitive interface.

## Features

### 🔒 Vulnerabilities Tab
Track CVEs and security vulnerabilities from the National Vulnerability Database (NVD).

**Capabilities:**
- **Multi-Product Monitoring**: Track vulnerabilities across WordPress, PHP, Divi, ACF, jQuery, MySQL, Apache, nginx, and more
- **Severity Filtering**: Filter by Critical, High, Medium, or Low severity levels
- **Search & Filter**: Search by CVE ID, product name, or vulnerability description
- **Sorting Options**: Sort by newest first or highest score
- **Real-time Updates**: Fetch the latest 30 days of CVEs from the official NVD API
- **Local Caching**: Data is cached locally to work offline and reduce API calls
- **User Preferences**: Your selected products are saved between sessions

**Data Source:** National Vulnerability Database (NVD) API 2.0
- Rate limit: 5 requests per 30 seconds (no API key required)
- Shows CVEs published in the last 30 days

### 📋 Changelog Tab
Track releases and changes for Divi 4 and Divi 5 themes.

**Capabilities:**
- **Multi-Product Support**: Switch between Divi 4, Divi 5, or combined view
- **Change Type Filtering**: Filter by Features, Improvements, Bug fixes, or Security updates
- **Date Range Filtering**: Select from and to dates to narrow down releases
- **Search Functionality**: Search across version numbers and release notes
- **File Tracking**: View changed files for each release (when available)
- **Latest Release Badge**: Easily identify the most recent release
- **Expandable Details**: Click to expand and read full change details

**Data Sources:**
- Divi 4: https://www.elegantthemes.com/api/changelog/divi.txt
- Divi 5: https://www.elegantthemes.com/api/changelog/divi-5.txt

## Usage

### Quick Start
1. **Select a Tab**: Click either "🔒 Vulnerabilities" or "📋 Changelog" to switch views
2. **Apply Filters**: Use the filter panel to narrow down results
3. **Update Data**: Click "Update vulnerabilities" or "Refresh changelog" for latest data
4. **Search**: Use the search box for keyword filtering

### Vulnerabilities Tab Workflow
1. Select products to monitor (WordPress, PHP, Divi, etc.)
2. Choose severity level (or leave as "All")
3. Click "Update vulnerabilities" to fetch latest data
4. Click on CVE ID to view details on NVD website
5. Use search to find specific vulnerabilities
6. Click descriptions to expand and read full details

### Changelog Tab Workflow
1. Select a product (Combined, Divi 4, or Divi 5)
2. Apply change type filters (Features, Improvements, Bug fixes, Security)
3. Set optional date range filters
4. Click "Refresh changelog" to get latest releases
5. Click "▸" to expand release details
6. Click "Files changed" to see modified files

## Technical Details

### Storage
- All data is cached locally using `localStorage`
- Vulnerabilities cache: `merged-vuln-cache-v1`
- Changelog cache: `merged-change-cache-v1`
- User preferences: `merged-prefs-v1`

### Dark Mode
The tool automatically supports your system's dark mode preference via `prefers-color-scheme` media query.

### Responsive Design
Fully responsive layout works great on:
- Desktop (980px max-width container)
- Tablets
- Mobile devices

### Performance
- Lazy loading of tabs (only loads what you're viewing)
- Cached data to minimize API calls
- Rate-limited NVD API requests (1200ms between requests)
- Local filtering for instant search results

## Color Coding

### Vulnerability Severity
- **Critical** (Red): `#a61b1b` - Immediate action required
- **High** (Orange): `#c2410c` - Important, patch soon
- **Medium** (Yellow): `#9a6700` - Review and plan patching
- **Low** (Green): `#2f7a4d` - Monitor and patch as convenient
- **Not Scored** (Gray): No severity assigned

### Change Types
- **Features** (Green): New functionality
- **Improvements** (Blue): Enhancements to existing features
- **Bug Fixes** (Yellow): Fixes for reported issues
- **Security** (Red): Security-related updates

## Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Any modern browser with ES6 support and `localStorage`

## Privacy
- All data processing happens locally in your browser
- No tracking or analytics
- NVD API calls go directly to official government servers
- Divi changelog calls go to Elegant Themes official servers
- Your preferences are stored only in your browser's local storage

## Accessibility
- Full keyboard navigation support
- ARIA labels for screen readers
- Focus indicators on all interactive elements
- Semantic HTML structure
- Proper color contrast ratios

## Tips & Tricks

1. **Save Bandwidth**: Data is cached, so only click "Update" when needed
2. **Quick Search**: Type in search boxes for instant filtering
3. **Keyboard Friendly**: Use Tab to navigate and Enter to select
4. **Share Findings**: Copy URLs after filtering to share specific results
5. **Monitor Trends**: Compare changelog across versions to understand feature progression

## Related Tools
- **Divi Changelog** (original): `tools/divi-changelog/`
- **Vulnerability Log** (original): `tools/vulnerability-log/`

Both tools' full functionality is preserved in this merged version.
