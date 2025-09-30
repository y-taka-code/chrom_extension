// popup.js - Extension popup functionality

document.addEventListener('DOMContentLoaded', function() {
  const copyBtn = document.getElementById('copyBtn');
  const status = document.getElementById('status');
  const formatPreview = document.getElementById('formatPreview');
  const formatRadios = document.querySelectorAll('input[name="format"]');

  // Load saved format preference
  chrome.storage.sync.get(['copyFormat'], function(result) {
    if (result.copyFormat) {
      const radio = document.querySelector(`input[value="${result.copyFormat}"]`);
      if (radio) radio.checked = true;
    }
    updatePreview();
  });

  // Get current tab info and display it
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      const tab = tabs[0];
      
      // Check if current tab is a Chrome internal page
      if (isChromeInternalPage(tab.url)) {
        status.textContent = '⚠️ Chrome内部ページでは使用できません';
        status.style.color = '#ff6b6b';
        copyBtn.disabled = true;
        copyBtn.textContent = '使用不可';
        copyBtn.style.backgroundColor = '#ccc';
        return;
      }
      
      status.textContent = `現在のページ: ${tab.title.substring(0, 30)}${tab.title.length > 30 ? '...' : ''}`;
      status.style.color = '#666';
      updatePreview(tab);
    }
  });

  // Add event listeners for format selection
  formatRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      updatePreview();
      // Save format preference
      chrome.storage.sync.set({copyFormat: this.value});
    });
  });

  function updatePreview(tab) {
    const selectedFormat = document.querySelector('input[name="format"]:checked').value;
    const title = tab ? tab.title : 'ページタイトル';
    const url = tab ? tab.url : 'https://example.com';
    
    let preview = '';
    switch(selectedFormat) {
      case 'plain':
        preview = `${title}\n${url}`;
        break;
      case 'markdown':
        preview = `[${title}](${url})`;
        break;
      case 'html':
        preview = `<a href="${url}">${title}</a>`;
        break;
      case 'title-only':
        preview = title;
        break;
      case 'url-only':
        preview = url;
        break;
    }
    formatPreview.textContent = `プレビュー: ${preview}`;
  }

  copyBtn.addEventListener('click', function() {
    status.textContent = 'コピー中...';
    copyBtn.disabled = true;
    copyBtn.textContent = 'コピー中...';
    
    // Try direct copy first (faster)
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        const tab = tabs[0];
        const selectedFormat = document.querySelector('input[name="format"]:checked').value;
        const textToCopy = formatText(tab.title, tab.url, selectedFormat);
        
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
      
      const selectedFormat = document.querySelector('input[name="format"]:checked').value;
      chrome.runtime.sendMessage({
        action: 'copyTitleAndURL',
        format: selectedFormat
      }, function(response) {
        clearTimeout(timeoutId);
        
        if (response && response.success) {
          showSuccess();
        } else if (response && response.error === 'chrome:// page not supported') {
          status.textContent = '⚠️ Chrome内部ページでは使用できません';
          copyBtn.disabled = false;
          copyBtn.textContent = 'タイトルとURLをコピー';
        } else {
          status.textContent = '❌ コピーに失敗しました';
          copyBtn.disabled = false;
          copyBtn.textContent = 'タイトルとURLをコピー';
        }
      });
    }
    
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
    
    function isChromeInternalPage(url) {
      return url.startsWith('chrome://') || 
             url.startsWith('chrome-extension://') || 
             url.startsWith('moz-extension://') ||
             url.startsWith('edge://') ||
             url.startsWith('about:');
    }
  });
});
