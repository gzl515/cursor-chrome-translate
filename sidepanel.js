// DOM元素引用
const elements = {
  translateBtn: document.getElementById('translateBtn'),
  summarizeBtn: document.getElementById('summarizeBtn'),
  selectedTextArea: document.getElementById('selectedTextArea'),
  selectedText: document.getElementById('selectedText'),
  clearSelectedBtn: document.getElementById('clearSelectedBtn'),
  resultContainer: document.getElementById('resultContainer'),
  resultActions: document.getElementById('resultActions'),
  copyBtn: document.getElementById('copyBtn'),
  clearBtn: document.getElementById('clearBtn'),
  apiKey: document.getElementById('apiKey'),
  saveApiKey: document.getElementById('saveApiKey'),
  targetLang: document.getElementById('targetLang'),
  summaryLength: document.getElementById('summaryLength'),
  loading: document.getElementById('loading'),
  status: document.getElementById('status')
};

// 全局状态
let currentSelectedText = '';
let currentPageContent = '';
let lastSelectedText = '';

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
  requestPageContent();
  startPolling();
});

// 加载设置
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['apiKey', 'targetLang', 'summaryLength']);
    if (result.apiKey) {
      elements.apiKey.value = result.apiKey;
    }
    if (result.targetLang) {
      elements.targetLang.value = result.targetLang;
    }
    if (result.summaryLength) {
      elements.summaryLength.value = result.summaryLength;
    }
  } catch (error) {
    console.error('加载设置失败:', error);
  }
}

// 设置事件监听器
function setupEventListeners() {
  // 功能按钮
  elements.translateBtn.addEventListener('click', handleTranslate);
  elements.summarizeBtn.addEventListener('click', handleSummarize);
  
  // 结果操作按钮
  elements.copyBtn.addEventListener('click', copyResult);
  elements.clearBtn.addEventListener('click', clearResult);
  
  // 清空选中文本按钮
  elements.clearSelectedBtn.addEventListener('click', clearSelectedText);
  
  // 设置保存
  elements.saveApiKey.addEventListener('click', saveApiKey);
  elements.targetLang.addEventListener('change', saveTargetLang);
  elements.summaryLength.addEventListener('change', saveSummaryLength);
  
  // 不再需要监听background的消息，改为轮询
  // chrome.runtime.onMessage.addListener 已替换为轮询机制
}

// 开始轮询检查选中文本和页面内容
function startPolling() {
  // 每500毫秒检查一次是否有新的选中文本
  setInterval(async () => {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'requestLatestSelectedText' });
      if (response && response.text && response.text !== lastSelectedText) {
        lastSelectedText = response.text;
        updateSelectedText(response.text);
      }
    } catch (error) {
      // 忽略错误，可能是background script还未准备好
    }
  }, 500);

  // 每2秒检查一次页面内容
  setInterval(async () => {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'requestLatestPageContent' });
      if (response && response.content) {
        currentPageContent = response.content;
      }
    } catch (error) {
      // 忽略错误
    }
  }, 2000);
}

// 请求页面内容
async function requestPageContent() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'requestPageContent' });
    if (response && response.content) {
      currentPageContent = response.content;
    }
  } catch (error) {
    console.error('获取页面内容失败:', error);
  }
}

// 更新选中文本
function updateSelectedText(text) {
  currentSelectedText = text;
  elements.selectedText.textContent = text;
  // 恢复正常的文本样式
  elements.selectedText.style.color = '';
  elements.selectedText.style.fontStyle = '';
  // 区域现在一直显示，不需要设置display
  
  // 激活翻译按钮状态
  elements.translateBtn.classList.add('active');
  setTimeout(() => {
    elements.translateBtn.classList.remove('active');
  }, 2000);
}

// 处理翻译
async function handleTranslate() {
  if (!currentSelectedText) {
    showStatus('请先选中要翻译的文本', 'warning');
    return;
  }
  
  const apiKey = elements.apiKey.value;
  if (!apiKey) {
    showStatus('请先配置API密钥', 'error');
    return;
  }
  
  const targetLang = elements.targetLang.value;
  
  showLoading(true);
  
  try {
    const messages = [
      {
        role: 'system',
        content: `你是一个专业的翻译助手。请将用户提供的文本翻译成${targetLang}。要求：1. 保持原文的语调和风格 2. 确保翻译准确自然 3. 如果是专业术语，请保持术语的准确性 4. 直接输出翻译结果，不需要额外说明。`
      },
      {
        role: 'user',
        content: `请翻译以下文本：\n\n${currentSelectedText}`
      }
    ];
    
    const result = await callKimiAPI(messages, apiKey);
    displayResult(`🔄 翻译结果\n\n📝 原文：\n${currentSelectedText}\n\n🌐 译文（${targetLang}）：\n${result}`);
    showStatus('翻译完成', 'success');
    
  } catch (error) {
    showStatus(`翻译失败: ${error}`, 'error');
  } finally {
    showLoading(false);
  }
}

// 处理总结
async function handleSummarize() {
  if (!currentPageContent) {
    showStatus('页面内容为空，请刷新页面后重试', 'warning');
    return;
  }
  
  const apiKey = elements.apiKey.value;
  if (!apiKey) {
    showStatus('请先配置API密钥', 'error');
    return;
  }
  
  const summaryLength = elements.summaryLength.value;
  
  showLoading(true);
  
  try {
    let prompt = '';
    switch (summaryLength) {
      case '简短':
        prompt = '请用2-3句话简要总结以下内容的核心要点：';
        break;
      case '详细':
        prompt = '请详细总结以下内容，包括主要观点、关键信息和重要细节：';
        break;
      case '要点':
        prompt = '请以要点列表的形式总结以下内容的关键信息：';
        break;
    }
    
    const messages = [
      {
        role: 'system',
        content: '你是一个专业的内容总结助手。请根据用户要求对提供的内容进行准确、客观的总结。'
      },
      {
        role: 'user',
        content: `${prompt}\n\n${currentPageContent}`
      }
    ];
    
    const result = await callKimiAPI(messages, apiKey);
    displayResult(`📋 页面总结（${summaryLength}）\n\n${result}`);
    showStatus('总结完成', 'success');
    
  } catch (error) {
    showStatus(`总结失败: ${error}`, 'error');
  } finally {
    showLoading(false);
  }
}

// 调用Kimi API
async function callKimiAPI(messages, apiKey) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: 'callKimiAPI',
        messages: messages,
        apiKey: apiKey
      },
      (response) => {
        if (response.success) {
          resolve(response.result);
        } else {
          reject(response.error);
        }
      }
    );
  });
}

// 显示结果
function displayResult(content) {
  elements.resultContainer.innerHTML = `<div class="result-content">${content.replace(/\n/g, '<br>')}</div>`;
  elements.resultActions.style.display = 'flex';
}

// 复制结果
function copyResult() {
  const resultText = elements.resultContainer.textContent;
  navigator.clipboard.writeText(resultText).then(() => {
    showStatus('结果已复制到剪贴板', 'success');
  }).catch(() => {
    showStatus('复制失败', 'error');
  });
}

// 清空选中文本
function clearSelectedText() {
  currentSelectedText = '';
  elements.selectedText.textContent = '暂无选中文本';
  elements.selectedText.style.color = '#999';
  elements.selectedText.style.fontStyle = 'italic';
  // 不再隐藏选中文本区域，保持可见状态
  // elements.selectedTextArea.style.display = 'none';
  
  // 重置按钮状态
  elements.translateBtn.classList.remove('active');
  
  showStatus('已清空选中文本', 'success');
}

// 清空结果
function clearResult() {
  // 清空结果区域
  elements.resultContainer.innerHTML = '<div class="placeholder">选择功能开始使用翻译或总结服务</div>';
  elements.resultActions.style.display = 'none';
  
  // 清空选中文本区域
  currentSelectedText = '';
  elements.selectedText.textContent = '';
  elements.selectedTextArea.style.display = 'none';
  
  // 重置按钮状态
  elements.translateBtn.classList.remove('active');
  
  showStatus('已清空所有内容', 'success');
}

// 保存API密钥
async function saveApiKey() {
  const apiKey = elements.apiKey.value;
  if (!apiKey) {
    showStatus('请输入API密钥', 'warning');
    return;
  }
  
  try {
    await chrome.storage.sync.set({ apiKey });
    showStatus('API密钥已保存', 'success');
  } catch (error) {
    showStatus('保存失败', 'error');
  }
}

// 保存目标语言
async function saveTargetLang() {
  try {
    await chrome.storage.sync.set({ targetLang: elements.targetLang.value });
    showStatus('语言设置已保存', 'success');
  } catch (error) {
    showStatus('保存失败', 'error');
  }
}

// 保存总结长度
async function saveSummaryLength() {
  try {
    await chrome.storage.sync.set({ summaryLength: elements.summaryLength.value });
    showStatus('总结设置已保存', 'success');
  } catch (error) {
    showStatus('保存失败', 'error');
  }
}

// 显示加载状态
function showLoading(show) {
  elements.loading.style.display = show ? 'flex' : 'none';
}

// 显示状态消息
function showStatus(message, type = 'success') {
  elements.status.textContent = message;
  elements.status.className = `status ${type} show`;
  
  setTimeout(() => {
    elements.status.classList.remove('show');
  }, 3000);
} 