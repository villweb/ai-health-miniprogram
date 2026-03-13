const express = require('express');
const router = express.Router();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /api/chat
 * AI 对话接口
 * 
 * Body: { question, userId, sessionId }
 * Response: { code, message, data: { answer, images, recommendedProducts } }
 */
router.post('/', async (req, res) => {
  try {
    const { question, userId, sessionId } = req.body;
    
    // 参数验证
    if (!question || !userId) {
      return res.status(400).json({
        code: 1001,
        message: '参数错误：缺少 question 或 userId'
      });
    }
    
    console.log(`[${new Date().toISOString()}] 用户 ${userId} 提问: ${question}`);
    
    // 调用 GLM-5 API
    const glmResponse = await callGLM(question);
    
    // 提取关键词（简化版，后期优化）
    const keywords = extractKeywords(question);
    
    // 匹配商品（模拟数据）
    const products = await matchProducts(keywords);
    
    // 返回结果
    res.json({
      code: 0,
      message: 'success',
      data: {
        answer: glmResponse,
        images: [],
        recommendedProducts: products
      }
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      code: 2001,
      message: 'AI 对话失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * 调用 GLM-5 API
 */
async function callGLM(question) {
  const apiKey = process.env.GLM_API_KEY;
  const apiUrl = process.env.GLM_API_URL;
  
  if (!apiKey || !apiUrl) {
    throw new Error('GLM API 配置缺失');
  }
  
  try {
    const response = await axios.post(
      apiUrl,
      {
        model: 'glm-5',
        messages: [
          {
            role: 'system',
            content: `你是一位专业的食疗保健养生专家，擅长用通俗易懂的语言解答问题。

要求：
1. 回答精准全面，避免官话套话
2. 使用日常语言，像朋友聊天一样
3. 适当使用表情符号增加亲和力
4. 回答长度控制在 200-500 字
5. 如果涉及食疗建议，要具体到食材和做法
6. 必须标注"仅供参考，不替代医疗建议"`
          },
          { 
            role: 'user', 
            content: question 
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30秒超时
      }
    );
    
    // 提取回答内容
    const answer = response.data.choices?.[0]?.message?.content || '抱歉，我暂时无法回答这个问题。';
    
    console.log(`[GLM Response] ${answer.substring(0, 50)}...`);
    
    return answer;
    
  } catch (error) {
    console.error('GLM API Error:', error.response?.data || error.message);
    
    // 降级方案：返回预设答案
    return getDefaultAnswer(question);
  }
}

/**
 * 提取关键词（简化版）
 * 后期可接入 NLP 服务或 LLM 提取
 */
function extractKeywords(text) {
  const keywordMap = {
    '失眠': ['失眠', '睡眠', '睡不着'],
    '疲劳': ['疲劳', '累', '乏力'],
    '胃痛': ['胃痛', '胃不舒服', '胃病'],
    '头痛': ['头痛', '头疼', '偏头痛'],
    '感冒': ['感冒', '发烧', '咳嗽'],
    '便秘': ['便秘', '大便干', '排便困难'],
    '养生': ['养生', '保健', '健康']
  };
  
  const keywords = [];
  for (const [key, synonyms] of Object.entries(keywordMap)) {
    if (synonyms.some(s => text.includes(s))) {
      keywords.push(key);
    }
  }
  
  return keywords;
}

/**
 * 匹配商品（模拟数据）
 * 后期从数据库查询
 */
async function matchProducts(keywords) {
  // 模拟商品库
  const productDatabase = [
    {
      id: 'prod_001',
      name: '酸枣仁茶',
      description: '助眠安神，改善睡眠质量',
      keywords: ['失眠', '睡眠', '睡不着'],
      price: 39.9,
      imageUrl: '',
      miniprogramAppId: '', // 后期配置
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
    },
    {
      id: 'prod_003',
      name: '山药薏米粥',
      description: '健脾养胃，易消化',
      keywords: ['胃痛', '胃不舒服', '消化'],
      price: 19.9,
      imageUrl: '',
      miniprogramAppId: '',
      pagePath: ''
    }
  ];
  
  // 匹配商品
  const matched = productDatabase.filter(product => 
    product.keywords.some(k => keywords.includes(k))
  );
  
  return matched.slice(0, 3); // 最多返回 3 个
}

/**
 * 默认答案（降级方案）
 */
function getDefaultAnswer(question) {
  const defaults = [
    '这个问题很有意思，让我想想...\n\n建议您保持良好的作息习惯，多喝水，适当运动。如果症状持续，建议咨询专业医生。\n\n💡 仅供参考，不替代医疗建议',
    '感谢您的提问！\n\n食疗养生讲究因人而异，建议根据自身体质选择合适的食材。如有不适，请及时就医。\n\n💡 仅供参考，不替代医疗建议'
  ];
  
  return defaults[Math.floor(Math.random() * defaults.length)];
}

module.exports = router;
