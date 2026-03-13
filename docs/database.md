# 数据库设计文档

## 数据库选择

**云开发数据库（NoSQL）** - JSON 文档型数据库

---

## 集合（表）设计

### 1. users（用户表）

```json
{
  "_id": "user_001",
  "openid": "oXXXX",
  "nickname": "用户昵称",
  "avatarUrl": "https://...",
  "createdAt": "2026-03-13T10:00:00Z",
  "lastActiveAt": "2026-03-13T18:00:00Z",
  "stats": {
    "totalChats": 50,
    "totalProductsClicked": 10
  }
}
```

**字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | String | 用户唯一 ID |
| openid | String | 微信 openid |
| nickname | String | 昵称 |
| avatarUrl | String | 头像 URL |
| createdAt | Date | 创建时间 |
| lastActiveAt | Date | 最后活跃时间 |
| stats | Object | 统计数据 |

**索引**：
- `openid`（唯一索引）

---

### 2. conversations（对话记录表）

```json
{
  "_id": "conv_001",
  "userId": "user_001",
  "sessionId": "session_abc",
  "question": "最近总是失眠怎么办？",
  "answer": "失眠可以尝试以下方法...",
  "images": [
    "cloud://xxx/milk.jpg"
  ],
  "recommendedProducts": [
    "prod_001"
  ],
  "model": "glm-5",
  "tokensUsed": 150,
  "createdAt": "2026-03-13T18:00:00Z",
  "feedback": "good" // good/bad/null
}
```

**字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | String | 对话 ID |
| userId | String | 用户 ID |
| sessionId | String | 会话 ID（多轮对话） |
| question | String | 用户问题 |
| answer | String | AI 回答 |
| images | Array | 图片 URL 列表 |
| recommendedProducts | Array | 推荐商品 ID 列表 |
| model | String | 使用的模型 |
| tokensUsed | Number | 消耗 token 数 |
| createdAt | Date | 创建时间 |
| feedback | String | 用户反馈 |

**索引**：
- `userId` + `createdAt`（复合索引，查询用户历史对话）
- `sessionId`（多轮对话）

---

### 3. products（商品表）

```json
{
  "_id": "prod_001",
  "name": "酸枣仁茶",
  "description": "助眠安神，改善睡眠质量",
  "keywords": ["失眠", "睡眠", "睡不着"],
  "category": "茶饮",
  "price": 39.9,
  "imageUrl": "cloud://xxx/suanzaoren.jpg",
  "miniprogramAppId": "wx123456",
  "pagePath": "pages/product/detail?id=123",
  "isActive": true,
  "clickCount": 100,
  "purchaseCount": 20,
  "createdAt": "2026-03-13T10:00:00Z",
  "updatedAt": "2026-03-13T18:00:00Z"
}
```

**字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | String | 商品 ID |
| name | String | 商品名称 |
| description | String | 商品描述 |
| keywords | Array | 匹配关键词 |
| category | String | 分类 |
| price | Number | 价格 |
| imageUrl | String | 商品图片 |
| miniprogramAppId | String | 目标小程序 AppID |
| pagePath | String | 页面路径 |
| isActive | Boolean | 是否上架 |
| clickCount | Number | 点击次数 |
| purchaseCount | Number | 购买次数 |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

**索引**：
- `keywords`（数组索引，匹配关键词）
- `isActive`（筛选上架商品）

---

### 4. boards（功能板块表）

```json
{
  "_id": "board_001",
  "code": "solar_terms",
  "title": "24节气养生",
  "icon": "cloud://xxx/solar.png",
  "description": "根据节气调整饮食起居",
  "type": "qa", // qa/video/article
  "content": {
    "立春": {
      "answer": "立春时节，阳气初生...",
      "images": ["cloud://xxx/lichun.jpg"]
    },
    "雨水": {
      "answer": "雨水时节，湿气渐重...",
      "images": ["cloud://xxx/yushui.jpg"]
    }
  },
  "sortOrder": 1,
  "isActive": true,
  "createdAt": "2026-03-13T10:00:00Z",
  "updatedAt": "2026-03-13T18:00:00Z"
}
```

**视频类型示例**：

```json
{
  "_id": "board_002",
  "code": "health_exercise",
  "title": "健康养生操",
  "icon": "cloud://xxx/exercise.png",
  "type": "video",
  "content": {
    "videos": [
      {
        "title": "八段锦",
        "description": "传统养生功法",
        "url": "cloud://xxx/baduanjin.mp4",
        "duration": 900
      },
      {
        "title": "五禽戏",
        "description": "模仿动物动作",
        "url": "cloud://xxx/wuqinxi.mp4",
        "duration": 1200
      }
    ]
  }
}
```

**字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | String | 板块 ID |
| code | String | 板块代码（唯一） |
| title | String | 板块标题 |
| icon | String | 图标 URL |
| description | String | 板块描述 |
| type | String | 类型（qa/video/article） |
| content | Object | 内容（根据 type 不同结构不同） |
| sortOrder | Number | 排序权重 |
| isActive | Boolean | 是否启用 |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

**索引**：
- `code`（唯一索引）
- `isActive` + `sortOrder`（复合索引，列表查询）

---

### 5. sensitive_words（敏感词表）

```json
{
  "_id": "word_001",
  "word": "违禁词",
  "category": "medical_ad",
  "level": "high", // high/medium/low
  "action": "block", // block/replace/warn
  "createdAt": "2026-03-13T10:00:00Z"
}
```

**字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | String | 敏感词 ID |
| word | String | 敏感词 |
| category | String | 分类 |
| level | String | 风险等级 |
| action | String | 处理动作 |
| createdAt | Date | 创建时间 |

**索引**：
- `word`（唯一索引）

---

## 数据库初始化脚本

```javascript
// 云函数：initDatabase
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  // 创建集合
  const collections = ['users', 'conversations', 'products', 'boards', 'sensitive_words'];
  
  for (const name of collections) {
    try {
      await db.createCollection(name);
      console.log(`集合 ${name} 创建成功`);
    } catch (err) {
      console.log(`集合 ${name} 已存在`);
    }
  }
  
  // 初始化示例数据
  await db.collection('boards').add({
    data: [
      {
        code: 'solar_terms',
        title: '24节气养生',
        icon: 'cloud://xxx/solar.png',
        type: 'qa',
        content: {},
        sortOrder: 1,
        isActive: true
      }
    ]
  });
  
  return { message: '数据库初始化完成' };
};
```

---

## 数据安全规则

```json
{
  "read": true,
  "write": "doc._openid == auth.openid"
}
```

**说明**：
- 所有用户可读
- 仅数据创建者可写

---

## 备份策略

- **自动备份**：云开发自动每日备份
- **手动导出**：每周导出 JSON 备份到云存储
- **保留周期**：30 天

---

更新时间：2026-03-13
