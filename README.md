# 🧩 Chrome翻译总结助手

基于Kimi API的Chrome浏览器扩展，提供网页内容翻译和总结功能。

## 功能展示
<img width="3809" height="1779" alt="image" src="https://github.com/user-attachments/assets/b0d40e69-3c64-4064-bbb6-db5494de44e7" />
<img width="3836" height="1706" alt="image" src="https://github.com/user-attachments/assets/93aa30e5-7e5a-44de-baea-02211615da1e" />


## ✨ 功能特性

- **🔄 智能翻译**：选中页面文本，一键翻译成多种语言
- **📋 页面总结**：自动提取页面内容，生成智能总结
- **🎯 侧边栏界面**：美观简洁的侧边栏操作面板
- **⚙️ 个性化设置**：支持自定义翻译语言和总结长度
- **🔒 安全可靠**：本地存储API密钥，数据安全有保障

## 🚀 安装说明

### 1. 获取代码
```bash
git clone [项目地址]
cd 插件
```

### 2. 配置API密钥
1. 注册并获取 [Kimi API](https://platform.moonshot.cn/) 密钥
2. 在插件设置中输入API密钥

### 3. 安装到Chrome
1. 打开Chrome浏览器，进入 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择插件文件夹

## 📖 使用指南

### 翻译功能
1. 在任意网页中选中要翻译的文本
2. 点击Chrome工具栏中的插件图标打开侧边栏
3. 点击"翻译"按钮
4. 查看翻译结果

### 总结功能
1. 在需要总结的网页上点击插件图标
2. 点击"总结"按钮
3. 等待AI处理，查看页面总结

### 设置配置
- **API密钥**：输入您的Kimi API密钥
- **翻译语言**：选择目标翻译语言
- **总结长度**：选择总结的详细程度

## 🛠️ 技术栈

- **Chrome Extension Manifest V3**
- **原生JavaScript/CSS/HTML**
- **Kimi API集成**
- **Chrome Side Panel API**

## 📁 项目结构

```
插件/
├── manifest.json          # 扩展配置文件
├── background.js           # 后台脚本
├── content.js             # 内容脚本
├── sidepanel.html         # 侧边栏页面
├── sidepanel.css          # 侧边栏样式
├── sidepanel.js           # 侧边栏逻辑
├── icons/                 # 图标文件夹
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── README.md              # 项目说明
└── UI示意图.md            # 界面设计图
```

## 🔧 开发说明

### 核心文件说明

- `manifest.json`: 定义扩展权限和配置
- `background.js`: 处理API调用和消息传递
- `content.js`: 监听页面文本选择和内容提取
- `sidepanel.*`: 侧边栏界面的HTML、CSS和JavaScript

### API调用流程

1. 用户操作触发功能（翻译/总结）
2. 侧边栏发送请求到后台脚本
3. 后台脚本调用Kimi API
4. 返回结果并显示在侧边栏

## 🐛 常见问题

### Q: 翻译或总结功能不工作？
A: 请检查：
- API密钥是否正确配置
- 网络连接是否正常
- 页面内容是否可访问

### Q: 侧边栏无法打开？
A: 请确保：
- 扩展已正确安装
- Chrome版本支持Side Panel API（建议Chrome 114+）

### Q: 选中文本后没有反应？
A: 可能原因：
- 文本选择太短（少于3个字符）
- 页面使用了特殊的文本选择限制

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📞 支持

如有问题或建议，请创建Issue或联系开发者。 
