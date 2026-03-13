# 小程序开发指南

## 项目结构

```
miniprogram/
├── pages/
│   ├── index/          # 首页（功能板块入口）
│   ├── chat/           # AI 对话页
│   └── board/          # 功能板块详情页
├── utils/
│   ├── api.js          # API 封装
│   └── util.js         # 工具函数
├── images/             # 图片资源（需补充）
├── app.js              # 小程序入口
├── app.json            # 全局配置
├── app.wxss            # 全局样式
└── project.config.json # 项目配置
```

---

## 快速开始

### 1. 导入项目

1. 打开微信开发者工具
2. 导入项目：选择 `miniprogram` 目录
3. AppID：`wx6a809f5b29960169`

### 2. 启动后端

```bash
cd backend
npm install
npm run dev
```

后端地址：http://localhost:3000

### 3. 配置本地调试

在微信开发者工具中：
- 详情 → 本地设置 → 勾选"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"

### 4. 开始调试

- 点击"编译"按钮
- 在模拟器中测试功能

---

## 需要补充的资源

### 图片资源

请在 `miniprogram/images/` 目录下添加以下图片：

**Tab 图标**（尺寸：81x81 px）：
- `tab-home.png` - 首页图标（灰色）
- `tab-home-active.png` - 首页图标（绿色）
- `tab-chat.png` - 对话图标（灰色）
- `tab-chat-active.png` - 对话图标（绿色）

**功能图标**：
- `header-bg.png` - 首页背景图
- `ai-icon.png` - AI 图标
- `user-avatar.png` - 用户头像
- `ai-avatar.png` - AI 头像
- `empty-chat.png` - 空对话状态图

**板块图标**（尺寸：200x200 px）：
- `solar.png` - 24节气养生
- `diet.png` - 食疗方案
- `exercise.png` - 健康养生操

**商品占位图**：
- `product-placeholder.png` - 商品占位图
- `video-cover.png` - 视频封面占位图

---

## 测试清单

### 功能测试

- [ ] 首页加载
  - [ ] 功能板块列表显示
  - [ ] 热门问题显示
  - [ ] 点击跳转正常

- [ ] AI 对话
  - [ ] 发送消息
  - [ ] 接收 AI 回答
  - [ ] 商品推荐显示
  - [ ] 滚动到底部

- [ ] 功能板块
  - [ ] 板块详情加载
  - [ ] QA 展开/收起
  - [ ] 视频列表显示

### 接口测试

```bash
# 健康检查
curl http://localhost:3000/health

# AI 对话
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"失眠怎么办？","userId":"test_001"}'

# 获取板块列表
curl http://localhost:3000/api/boards

# 获取板块详情
curl http://localhost:3000/api/boards/solar_terms
```

---

## 下一步优化

### Phase 2（二期）

1. **数据库集成**
   - SQLite 持久化存储
   - 对话记录保存

2. **用户体验优化**
   - 流式输出（打字机效果）
   - 骨架屏加载
   - 下拉刷新
   - 上拉加载更多

3. **功能增强**
   - 多轮对话上下文
   - 图片识别（上传食材图片）
   - 语音输入

4. **后台管理**
   - 内容管理系统
   - 数据统计看板

---

## 常见问题

### 1. 后端接口调用失败

**原因**：未勾选"不校验合法域名"

**解决**：微信开发者工具 → 详情 → 本地设置 → 勾选

### 2. 图片不显示

**原因**：图片资源未添加

**解决**：在 `images/` 目录添加对应图片

### 3. TabBar 不显示

**原因**：图片路径错误或图片不存在

**解决**：检查 `app.json` 中的 tabBar 配置

---

## 联系方式

- 开发者：CodeLynx 🦞
- 创建时间：2026-03-13
