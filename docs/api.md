# API 设计文档

## 基础信息

- **基础 URL**：云函数调用（无需域名）
- **认证方式**：微信云开发自动鉴权
- **响应格式**：JSON

---

## 1. AI 对话接口

### 接口说明

用户提问 → AI 回答（支持流式输出）

### 云函数路径

```
cloudfunctions/chat
```

### 请求参数

```javascript
wx.cloud.callFunction({
  name: 'chat',
  data: {
    question: '最近总是失眠怎么办？',
    userId: 'user_123',
    sessionId: 'session_abc'
  }
})
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| question | String | ✅ | 用户问题 |
| userId | String | ✅ | 用户 ID |
| sessionId | String | ❌ | 会话 ID（多轮对话用） |

### 响应示例（非流式）

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "answer": "失眠可以尝试以下方法：\n1. 睡前喝杯温牛奶 🥛\n2. 泡个热水脚 🦶\n3. 听听轻音乐 🎵\n\n如果长期失眠，建议咨询医生哦~",
    "images": [
      "cloud://xxx/milk.jpg"
    ],
    "recommendedProducts": [
      {
        "name": "酸枣仁茶",
        "keywords": ["失眠", "睡眠"],
        "miniprogramAppId": "wx123456",
        "pagePath": "pages/product/detail?id=123"
      }
    ]
  }
}
```

### 响应示例（流式 - SSE）

```
data: {"delta": "失眠"}

data: {"delta": "可以"}

data: {"delta": "尝试"}

data: {"delta": "以下方法"}

...

data: [DONE]
```

---

## 2. 商品推荐接口

### 接口说明

根据关键词匹配商品

### 云函数路径

```
cloudfunctions/products
```

### 请求参数

```javascript
wx.cloud.callFunction({
  name: 'products',
  data: {
    action: 'recommend',
    keywords: ['失眠', '睡眠']
  }
})
```

### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "products": [
      {
        "id": "prod_001",
        "name": "酸枣仁茶",
        "description": "助眠安神",
        "price": 39.9,
        "imageUrl": "cloud://xxx/suanzaoren.jpg",
        "miniprogramAppId": "wx123456",
        "pagePath": "pages/product/detail?id=123"
      }
    ]
  }
}
```

---

## 3. 功能板块接口

### 接口说明

获取功能板块列表或详情

### 云函数路径

```
cloudfunctions/boards
```

### 请求参数

```javascript
wx.cloud.callFunction({
  name: 'boards',
  data: {
    action: 'list' // 或 'detail'
  }
})
```

### 响应示例（列表）

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "boards": [
      {
        "id": "solar_terms",
        "title": "24节气养生",
        "icon": "cloud://xxx/solar.png",
        "description": "根据节气调整饮食起居"
      },
      {
        "id": "diet_plan",
        "title": "食疗方案推荐",
        "icon": "cloud://xxx/diet.png",
        "description": "对症食疗，吃出健康"
      }
    ]
  }
}
```

---

## 错误码定义

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 未授权 |
| 2001 | LLM API 调用失败 |
| 2002 | 数据库查询失败 |
| 3001 | 内容违规（敏感词） |

---

## 限流规则

- AI 对话：每用户每分钟 10 次
- 商品推荐：每用户每分钟 20 次
- 功能板块：无限制

---

## 开发注意事项

1. **云函数环境变量**：
   - `GLM_API_KEY`：智谱 AI API Key
   - `GLM_MODEL`：模型名称（glm-5）

2. **敏感词过滤**：
   - 所有用户输入先经过敏感词检测
   - AI 回答后再次检测

3. **降级方案**：
   - LLM API 失败时返回预设答案
   - 超时（>10s）自动降级

---

更新时间：2026-03-13
