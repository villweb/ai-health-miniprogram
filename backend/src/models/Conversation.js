// src/models/Conversation.js - 对话模型

const db = require('../database');
const { v4: uuidv4 } = require('uuid');

class Conversation {
  /**
   * 创建对话记录
   */
  static create(conversationData) {
    const conversation = {
      id: uuidv4(),
      user_id: conversationData.user_id,
      session_id: conversationData.session_id || null,
      question: conversationData.question,
      answer: conversationData.answer,
      images: JSON.stringify(conversationData.images || []),
      recommended_products: JSON.stringify(conversationData.recommended_products || []),
      model: conversationData.model || 'glm-5',
      tokens_used: conversationData.tokens_used || 0,
      feedback: conversationData.feedback || null,
      created_at: new Date().toISOString()
    };
    
    db.insert('conversations', conversation);
    return conversation;
  }
  
  /**
   * 根据 ID 查找对话
   */
  static findById(id) {
    const conv = db.queryOne('SELECT * FROM conversations WHERE id = ?', [id]);
    if (conv) {
      conv.images = JSON.parse(conv.images || '[]');
      conv.recommended_products = JSON.parse(conv.recommended_products || '[]');
    }
    return conv;
  }
  
  /**
   * 获取用户的对话历史
   */
  static findByUserId(userId, limit = 20, offset = 0) {
    const conversations = db.query(
      'SELECT * FROM conversations WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );
    
    return conversations.map(conv => ({
      ...conv,
      images: JSON.parse(conv.images || '[]'),
      recommended_products: JSON.parse(conv.recommended_products || '[]')
    }));
  }
  
  /**
   * 根据 session 获取对话历史
   */
  static findBySessionId(sessionId) {
    const conversations = db.query(
      'SELECT * FROM conversations WHERE session_id = ? ORDER BY created_at ASC',
      [sessionId]
    );
    
    return conversations.map(conv => ({
      ...conv,
      images: JSON.parse(conv.images || '[]'),
      recommended_products: JSON.parse(conv.recommended_products || '[]')
    }));
  }
  
  /**
   * 更新反馈
   */
  static updateFeedback(id, feedback) {
    return db.update('conversations', { feedback }, { id });
  }
  
  /**
   * 统计用户对话次数
   */
  static countByUserId(userId) {
    const result = db.queryOne(
      'SELECT COUNT(*) as count FROM conversations WHERE user_id = ?',
      [userId]
    );
    return result ? result.count : 0;
  }
  
  /**
   * 获取热门问题
   */
  static getHotQuestions(limit = 10) {
    const results = db.query(`
      SELECT question, COUNT(*) as count 
      FROM conversations 
      GROUP BY question 
      ORDER BY count DESC 
      LIMIT ?
    `, [limit]);
    
    return results.map(r => r.question);
  }
  
  /**
   * 删除用户的对话记录
   */
  static deleteByUserId(userId) {
    return db.run('DELETE FROM conversations WHERE user_id = ?', [userId]);
  }
  
  /**
   * 获取最近对话（用于上下文）
   */
  static getRecentContext(userId, limit = 5) {
    const conversations = db.query(
      `SELECT question, answer FROM conversations 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [userId, limit]
    );
    
    // 反转顺序，最早的在前面
    return conversations.reverse();
  }
}

module.exports = Conversation;
