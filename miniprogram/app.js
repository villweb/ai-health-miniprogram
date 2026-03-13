// app.js
App({
  globalData: {
    // 后端 API 地址（本地开发）
    apiBaseUrl: 'http://localhost:3000/api',
    userInfo: null,
    userId: null
  },

  onLaunch() {
    // 初始化用户 ID
    this.initUserId();
    
    // 检查登录状态
    this.checkLoginStatus();
  },

  initUserId() {
    // 从本地存储获取或生成用户 ID
    let userId = wx.getStorageSync('userId');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      wx.setStorageSync('userId', userId);
    }
    this.globalData.userId = userId;
  },

  checkLoginStatus() {
    // 检查是否已登录
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }
  },

  // 用户登录
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            // 发送 code 到后端换取 openid
            // 这里暂时用本地生成的 userId
            resolve(res.code);
          } else {
            reject(new Error('登录失败'));
          }
        },
        fail: reject
      });
    });
  },

  // 获取用户信息
  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          this.globalData.userInfo = res.userInfo;
          wx.setStorageSync('userInfo', res.userInfo);
          resolve(res.userInfo);
        },
        fail: reject
      });
    });
  }
});
