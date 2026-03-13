# 项目实施计划

## Phase 1：环境准备（Day 1-2）

### 1.1 微信小程序注册

**步骤**：
1. 访问 https://mp.weixin.qq.com/
2. 注册小程序（个人主体）
3. 获取 AppID
4. 下载微信开发者工具

**输出**：
- 小程序 AppID
- 开发者工具安装完成

---

### 1.2 云开发环境初始化

**步骤**：
1. 微信开发者工具 → 云开发控制台
2. 创建云开发环境（选择基础版，免费）
3. 记录环境 ID
4. 开通云函数、数据库、文件存储

**输出**：
- 云开发环境 ID
- 数据库集合创建完成

---

### 1.3 GLM-5 API Key 申请

**步骤**：
1. 访问 https://open.bigmodel.cn/
2. 注册账号（手机号）
3. 实名认证
4. 创建应用
5. 获取 API Key

**输出**：
- GLM-5 API Key
- 测试调用成功

**测试代码**：
```javascript
// 云函数：testGLM
const axios = require('axios');

exports.main = async (event, context) => {
  const response = await axios.post(
    'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    {
      model: 'glm-5',
      messages: [
        { role: 'user', content: '你好' }
      ]
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.GLM_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
};
```

---

## Phase 2：云函数开发（Day 3-5）

### 2.1 chat 云函数（AI 对话）

**功能**：
- 接收用户问题
- 调用 GLM-5 API
- 返回 AI 回答
- 支持流式输出（可选）

**代码框架**：
```javascript
// cloudfunctions/chat/index.js
const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init();

const db = cloud.database();

exports.main = async (event, context) => {
  const { question, userId } = event;
  
  // 1. 敏感词检测
  const sensitiveWords = await checkSensitiveWords(question);
  if (sensitiveWords.length > 0) {
    return {
      code: 3001,
      message: '内容包含敏感词'
    };
  }
  
  // 2. 调用 GLM-5
  const glmResponse = await callGLM(question);
  
  // 3. 提取商品关键词
  const keywords = extractKeywords(question);
  
  // 4. 匹配商品
  const products = await matchProducts(keywords);
  
  // 5. 保存对话记录
  await db.collection('conversations').add({
    data: {
      userId,
      question,
      answer: glmResponse.content,
      recommendedProducts: products.map(p => p._id),
      model: 'glm-5',
      createdAt: new Date()
    }
  });
  
  // 6. 返回结果
  return {
    code: 0,
    data: {
      answer: glmResponse.content,
      images: [], // 后期优化
      recommendedProducts: products
    }
  };
};

async function callGLM(question) {
  const response = await axios.post(
    'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    {
      model: 'glm-5',
      messages: [
        {
          role: 'system',
          content: '你是一位专业的食疗保健养生专家，用通俗易懂的语言解答问题。'
        },
        { role: 'user', content: question }
      ],
      temperature: 0.7,
      max_tokens: 500
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.GLM_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data.choices[0].message;
}

async function matchProducts(keywords) {
  const db = cloud.database();
  const _ = db.command;
  
  const result = await db.collection('products')
    .where({
      keywords: _.in(keywords),
      isActive: true
    })
    .limit(3)
    .get();
  
  return result.data;
}
```

**部署**：
```bash
# 在 cloudfunctions/chat 目录
npm install
# 右键上传并部署：云端安装依赖
```

---

### 2.2 boards 云函数（功能板块）

**功能**：
- 获取板块列表
- 获取板块详情

**代码框架**：
```javascript
// cloudfunctions/boards/index.js
const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database();

exports.main = async (event, context) => {
  const { action, boardCode } = event;
  
  if (action === 'list') {
    return await getBoardList();
  } else if (action === 'detail') {
    return await getBoardDetail(boardCode);
  }
};

async function getBoardList() {
  const result = await db.collection('boards')
    .where({ isActive: true })
    .orderBy('sortOrder', 'asc')
    .get();
  
  return {
    code: 0,
    data: { boards: result.data }
  };
}

async function getBoardDetail(boardCode) {
  const result = await db.collection('boards')
    .where({ code: boardCode, isActive: true })
    .get();
  
  return {
    code: 0,
    data: result.data[0]
  };
}
```

---

### 2.3 products 云函数（商品推荐）

**功能**：
- 根据关键词推荐商品
- 记录点击行为

**代码框架**：
```javascript
// cloudfunctions/products/index.js
const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database();

exports.main = async (event, context) => {
  const { action, keywords, productId } = event;
  
  if (action === 'recommend') {
    return await recommendProducts(keywords);
  } else if (action === 'click') {
    return await recordClick(productId);
  }
};

async function recommendProducts(keywords) {
  const _ = db.command;
  
  const result = await db.collection('products')
    .where({
      keywords: _.in(keywords),
      isActive: true
    })
    .limit(5)
    .get();
  
  return {
    code: 0,
    data: { products: result.data }
  };
}

async function recordClick(productId) {
  await db.collection('products')
    .doc(productId)
    .update({
      data: {
        clickCount: db.command.inc(1)
      }
    });
  
  return { code: 0, message: '记录成功' };
}
```

---

## Phase 3：前端开发（Day 6-9）

### 3.1 小程序基础框架

**app.json**：
```json
{
  "pages": [
    "pages/index/index",
    "pages/chat/chat",
    "pages/board/board"
  ],
  "window": {
    "navigationBarTitleText": "AI 养生助手",
    "navigationBarBackgroundColor": "#4CAF50",
    "navigationBarTextStyle": "white"
  },
  "tabBar": {
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "images/home.png",
        "selectedIconPath": "images/home-active.png"
      },
      {
        "pagePath": "pages/chat/chat",
        "text": "对话",
        "iconPath": "images/chat.png",
        "selectedIconPath": "images/chat-active.png"
      }
    ]
  },
  "cloud": true
}
```

---

### 3.2 首页（功能板块入口）

**pages/index/index.wxml**：
```xml
<view class="container">
  <view class="header">
    <text class="title">AI 养生助手</text>
    <text class="subtitle">专业食疗保健建议</text>
  </view>
  
  <view class="boards">
    <view 
      class="board-item" 
      wx:for="{{boards}}" 
      wx:key="_id"
      bindtap="goToBoard"
      data-code="{{item.code}}"
    >
      <image src="{{item.icon}}" class="board-icon" />
      <text class="board-title">{{item.title}}</text>
      <text class="board-desc">{{item.description}}</text>
    </view>
  </view>
  
  <view class="quick-chat" bindtap="goToChat">
    <text>立即咨询 AI 专家</text>
  </view>
</view>
```

**pages/index/index.js**：
```javascript
Page({
  data: {
    boards: []
  },
  
  onLoad() {
    this.loadBoards();
  },
  
  async loadBoards() {
    const res = await wx.cloud.callFunction({
      name: 'boards',
      data: { action: 'list' }
    });
    
    this.setData({
      boards: res.result.data.boards
    });
  },
  
  goToBoard(e) {
    const code = e.currentTarget.dataset.code;
    wx.navigateTo({
      url: `/pages/board/board?code=${code}`
    });
  },
  
  goToChat() {
    wx.navigateTo({
      url: '/pages/chat/chat'
    });
  }
});
```

---

### 3.3 对话页

**pages/chat/chat.wxml**：
```xml
<view class="container">
  <scroll-view 
    class="message-list" 
    scroll-y 
    scroll-into-view="{{scrollToView}}"
  >
    <view 
      wx:for="{{messages}}" 
      wx:key="id"
      id="msg-{{index}}"
    >
      <!-- 用户消息 -->
      <view class="msg-user" wx:if="{{item.role === 'user'}}">
        <text>{{item.content}}</text>
      </view>
      
      <!-- AI 消息 -->
      <view class="msg-ai" wx:else>
        <text>{{item.content}}</text>
        
        <!-- 商品推荐 -->
        <view class="products" wx:if="{{item.products.length > 0}}">
          <view 
            class="product-card"
            wx:for="{{item.products}}"
            wx:for-item="product"
            wx:key="_id"
            bindtap="goToProduct"
            data-product="{{product}}"
          >
            <image src="{{product.imageUrl}}" />
            <text class="product-name">{{product.name}}</text>
            <text class="product-price">¥{{product.price}}</text>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
  
  <view class="input-area">
    <input 
      bindconfirm="sendMessage"
      bindinput="onInput"
      value="{{inputText}}"
      placeholder="输入您的问题..."
      confirm-type="send"
    />
    <button bindtap="sendMessage">发送</button>
  </view>
</view>
```

**pages/chat/chat.js**：
```javascript
Page({
  data: {
    messages: [],
    inputText: '',
    scrollToView: ''
  },
  
  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },
  
  async sendMessage() {
    const question = this.data.inputText.trim();
    if (!question) return;
    
    // 添加用户消息
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: question
    };
    
    this.setData({
      messages: [...this.data.messages, userMsg],
      inputText: ''
    });
    
    // 调用云函数
    wx.showLoading({ title: '思考中...' });
    
    const res = await wx.cloud.callFunction({
      name: 'chat',
      data: {
        question,
        userId: 'user_001' // 实际从全局获取
      }
    });
    
    wx.hideLoading();
    
    // 添加 AI 消息
    const aiMsg = {
      id: Date.now() + 1,
      role: 'assistant',
      content: res.result.data.answer,
      products: res.result.data.recommendedProducts
    };
    
    this.setData({
      messages: [...this.data.messages, aiMsg],
      scrollToView: `msg-${this.data.messages.length}`
    });
  },
  
  goToProduct(e) {
    const product = e.currentTarget.dataset.product;
    
    // 跳转其他小程序（AppID 后期配置）
    if (product.miniprogramAppId) {
      wx.navigateToMiniProgram({
        appId: product.miniprogramAppId,
        path: product.pagePath
      });
    } else {
      wx.showToast({
        title: '商品链接配置中',
        icon: 'none'
      });
    }
  }
});
```

---

## Phase 4：测试与优化（Day 10-12）

### 4.1 功能测试

**测试清单**：
- [ ] AI 对话功能
  - [ ] 正常问题回答
  - [ ] 敏感词拦截
  - [ ] 商品推荐展示
  - [ ] 对话记录保存
- [ ] 功能板块
  - [ ] 板块列表加载
  - [ ] 板块详情展示
  - [ ] 视频播放
- [ ] 商品跳转
  - [ ] 预留按钮正常
  - [ ] 后期 AppID 配置

---

### 4.2 性能优化

**优化点**：
1. **图片懒加载**
2. **云函数缓存**
3. **对话历史分页加载**
4. **骨架屏占位**

---

### 4.3 用户体验优化

**优化点**：
1. **打字机效果**（流式输出）
2. **加载动画**
3. **错误提示友好**
4. **空状态设计**

---

## Phase 5：提审上线（Day 13-14）

### 5.1 提审准备

**材料清单**：
- [ ] 小程序类目选择（生活服务 - 健康咨询）
- [ ] 隐私协议
- [ ] 用户协议
- [ ] 免责声明

**注意事项**：
- ⚠️ 个人主体无法选择"医疗保健"类目
- ⚠️ 必须在显著位置标注"仅供参考"
- ⚠️ 不能出现具体药品名称

---

### 5.2 提审流程

1. 上传代码
2. 设置体验版
3. 提交审核
4. 等待审核（通常 1-3 天）
5. 审核通过后发布

---

## Phase 6：二期规划

### 6.1 后台管理系统

**功能**：
- 内容管理（板块、问答）
- 商品管理
- 数据分析

**技术栈**：
- 前端：Vue 3 + Element Plus
- 后端：云函数 HTTP 触发

---

### 6.2 高级功能

- 多轮对话上下文
- RAG 知识库
- 用户中心
- 分享裂变

---

## 开发进度跟踪

| 阶段 | 开始时间 | 结束时间 | 状态 |
|------|---------|---------|------|
| 环境准备 | - | - | ⏳ 等待材料 |
| 云函数开发 | - | - | 🔜 未开始 |
| 前端开发 | - | - | 🔜 未开始 |
| 测试优化 | - | - | 🔜 未开始 |
| 提审上线 | - | - | 🔜 未开始 |

---

**下一步行动**：
1. 提供 GLM-5 API Key
2. 提供小程序 AppID
3. 提供云开发环境 ID
4. 开始 Phase 1 🚀

---

更新时间：2026-03-13
