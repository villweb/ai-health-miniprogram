/**
 * AI 对话优化 - 后端路由
 * 优化点：
 * 1. 更好的 Prompt
 * 2. 图片支持
 * 3. 商品智能推荐
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');

// GLM-5 API 配置
const GLM_API_URL = 'https://open.bigmodel.cn/api/paas/v3/model-api/chatglm_pro/invoke';
const GLM_API_KEY = process.env.GLM_API_KEY;

// 图片库（示例，实际需要配置图片服务器）
const IMAGE_LIBRARY = {
  // 穴位图
  '神门穴': 'https://your-cdn.com/acupoints/shenmen.jpg',
  '足三里': 'https://your-cdn.com/acupoints/zusanli.jpg',
  '合谷穴': 'https://your-cdn.com/acupoints/hegu.jpg',
  
  // 食材图
  '酸枣仁': 'https://your-cdn.com/ingredients/suanzaoren.jpg',
  '百合': 'https://your-cdn.com/ingredients/baihe.jpg',
  '枸杞': 'https://your-cdn.com/ingredients/gouqi.jpg',
  
  // 养生操
  '八段锦': 'https://your-cdn.com/exercise/baduanjin.jpg',
  '五禽戏': 'https://your-cdn.com/exercise/wuqinxi.jpg',
};

// 商品库（示例）
const PRODUCT_LIBRARY = [
  {
    id: 1,
    name: '酸枣仁茶',
    keywords: ['失眠', '安神', '睡不着'],
    price: 39.9,
    image: 'https://your-cdn.com/products/suanzaoren-tea.jpg',
    appId: 'wx1234567890', // 商品小程序 AppID
    path: '/pages/product/detail?id=1'
  },
  {
    id: 2,
    name: '健脾养胃丸',
    keywords: ['脾胃虚弱', '消化不良', '胃胀'],
    price: 59.9,
    image: 'https://your-cdn.com/products/jianpi-pill.jpg',
    appId: 'wx1234567890',
    path: '/pages/product/detail?id=2'
  },
  {
    id: 3,
    name: '八段锦教学视频',
    keywords: ['八段锦', '养生操', '运动'],
    price: 19.9,
    image: 'https://your-cdn.com/products/baduanjin-video.jpg',
    appId: 'wx1234567890',
    path: '/pages/product/detail?id=3'
  }
];

/**
 * 优化的 System Prompt
 */
function getSystemPrompt() {
  return `你是一位资深中医养生专家，拥有 20 年临床经验，擅长食疗保健养生。

## 回答风格
- 用大白话解释专业术语，让老百姓听得懂
- 回答精准全面，但不要过于官方腔
- 像朋友聊天一样亲切自然
- 提供具体可执行的建议，不要空话套话

## 回答结构
1. **直接回答**：先用一句话说清楚问题
2. **详细解释**：再展开说明原因和原理
3. **实用建议**：给出 2-3 个具体可操作的方法
4. **注意事项**：如果有禁忌或需要注意的点，最后提醒

## 专业领域
- 食疗养生（体质调理、四季养生）
- 常见症状调理（失眠、脾胃虚弱、气血不足等）
- 传统功法（八段锦、五禽戏、太极拳）
- 24 节气养生

## 重要提示
- 如果用户问的是严重疾病，提醒用户及时就医
- 不要给出具体的药物剂量建议
- 强调养生调理需要坚持，不是一蹴而就的`;
}

/**
 * 从回答中提取需要配图的关键词
 */
function extractImageKeywords(answer) {
  const keywords = [];
  
  // 检查穴位
  const acupoints = ['神门穴', '足三里', '合谷穴', '三阴交', '涌泉穴'];
  acupoints.forEach(point => {
    if (answer.includes(point) && IMAGE_LIBRARY[point]) {
      keywords.push({
        keyword: point,
        url: IMAGE_LIBRARY[point],
        type: 'acupoint'
      });
    }
  });
  
  // 检查食材
  const ingredients = ['酸枣仁', '百合', '枸杞', '红枣', '生姜'];
  ingredients.forEach(item => {
    if (answer.includes(item) && IMAGE_LIBRARY[item]) {
      keywords.push({
        keyword: item,
        url: IMAGE_LIBRARY[item],
        type: 'ingredient'
      });
    }
  });
  
  // 检查养生操
  const exercises = ['八段锦', '五禽戏', '太极拳'];
  exercises.forEach(exercise => {
    if (answer.includes(exercise) && IMAGE_LIBRARY[exercise]) {
      keywords.push({
        keyword: exercise,
        url: IMAGE_LIBRARY[exercise],
        type: 'exercise'
      });
    }
  });
  
  return keywords.slice(0, 2); // 最多返回 2 张图片
}

/**
 * 智能匹配商品
 */
function matchProducts(question, answer) {
  const matchedProducts = [];
  
  PRODUCT_LIBRARY.forEach(product => {
    // 检查问题中是否包含商品关键词
    const hasKeywordInQuestion = product.keywords.some(keyword => 
      question.includes(keyword)
    );
    
    // 检查回答中是否提到商品名
    const hasProductInAnswer = answer.includes(product.name);
    
    if (hasKeywordInQuestion || hasProductInAnswer) {
      matchedProducts.push(product);
    }
  });
  
  return matchedProducts.slice(0, 2); // 最多推荐 2 个商品
}

/**
 * AI 对话接口（优化版）
 * POST /api/chat
 */
router.post('/', async (req, res) => {
  try {
    const { question, userId } = req.body;
    
    if (!question) {
      return res.status(400).json({ 
        success: false, 
        message: '请输入问题' 
      });
    }
    
    console.log(`[Chat] 用户 ${userId} 提问: ${question}`);
    
    // 调用 GLM-5 API
    const response = await axios.post(
      GLM_API_URL,
      {
        prompt: `${getSystemPrompt()}\n\n用户问：${question}\n\n请用通俗易懂的语言回答：`,
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${GLM_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const answer = response.data.data?.choices?.[0]?.content || '抱歉，我暂时无法回答这个问题。';
    
    // 提取配图关键词
    const imageKeywords = extractImageKeywords(answer);
    const images = imageKeywords.map(item => ({
      url: item.url,
      caption: `${item.keyword}示意图`,
      type: item.type
    }));
    
    // 智能匹配商品
    const products = matchProducts(question, answer);
    
    // 返回优化后的结果
    const result = {
      success: true,
      data: {
        answer: answer,
        images: images,
        products: products,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log(`[Chat] 回答成功，配图 ${images.length} 张，推荐商品 ${products.length} 个`);
    res.json(result);
    
  } catch (error) {
    console.error('[Chat] 错误:', error.message);
    res.status(500).json({ 
      success: false, 
      message: '服务暂时不可用，请稍后再试' 
    });
  }
});

module.exports = router;
