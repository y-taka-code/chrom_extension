# Chrome Extension Template

A basic Chrome extension template with popup, content script, and background service worker.

## Features

- Popup interface with HTML/CSS/JS
- Content script for web page interaction
- Background service worker for background tasks
- Chrome storage API integration
- Message passing between components

## File Structure

```
chrom_extension/
├── manifest.json          # Extension configuration
├── popup.html            # Popup interface
├── popup.js              # Popup functionality
├── content.js            # Content script
├── background.js         # Background service worker
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select this folder

## Development

- Edit the files as needed
- Reload the extension in Chrome after making changes
- Check the browser console for debugging information

## Permissions

- `activeTab`: Access to the current active tab
- `storage`: Access to Chrome storage API
