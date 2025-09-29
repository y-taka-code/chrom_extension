// background.js - Service worker for background tasks

console.log('Background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener(function(details) {
  console.log('Extension installed:', details.reason);
  
  // Create context menu
  chrome.contextMenus.create({
    id: "copyTitleAndURL",
    title: "タイトルとURLをコピー",
    contexts: ["page"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "copyTitleAndURL") {
    copyTitleAndURL(tab);
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'copyTitleAndURL') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        copyTitleAndURL(tabs[0]);
        sendResponse({success: true});
      }
    });
    return true; // Keep message channel open for async response
  }
});

// Function to copy title and URL to clipboard
function copyTitleAndURL(tab) {
  const textToCopy = `${tab.title}\n${tab.url}`;
  
  // Use the Clipboard API with simplified error handling
  navigator.clipboard.writeText(textToCopy).then(function() {
    console.log('Title and URL copied to clipboard');
    // Remove notification to improve performance
  }).catch(function(err) {
    console.error('Failed to copy to clipboard:', err);
    // Fallback: try using document.execCommand (deprecated but faster)
    try {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      console.log('Fallback copy successful');
    } catch (fallbackErr) {
      console.error('Fallback copy failed:', fallbackErr);
    }
  });
}
