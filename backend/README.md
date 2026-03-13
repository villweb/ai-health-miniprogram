# AI 养生小程序 - 后端服务

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，填入实际配置：

```bash
cp .env.example .env
```

### 3. 启动服务器

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

### 4. 测试接口

```bash
# 健康检查
curl http://localhost:3000/health

# AI 对话
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "最近总是失眠怎么办？",
    "userId": "user_001"
  }'

# 获取板块列表
curl http://localhost:3000/api/boards
```

## API 文档

### 1. AI 对话

**POST** `/api/chat`

请求体：
```json
{
  "question": "最近总是失眠怎么办？",
  "userId": "user_001",
  "sessionId": "session_abc" // 可选
}
```

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "answer": "失眠可以尝试以下方法...",
    "images": [],
    "recommendedProducts": [...]
  }
}
```

### 2. 商品推荐

**POST** `/api/products/recommend`

请求体：
```json
{
  "keywords": ["失眠", "睡眠"]
}
```

### 3. 功能板块

**GET** `/api/boards` - 获取列表

**GET** `/api/boards/:code` - 获取详情

## 目录结构

```
backend/
├── src/
│   ├── index.js          # 入口文件
│   ├── routes/           # 路由
│   │   ├── chat.js       # AI 对话
│   │   ├── products.js   # 商品
│   │   └── boards.js     # 功能板块
│   ├── models/           # 数据模型（后期）
│   └── utils/            # 工具函数（后期）
├── .env                  # 环境变量
├── .env.example          # 环境变量示例
├── package.json
└── README.md
```

## 开发进度

- [x] 项目初始化
- [x] GLM-5 API 集成
- [x] AI 对话接口
- [x] 商品推荐接口（模拟）
- [x] 功能板块接口（模拟）
- [ ] 数据库集成
- [ ] 敏感词过滤
- [ ] 流式输出

## 注意事项

1. **GLM-5 API 限制**
   - QPM（每分钟查询数）：60
   - 并发：10
   - 建议增加限流中间件

2. **错误处理**
   - 所有错误已捕获并返回友好提示
   - 开发环境会返回详细错误信息

3. **降级方案**
   - GLM API 超时或失败时，返回预设答案
   - 确保服务可用性

## 下一步

1. 测试 GLM-5 API 是否正常
2. 启动后端服务
3. 开始小程序前端开发

---

创建时间：2026-03-13
