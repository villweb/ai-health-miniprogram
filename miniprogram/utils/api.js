// utils/api.js - API 封装（支持流式输出）

const app = getApp();

/**
 * 通用请求封装
 */
function request(url, method = 'GET', data = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.apiBaseUrl}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'userId': app.globalData.userId
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || '请求失败'));
        }
      },
      fail: (err) => {
        console.error('API Error:', err);
        reject(new Error('网络请求失败'));
      }
    });
  });
}

/**
 * AI 对话（非流式）
 */
function chat(question) {
  return request('/chat', 'POST', {
    question,
    userId: app.globalData.userId
  });
}

/**
 * AI 对话（流式输出）
 * @param {string} question - 问题
 * @param {function} onMessage - 接收到消息的回调
 * @param {function} onDone - 完成的回调
 * @param {function} onError - 错误的回调
 */
function chatStream(question, onMessage, onDone, onError) {
  const requestTask = wx.request({
    url: `${app.globalData.apiBaseUrl}/chat/stream`,
    method: 'POST',
    data: {
      question,
      userId: app.globalData.userId
    },
    header: {
      'Content-Type': 'application/json',
      'userId': app.globalData.userId
    },
    enableChunked: true, // 启用分块传输
    success: (res) => {
      if (res.statusCode === 200) {
        // 解析 SSE 数据
        const lines = res.data.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            
            if (data === '[DONE]') {
              onDone && onDone();
              break;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                onMessage && onMessage(parsed.content);
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      } else {
        onError && onError(new Error('请求失败'));
      }
    },
    fail: (err) => {
      console.error('Stream error:', err);
      onError && onError(err);
    }
  });
  
  return requestTask;
}

/**
 * 获取功能板块列表
 */
function getBoards() {
  return request('/boards');
}

/**
 * 获取板块详情
 */
function getBoardDetail(code) {
  return request(`/boards/${code}`);
}

/**
 * 获取商品列表
 */
function getProducts() {
  return request('/products');
}

/**
 * 商品推荐
 */
function recommendProducts(keywords) {
  return request('/products/recommend', 'POST', { keywords });
}

/**
 * 记录商品点击
 */
function recordProductClick(productId) {
  return request('/products/click', 'POST', { productId });
}

module.exports = {
  request,
  chat,
  chatStream,
  getBoards,
  getBoardDetail,
  getProducts,
  recommendProducts,
  recordProductClick
};
