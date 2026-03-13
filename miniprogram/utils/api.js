// utils/api.js - API 封装

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
 * AI 对话
 */
function chat(question) {
  return request('/chat', 'POST', {
    question,
    userId: app.globalData.userId
  });
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
  getBoards,
  getBoardDetail,
  getProducts,
  recommendProducts,
  recordProductClick
};
