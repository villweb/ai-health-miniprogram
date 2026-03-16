const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 初始化数据库
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    database: 'connected'
  });
});

// API 路由
app.use('/api/chat', require('./routes/chat'));
app.use('/api/products', require('./routes/products'));
app.use('/api/boards', require('./routes/boards'));

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📋 健康检查: http://localhost:${PORT}/health`);
  console.log(`🤖 GLM API: ${process.env.GLM_API_URL}`);
  console.log(`💾 数据库: SQLite`);
});

module.exports = app;
