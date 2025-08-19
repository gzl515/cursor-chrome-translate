// 插件激活时打开侧边栏
chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (error) {
    console.error('Failed to open side panel:', error);
  }
});

// 处理Kimi API调用
async function callKimiAPI(messages, apiKey) {
  try {
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: messages,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Kimi API调用失败:', error);
    throw error;
  }
}

// 存储最新的选中文本和页面内容
let latestSelectedText = '';
let latestPageContent = '';

// 统一的消息监听器
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectedText') {
    // 存储选中文本，供侧边栏查询
    latestSelectedText = request.text;
    sendResponse({ success: true });
    return true;
  } else if (request.action === 'getPageContent') {
    // 存储页面内容，供侧边栏查询
    latestPageContent = request.content;
    sendResponse({ success: true });
    return true;
  } else if (request.action === 'requestLatestSelectedText') {
    // 侧边栏请求最新选中文本
    sendResponse({ text: latestSelectedText });
    return true;
  } else if (request.action === 'requestLatestPageContent') {
    // 侧边栏请求最新页面内容
    sendResponse({ content: latestPageContent });
    return true;
  } else if (request.action === 'callKimiAPI') {
    // 处理API调用
    callKimiAPI(request.messages, request.apiKey)
      .then(result => {
        sendResponse({ success: true, result });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // 保持消息通道开启
  }
  
  return false;
}); 