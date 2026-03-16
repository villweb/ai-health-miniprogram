// utils/database.js - SQLite 数据库封装

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

let db = null;

/**
 * 初始化数据库
 */
async function initDatabase() {
  if (db) return db;
  
  const SQL = await initSqlJs();
  
  // 尝试从文件加载
  const dbPath = path.join(__dirname, '../../data/database.sqlite');
  
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
    console.log('✅ 数据库已加载');
  } else {
    db = new SQL.Database();
    console.log('✅ 数据库已创建');
    
    // 创建表
    createTables();
    
    // 保存到文件
    saveDatabase();
  }
  
  return db;
}

/**
 * 创建表
 */
function createTables() {
  // 用户表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      openid TEXT UNIQUE,
      nickname TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_chats INTEGER DEFAULT 0,
      total_products_clicked INTEGER DEFAULT 0
    )
  `);
  
  // 对话记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      session_id TEXT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      images TEXT,
      recommended_products TEXT,
      model TEXT DEFAULT 'glm-5',
      tokens_used INTEGER DEFAULT 0,
      feedback TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  // 商品表
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      keywords TEXT,
      category TEXT,
      price REAL,
      image_url TEXT,
      miniprogram_app_id TEXT,
      page_path TEXT,
      is_active INTEGER DEFAULT 1,
      click_count INTEGER DEFAULT 0,
      purchase_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 板块表
  db.run(`
    CREATE TABLE IF NOT EXISTS boards (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      icon TEXT,
      description TEXT,
      type TEXT,
      content TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 敏感词表
  db.run(`
    CREATE TABLE IF NOT EXISTS sensitive_words (
      id TEXT PRIMARY KEY,
      word TEXT UNIQUE NOT NULL,
      category TEXT,
      level TEXT,
      action TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('✅ 数据表已创建');
}

/**
 * 保存数据库到文件
 */
function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  const dbPath = path.join(__dirname, '../../data/database.sqlite');
  
  // 确保 data 目录存在
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(dbPath, buffer);
  console.log('✅ 数据库已保存');
}

/**
 * 执行查询
 */
function query(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    
    const results = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push(row);
    }
    stmt.free();
    
    return results;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

/**
 * 执行单条查询
 */
function queryOne(sql, params = []) {
  const results = query(sql, params);
  return results.length > 0 ? results[0] : null;
}

/**
 * 执行插入/更新/删除
 */
function run(sql, params = []) {
  try {
    db.run(sql, params);
    saveDatabase();
    return { changes: db.getRowsModified() };
  } catch (error) {
    console.error('Run error:', error);
    throw error;
  }
}

/**
 * 插入数据
 */
function insert(table, data) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');
  
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
  return run(sql, values);
}

/**
 * 更新数据
 */
function update(table, data, where) {
  const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
  
  const values = [...Object.values(data), ...Object.values(where)];
  const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
  
  return run(sql, values);
}

/**
 * 删除数据
 */
function remove(table, where) {
  const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
  const values = Object.values(where);
  
  const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
  return run(sql, values);
}

/**
 * 关闭数据库
 */
function closeDatabase() {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
    console.log('✅ 数据库已关闭');
  }
}

module.exports = {
  initDatabase,
  saveDatabase,
  query,
  queryOne,
  run,
  insert,
  update,
  remove,
  closeDatabase
};
