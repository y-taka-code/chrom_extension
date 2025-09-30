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
    console.log('Context menu clicked, tab:', tab.url);
    
    // Check if current tab is a chrome:// page
    if (isChromeInternalPage(tab.url)) {
      console.log('Cannot copy from chrome:// page via context menu');
      return;
    }
    
    // Get saved format preference, default to 'plain'
    chrome.storage.sync.get(['copyFormat'], function(result) {
      const format = result.copyFormat || 'plain';
      console.log('Using format for context menu:', format);
      copyTitleAndURL(tab, format);
    });
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(function(command) {
  console.log('Command received:', command);
  if (command === "copy-title-url") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        console.log('Shortcut triggered, tab:', tabs[0].url);
        
        // Check if current tab is a chrome:// page
        if (isChromeInternalPage(tabs[0].url)) {
          console.log('Cannot copy from chrome:// page via shortcut');
          return;
        }
        
        // Get saved format preference, default to 'plain'
        chrome.storage.sync.get(['copyFormat'], function(result) {
          const format = result.copyFormat || 'plain';
          console.log('Using format for shortcut:', format);
          copyTitleAndURL(tabs[0], format);
        });
      }
    });
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'copyTitleAndURL') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        // Check if current tab is a chrome:// page
        if (isChromeInternalPage(tabs[0].url)) {
          sendResponse({success: false, error: 'chrome:// page not supported'});
          return;
        }
        
        const format = request.format || 'plain';
        copyTitleAndURL(tabs[0], format);
        sendResponse({success: true});
      }
    });
    return true; // Keep message channel open for async response
  }
});

// Function to copy title and URL to clipboard
function copyTitleAndURL(tab, format = 'plain') {
  console.log('copyTitleAndURL called with:', {title: tab.title, url: tab.url, format: format});
  const textToCopy = formatText(tab.title, tab.url, format);
  console.log('Text to copy:', textToCopy);
  
  // Use chrome.scripting to inject a content script for clipboard access
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: copyToClipboard,
    args: [textToCopy]
  }).then(() => {
    console.log('Title and URL copied to clipboard with format:', format);
  }).catch((err) => {
    console.error('Failed to copy to clipboard:', err);
  });
}

// Function to be injected into the page for clipboard access
function copyToClipboard(text) {
  // Try modern Clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Clipboard API copy successful');
    }).catch(() => {
      // Fallback to execCommand
      fallbackCopy(text);
    });
  } else {
    // Fallback to execCommand
    fallbackCopy(text);
  }
}

// Fallback copy function using execCommand
function fallbackCopy(text) {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      console.log('Fallback copy successful');
    } else {
      console.error('Fallback copy failed');
    }
  } catch (err) {
    console.error('Fallback copy error:', err);
  }
}

// Function to check if URL is a Chrome internal page
function isChromeInternalPage(url) {
  return url.startsWith('chrome://') || 
         url.startsWith('chrome-extension://') || 
         url.startsWith('moz-extension://') ||
         url.startsWith('edge://') ||
         url.startsWith('about:');
}

// Function to format text based on selected format
function formatText(title, url, format) {
  switch(format) {
    case 'plain':
      return `${title}\n${url}`;
    case 'markdown':
      return `[${title}](${url})`;
    case 'html':
      return `<a href="${url}">${title}</a>`;
    case 'title-only':
      return title;
    case 'url-only':
      return url;
    default:
      return `${title}\n${url}`;
  }
}
