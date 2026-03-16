/**
 * AI 对话优化 - 小程序前端
 * 优化点：
 * 1. 展示图片
 * 2. 商品卡片展示
 * 3. 小程序跳转
 */

// pages/chat/chat.js
Page({
  data: {
    messages: [], // 消息列表
    inputValue: '', // 输入框内容
    loading: false, // 加载状态
    scrollTop: 0 // 滚动位置
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 可以从参数获取初始问题
    if (options.question) {
      this.sendQuestion(options.question);
    }
  },

  /**
   * 输入框内容变化
   */
  onInputChange(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  /**
   * 发送问题
   */
  async sendQuestion(question) {
    const input = question || this.data.inputValue.trim();
    
    if (!input) {
      wx.showToast({
        title: '请输入问题',
        icon: 'none'
      });
      return;
    }

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString()
    };

    this.setData({
      messages: [...this.data.messages, userMessage],
      inputValue: '',
      loading: true
    });

    // 滚动到底部
    this.scrollToBottom();

    try {
      // 调用后端 API
      const res = await wx.request({
        url: 'https://your-backend.com/api/chat',
        method: 'POST',
        data: {
          question: input,
          userId: wx.getStorageSync('userId') || 'anonymous'
        }
      });

      if (res.data.success) {
        const { answer, images, products } = res.data.data;

        // 添加 AI 回复消息
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: answer,
          images: images || [],
          products: products || [],
          timestamp: new Date().toLocaleTimeString()
        };

        this.setData({
          messages: [...this.data.messages, aiMessage],
          loading: false
        });

        this.scrollToBottom();
      } else {
        throw new Error(res.data.message);
      }
    } catch (error) {
      console.error('发送失败:', error);
      
      // 添加错误消息
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: '抱歉，服务暂时不可用，请稍后再试',
        timestamp: new Date().toLocaleTimeString()
      };

      this.setData({
        messages: [...this.data.messages, errorMessage],
        loading: false
      });
    }
  },

  /**
   * 预览图片
   */
  previewImage(e) {
    const { url } = e.currentTarget.dataset;
    wx.previewImage({
      current: url,
      urls: [url]
    });
  },

  /**
   * 点击商品卡片 - 跳转到商品小程序
   */
  goToProduct(e) {
    const { product } = e.currentTarget.dataset;
    
    wx.navigateToMiniProgram({
      appId: product.appId, // 商品小程序 AppID
      path: product.path, // 商品详情页路径
      success: (res) => {
        console.log('跳转成功:', product.name);
        
        // 可以记录用户点击行为
        this.trackProductClick(product);
      },
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.showToast({
          title: '跳转失败，请稍后再试',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 记录商品点击（可选）
   */
  trackProductClick(product) {
    wx.request({
      url: 'https://your-backend.com/api/track/click',
      method: 'POST',
      data: {
        productId: product.id,
        productName: product.name,
        userId: wx.getStorageSync('userId') || 'anonymous',
        timestamp: new Date().toISOString()
      }
    });
  },

  /**
   * 滚动到底部
   */
  scrollToBottom() {
    wx.createSelectorQuery()
      .select('.message-list')
      .boundingClientRect((rect) => {
        if (rect) {
          this.setData({
            scrollTop: rect.height
          });
        }
      })
      .exec();
  },

  /**
   * 复制消息内容
   */
  copyMessage(e) {
    const { content } = e.currentTarget.dataset;
    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({
          title: '已复制',
          icon: 'success'
        });
      }
    });
  }
});
