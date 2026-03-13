// pages/index/index.js - 修复版（添加 iconText）
const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    boards: [],
    hotQuestions: [
      '最近总是失眠怎么办？',
      '胃不舒服吃什么好？',
      '感觉特别疲劳怎么办？',
      '如何提高免疫力？',
      '春季养生吃什么？'
    ]
  },

  onLoad() {
    this.loadBoards();
  },

  onShow() {
    // 每次显示页面时刷新数据
  },

  // 加载功能板块
  async loadBoards() {
    try {
      const data = await api.getBoards();
      
      // 为每个板块添加图标文字
      const boards = data.boards.map(board => {
        let iconText = '📋';
        if (board.code === 'solar_terms') iconText = '☀️';
        if (board.code === 'diet_plan') iconText = '🥗';
        if (board.code === 'health_exercise') iconText = '🧘';
        
        return {
          ...board,
          iconText
        };
      });
      
      this.setData({ boards });
    } catch (error) {
      console.error('加载板块失败:', error);
      util.showToast('加载失败，请重试');
    }
  },

  // 跳转到对话页
  goToChat() {
    wx.switchTab({
      url: '/pages/chat/chat'
    });
  },

  // 跳转到板块详情
  goToBoard(e) {
    const code = e.currentTarget.dataset.code;
    wx.navigateTo({
      url: `/pages/board/board?code=${code}`
    });
  },

  // 快速提问
  askQuestion(e) {
    const question = e.currentTarget.dataset.question;
    wx.switchTab({
      url: '/pages/chat/chat',
      success: () => {
        // 传递问题到对话页
        const pages = getCurrentPages();
        const chatPage = pages.find(p => p.route === 'pages/chat/chat');
        if (chatPage) {
          chatPage.quickAsk(question);
        }
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadBoards().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});
