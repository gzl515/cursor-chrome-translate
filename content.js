// 监听文本选择事件
document.addEventListener('mouseup', () => {
  setTimeout(() => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    if (selectedText && selectedText.length > 0) {
      chrome.runtime.sendMessage({
        action: 'getSelectedText',
        text: selectedText
      });
    }
  }, 10); // 小延迟确保选择完成
});

// 监听键盘选择事件
document.addEventListener('keyup', (e) => {
  // Ctrl+A 或其他键盘选择
  if (e.ctrlKey || e.shiftKey) {
    setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      if (selectedText && selectedText.length > 0) {
        chrome.runtime.sendMessage({
          action: 'getSelectedText',
          text: selectedText
        });
      }
    }, 10);
  }
});

// 获取页面主要内容的函数
function getPageContent() {
  // 尝试获取主要内容区域
  const contentSelectors = [
    'main',
    'article',
    '[role="main"]',
    '.content',
    '.main-content',
    '#content',
    '#main'
  ];

  let content = '';
  
  for (const selector of contentSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      content = element.innerText;
      break;
    }
  }

  // 如果没有找到特定的内容区域，获取body内容
  if (!content) {
    content = document.body.innerText;
  }

  // 清理内容：移除多余的空白字符
  content = content.replace(/\s+/g, ' ').trim();
  
  // 限制内容长度（避免超过API限制）
  if (content.length > 8000) {
    content = content.substring(0, 8000) + '...';
  }

  return content;
}

// 监听来自侧边栏的页面内容请求
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'requestPageContent') {
    const content = getPageContent();
    sendResponse({ content });
  }
  return true;
});

// 页面加载完成后自动发送页面内容
window.addEventListener('load', () => {
  setTimeout(() => {
    const content = getPageContent();
    chrome.runtime.sendMessage({
      action: 'getPageContent',
      content: content
    });
  }, 1000);
}); 