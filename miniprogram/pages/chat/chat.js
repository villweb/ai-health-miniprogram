// pages/chat/chat.js
const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    messages: [],
    inputText: '',
    scrollToView: '',
    sending: false
  },

  onLoad(options) {
    // 如果从首页带问题过来
    if (options.question) {
      this.setData({ inputText: options.question });
      this.sendMessage();
    }
  },

  onShow() {
    // 页面显示时滚动到底部
    this.scrollToBottom();
  },

  // 输入框变化
  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  // 发送消息
  async sendMessage() {
    const question = this.data.inputText.trim();
    if (!question || this.data.sending) return;

    // 添加用户消息
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: question
    };

    this.setData({
      messages: [...this.data.messages, userMsg],
      inputText: '',
      sending: true
    });

    this.scrollToBottom();

    try {
      // 调用 AI 接口
      const data = await api.chat(question);
      
      // 添加 AI 消息
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.answer,
        images: data.images || [],
        products: data.recommendedProducts || []
      };

      this.setData({
        messages: [...this.data.messages, aiMsg],
        sending: false
      });

      this.scrollToBottom();

    } catch (error) {
      console.error('对话失败:', error);
      util.showToast('对话失败，请重试');
      this.setData({ sending: false });
    }
  },

  // 快速提问（从首页调用）
  quickAsk(question) {
    this.setData({ inputText: question });
    this.sendMessage();
  },

  // 滚动到底部
  scrollToBottom() {
    const length = this.data.messages.length;
    if (length > 0) {
      this.setData({
        scrollToView: `msg-${length - 1}`
      });
    }
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: [url]
    });
  },

  // 跳转商品
  goToProduct(e) {
    const product = e.currentTarget.dataset.product;
    
    // 记录点击
    api.recordProductClick(product.id);

    // 跳转小程序
    if (product.miniprogramAppId) {
      wx.navigateToMiniProgram({
        appId: product.miniprogramAppId,
        path: product.pagePath,
        success: () => {
          console.log('跳转成功');
        },
        fail: (err) => {
          console.error('跳转失败:', err);
          util.showToast('跳转失败，请稍后重试');
        }
      });
    } else {
      util.showToast('商品链接配置中');
    }
  },

  // 分享
  onShareAppMessage() {
    return {
      title: 'AI 养生助手 - 专业食疗保健建议',
      path: '/pages/index/index'
    };
  }
});
