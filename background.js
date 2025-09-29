// background.js - Service worker for background tasks

console.log('Background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener(function(details) {
  console.log('Extension installed:', details.reason);
  
  // Set default settings
  chrome.storage.sync.set({
    extensionEnabled: true,
    lastUsed: Date.now()
  });
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Message received:', request);
  
  if (request.action === 'getData') {
    // Example: Fetch data from storage
    chrome.storage.sync.get(['extensionEnabled'], function(result) {
      sendResponse({data: result});
    });
    return true; // Keep message channel open for async response
  }
});

// Handle tab updates
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('Tab updated:', tab.url);
  }
});
