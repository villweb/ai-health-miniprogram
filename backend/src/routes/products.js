const express = require('express');
const router = express.Router();

/**
 * GET /api/products
 * 获取商品列表
 */
router.get('/', (req, res) => {
  // 模拟数据
  const products = [
    {
      id: 'prod_001',
      name: '酸枣仁茶',
      description: '助眠安神，改善睡眠质量',
      keywords: ['失眠', '睡眠', '睡不着'],
      price: 39.9,
      imageUrl: '',
      miniprogramAppId: '',
      pagePath: ''
    },
    {
      id: 'prod_002',
      name: '枸杞菊花茶',
      description: '清肝明目，缓解疲劳',
      keywords: ['疲劳', '眼睛', '视力'],
      price: 29.9,
      imageUrl: '',
      miniprogramAppId: '',
      pagePath: ''
    }
  ];
  
  res.json({
    code: 0,
    message: 'success',
    data: { products }
  });
});

/**
 * POST /api/products/recommend
 * 根据关键词推荐商品
 */
router.post('/recommend', (req, res) => {
  const { keywords } = req.body;
  
  if (!keywords || !Array.isArray(keywords)) {
    return res.status(400).json({
      code: 1001,
      message: '参数错误：keywords 必须是数组'
    });
  }
  
  // 模拟推荐逻辑
  const products = [
    {
      id: 'prod_001',
      name: '酸枣仁茶',
      description: '助眠安神',
      price: 39.9
    }
  ];
  
  res.json({
    code: 0,
    message: 'success',
    data: { products }
  });
});

/**
 * POST /api/products/click
 * 记录商品点击
 */
router.post('/click', (req, res) => {
  const { productId } = req.body;
  
  console.log(`商品点击: ${productId}`);
  
  res.json({
    code: 0,
    message: '记录成功'
  });
});

module.exports = router;
