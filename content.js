// content.js - Content script for web page interaction

console.log('Content script loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'buttonClicked') {
    console.log('Button clicked from popup');
    
    // Example: Change page background color
    document.body.style.backgroundColor = '#f0f0f0';
    
    // Send response back to popup
    sendResponse({status: 'success'});
  }
});

// Example: Add a custom element to the page
function addCustomElement() {
  const element = document.createElement('div');
  element.id = 'extension-element';
  element.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #4CAF50;
    color: white;
    padding: 10px;
    border-radius: 5px;
    z-index: 10000;
    font-family: Arial, sans-serif;
  `;
  element.textContent = 'Extension Active';
  document.body.appendChild(element);
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addCustomElement);
} else {
  addCustomElement();
}
