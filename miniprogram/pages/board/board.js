// pages/board/board.js
const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    board: {},
    qaList: [],
    videoList: [],
    articleList: []
  },

  onLoad(options) {
    const code = options.code;
    if (code) {
      this.loadBoardDetail(code);
    }
  },

  // 加载板块详情
  async loadBoardDetail(code) {
    try {
      util.showLoading('加载中...');
      const board = await api.getBoardDetail(code);
      
      this.setData({ board });

      // 根据类型处理内容
      if (board.type === 'qa') {
        this.processQAContent(board.content);
      } else if (board.type === 'video') {
        this.processVideoContent(board.content);
      } else if (board.type === 'article') {
        this.processArticleContent(board.content);
      }

      util.hideLoading();
    } catch (error) {
      console.error('加载失败:', error);
      util.hideLoading();
      util.showToast('加载失败');
    }
  },

  // 处理 QA 内容
  processQAContent(content) {
    const qaList = [];
    for (const [title, data] of Object.entries(content)) {
      qaList.push({
        title,
        answer: data.answer,
        images: data.images || [],
        expanded: false
      });
    }
    this.setData({ qaList });
  },

  // 处理视频内容
  processVideoContent(content) {
    const videoList = content.videos.map(v => ({
      ...v,
      durationText: this.formatDuration(v.duration)
    }));
    this.setData({ videoList });
  },

  // 处理文章内容
  processArticleContent(content) {
    this.setData({ articleList: content.articles || [] });
  },

  // 格式化时长
  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  },

  // 展开/收起 QA
  toggleQA(e) {
    const index = e.currentTarget.dataset.index;
    const qaList = this.data.qaList;
    qaList[index].expanded = !qaList[index].expanded;
    this.setData({ qaList });
  },

  // 播放视频
  playVideo(e) {
    const url = e.currentTarget.dataset.url;
    // 这里可以跳转到视频播放页或使用 video 组件
    wx.showToast({
      title: '视频播放功能开发中',
      icon: 'none'
    });
  },

  // 跳转到对话页
  goToChat() {
    wx.switchTab({
      url: '/pages/chat/chat'
    });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: `${this.data.board.title} - AI 养生助手`,
      path: `/pages/board/board?code=${this.data.board.code}`
    };
  }
});
