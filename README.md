# AI 养生助手小程序

> 食疗保健养生类 AI 小程序，支持智能对话、商品推荐、功能板块

## 功能特性

- 🤖 **AI 智能对话**：GLM-5 驱动，通俗易懂的专业建议
- 🛍️ **商品智能推荐**：关键词匹配，精准推荐养生产品
- 🌸 **24节气养生**：覆盖全年，每个节气都有详细指导
- 🥗 **食疗方案**：10 个常见症状的专业食疗建议
- 🧘 **健康养生操**：八段锦、五禽戏等 8 套传统功法

## 技术栈

### 前端
- 微信小程序原生开发

### 后端
- Node.js + Express
- GLM-5（智谱 AI）

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/YOUR_USERNAME/ai-health-miniprogram.git
cd ai-health-miniprogram
```

### 2. 安装后端依赖

```bash
cd backend
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的 GLM-5 API Key
```

### 4. 启动后端

```bash
npm start
```

后端地址：http://localhost:3000

### 5. 导入小程序

1. 打开微信开发者工具
2. 导入项目：选择 `miniprogram` 目录
3. 填入 AppID
4. 点击"编译"

## 项目结构

```
ai-health-miniprogram/
├── backend/            # 后端服务
│   ├── src/
│   │   ├── data/      # 内容数据（42条）
│   │   ├── routes/    # API 路由
│   │   └── index.js   # 入口文件
│   └── .env           # 配置文件（不上传）
├── miniprogram/        # 小程序前端
│   ├── pages/         # 页面
│   ├── utils/         # 工具函数
│   └── app.json       # 配置文件
└── README.md
```

## API 文档

### AI 对话

```bash
POST /api/chat
Content-Type: application/json

{
  "question": "失眠怎么办？",
  "userId": "user_001"
}
```

### 获取板块列表

```bash
GET /api/boards
```

### 获取板块详情

```bash
GET /api/boards/solar_terms
```

## 内容数据

- **24节气养生**：24 条（立春、雨水、惊蛰...）
- **食疗方案**：10 条（失眠多梦、脾胃虚弱、气血不足...）
- **健康养生操**：8 套（八段锦、五禽戏、太极拳...）

## 开发进度

- [x] AI 对话功能
- [x] 商品推荐功能
- [x] 功能板块内容
- [x] 24节气养生（24条）
- [x] 食疗方案（10条）
- [x] 健康养生操（8套）
- [ ] 数据库集成
- [ ] 流式输出
- [ ] 后台管理系统

## 许可证

MIT

## 作者

CodeLynx 🦞

## 致谢

- [智谱 AI](https://open.bigmodel.cn/) - GLM-5 API
- [微信小程序](https://developers.weixin.qq.com/miniprogram/dev/framework/) - 小程序开发框架
