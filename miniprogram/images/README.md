# 图片资源清单

本目录存放小程序所需的图片资源。

## TabBar 图标（必须）

**尺寸要求**：81x81 px
**格式**：PNG（支持透明）

- `tab-home.png` - 首页图标（灰色，#999999）
- `tab-home-active.png` - 首页图标（绿色，#4CAF50）
- `tab-chat.png` - 对话图标（灰色，#999999）
- `tab-chat-active.png` - 对话图标（绿色，#4CAF50）

## 页面图标

- `header-bg.png` - 首页背景图（可选，建议 750x400 px）
- `ai-icon.png` - AI 图标（建议 160x160 px）
- `user-avatar.png` - 用户默认头像（建议 140x140 px）
- `ai-avatar.png` - AI 头像（建议 140x140 px）
- `empty-chat.png` - 空对话状态图（建议 600x600 px）

## 功能板块图标

**尺寸要求**：200x200 px
**格式**：PNG

- `solar.png` - 24节气养生图标
- `diet.png` - 食疗方案图标
- `exercise.png` - 健康养生操图标

## 商品相关

- `product-placeholder.png` - 商品占位图（建议 240x240 px）
- `video-cover.png` - 视频封面占位图（建议 480x320 px）

---

## 快速获取图标

可以使用以下方式获取图标：

1. **阿里巴巴矢量图标库**：https://www.iconfont.cn/
2. **Flaticon**：https://www.flaticon.com/
3. **Icons8**：https://icons8.com/

搜索关键词：
- 养生、健康、中医
- 对话、聊天、咨询
- 节气、食疗、运动

---

## 临时方案

如果暂时没有图片，可以：

1. 使用纯色占位图
2. 使用 emoji 代替
3. 使用文字图标

示例代码（app.json）：
```json
{
  "tabBar": {
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页"
      },
      {
        "pagePath": "pages/chat/chat",
        "text": "咨询"
      }
    ]
  }
}
```

暂时不配置 iconPath，小程序会显示默认样式。

---

更新时间：2026-03-13
