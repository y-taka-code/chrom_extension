// popup.js - Extension popup functionality

document.addEventListener('DOMContentLoaded', function() {
  const copyBtn = document.getElementById('copyBtn');
  const status = document.getElementById('status');

  // Get current tab info and display it
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      const tab = tabs[0];
      status.textContent = `現在のページ: ${tab.title.substring(0, 30)}${tab.title.length > 30 ? '...' : ''}`;
    }
  });

  copyBtn.addEventListener('click', function() {
    status.textContent = 'コピー中...';
    copyBtn.disabled = true;
    copyBtn.textContent = 'コピー中...';
    
    // Send message to background script
    chrome.runtime.sendMessage({action: 'copyTitleAndURL'}, function(response) {
      if (response && response.success) {
        status.textContent = '✅ コピー完了！';
        copyBtn.textContent = '✅ コピー完了';
        
        // Reset button after 2 seconds
        setTimeout(function() {
          copyBtn.disabled = false;
          copyBtn.textContent = 'タイトルとURLをコピー';
          status.textContent = '準備完了';
        }, 2000);
      } else {
        status.textContent = '❌ コピーに失敗しました';
        copyBtn.disabled = false;
        copyBtn.textContent = 'タイトルとURLをコピー';
      }
    });
  });
});
