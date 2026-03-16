// src/models/User.js - 用户模型

const db = require('../database');
const { v4: uuidv4 } = require('uuid');

class User {
  /**
   * 创建用户
   */
  static create(userData) {
    const user = {
      id: uuidv4(),
      openid: userData.openid,
      nickname: userData.nickname || '',
      avatar_url: userData.avatar_url || '',
      created_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
      total_chats: 0,
      total_products_clicked: 0
    };
    
    db.insert('users', user);
    return user;
  }
  
  /**
   * 根据 ID 查找用户
   */
  static findById(id) {
    return db.queryOne('SELECT * FROM users WHERE id = ?', [id]);
  }
  
  /**
   * 根据 openid 查找用户
   */
  static findByOpenid(openid) {
    return db.queryOne('SELECT * FROM users WHERE openid = ?', [openid]);
  }
  
  /**
   * 更新用户信息
   */
  static update(id, updates) {
    updates.updated_at = new Date().toISOString();
    return db.update('users', updates, { id });
  }
  
  /**
   * 更新最后活跃时间
   */
  static updateLastActive(id) {
    return db.update('users', 
      { last_active_at: new Date().toISOString() }, 
      { id }
    );
  }
  
  /**
   * 增加对话次数
   */
  static incrementChats(id) {
    const user = this.findById(id);
    if (user) {
      return db.update('users', 
        { total_chats: (user.total_chats || 0) + 1 }, 
        { id }
      );
    }
  }
  
  /**
   * 增加商品点击次数
   */
  static incrementProductClicks(id) {
    const user = this.findById(id);
    if (user) {
      return db.update('users', 
        { total_products_clicked: (user.total_products_clicked || 0) + 1 }, 
        { id }
      );
    }
  }
  
  /**
   * 获取或创建用户
   */
  static getOrCreate(userId, openid) {
    let user = this.findById(userId);
    
    if (!user && openid) {
      user = this.findByOpenid(openid);
    }
    
    if (!user) {
      user = this.create({ openid });
    }
    
    this.updateLastActive(user.id);
    return user;
  }
}

module.exports = User;
