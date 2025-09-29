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
    
    // Try direct copy first (faster)
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        const tab = tabs[0];
        const textToCopy = `${tab.title}\n${tab.url}`;
        
        // Use modern Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textToCopy).then(function() {
            showSuccess();
          }).catch(function() {
            // Fallback to background script
            useBackgroundCopy();
          });
        } else {
          // Fallback to background script
          useBackgroundCopy();
        }
      }
    });
    
    function showSuccess() {
      status.textContent = '✅ コピー完了！';
      copyBtn.textContent = '✅ コピー完了';
      
      // Reset button after 1 second (faster reset)
      setTimeout(function() {
        copyBtn.disabled = false;
        copyBtn.textContent = 'タイトルとURLをコピー';
        status.textContent = '準備完了';
      }, 1000);
    }
    
    function useBackgroundCopy() {
      // Send message to background script with timeout
      const timeoutId = setTimeout(function() {
        status.textContent = '❌ タイムアウト';
        copyBtn.disabled = false;
        copyBtn.textContent = 'タイトルとURLをコピー';
      }, 2000); // 2秒でタイムアウト
      
      chrome.runtime.sendMessage({action: 'copyTitleAndURL'}, function(response) {
        clearTimeout(timeoutId);
        
        if (response && response.success) {
          showSuccess();
        } else {
          status.textContent = '❌ コピーに失敗しました';
          copyBtn.disabled = false;
          copyBtn.textContent = 'タイトルとURLをコピー';
        }
      });
    }
  });
});
