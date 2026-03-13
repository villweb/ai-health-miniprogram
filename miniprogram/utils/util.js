// utils/util.js - 工具函数

/**
 * 格式化时间
 */
function formatTime(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`;
}

function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : `0${n}`;
}

/**
 * 防抖函数
 */
function debounce(fn, delay = 500) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 节流函数
 */
function throttle(fn, delay = 500) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

/**
 * 显示加载
 */
function showLoading(title = '加载中...') {
  wx.showLoading({
    title,
    mask: true
  });
}

/**
 * 隐藏加载
 */
function hideLoading() {
  wx.hideLoading();
}

/**
 * 显示提示
 */
function showToast(title, icon = 'none') {
  wx.showToast({
    title,
    icon,
    duration: 2000
  });
}

/**
 * 显示错误
 */
function showError(message) {
  wx.showModal({
    title: '错误',
    content: message,
    showCancel: false
  });
}

/**
 * 检查网络状态
 */
function checkNetwork() {
  return new Promise((resolve, reject) => {
    wx.getNetworkType({
      success: (res) => {
        resolve(res.networkType !== 'none');
      },
      fail: reject
    });
  });
}

module.exports = {
  formatTime,
  formatNumber,
  debounce,
  throttle,
  showLoading,
  hideLoading,
  showToast,
  showError,
  checkNetwork
};
