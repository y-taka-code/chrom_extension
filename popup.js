// popup.js - Extension popup functionality

document.addEventListener('DOMContentLoaded', function() {
  const actionBtn = document.getElementById('actionBtn');
  const status = document.getElementById('status');

  actionBtn.addEventListener('click', function() {
    status.textContent = 'Button clicked!';
    
    // Send message to content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'buttonClicked'});
    });
  });

  // Load saved settings
  chrome.storage.sync.get(['extensionEnabled'], function(result) {
    if (result.extensionEnabled !== undefined) {
      status.textContent = result.extensionEnabled ? 'Enabled' : 'Disabled';
    }
  });
});
