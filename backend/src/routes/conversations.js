const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');

/**
 * GET /api/conversations/:userId
 * 获取用户对话历史
 */
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    const conversations = Conversation.findByUserId(userId, parseInt(limit), parseInt(offset));
    
    res.json({
      code: 0,
      message: 'success',
      data: { conversations }
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({
      code: 2002,
      message: '获取对话历史失败'
    });
  }
});

/**
 * POST /api/conversations/feedback/:conversationId
 * 更新对话反馈
 */
router.post('/feedback/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    const { feedback } = req.body;
    
    Conversation.updateFeedback(conversationId, feedback);
    
    res.json({
      code: 0,
      message: '反馈成功'
    });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({
      code: 2003,
      message: '反馈失败'
    });
  }
});

module.exports = router;
