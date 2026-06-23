/**
 * 论文助手后端 API 服务
 * Node.js + Express + JSON 文件存储
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// 初始化数据库
const { initDatabase, loadDb } = require('./utils/database');

// 日志模块
const logger = require('./utils/logger');

// 路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const pdfRoutes = require('./routes/pdf');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 3001;

// 系统状态
let systemStatus = {
  startTime: new Date().toISOString(),
  uptime: 0,
  requests: 0,
  errors: 0,
  memoryUsage: process.memoryUsage()
};

// 定期更新系统状态
setInterval(() => {
  systemStatus.uptime = process.uptime();
  systemStatus.memoryUsage = process.memoryUsage();
}, 60000); // 每分钟更新一次

// 中间件 - 日志记录
app.use((req, res, next) => {
  const start = Date.now();
  systemStatus.requests++;
  
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - start;
    logger.info('API 请求', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });
    return originalSend.call(this, body);
  };
  
  next();
});

// 中间件
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/convert', pdfRoutes);
app.use('/api/payment', paymentRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    system: systemStatus
  });
});

// 系统状态
app.get('/api/status', (req, res) => {
  const db = loadDb();
  const userCount = db.users ? db.users.length : 0;
  const orderCount = db.orders ? db.orders.length : 0;
  
  res.json({
    ...systemStatus,
    database: {
      userCount,
      orderCount
    },
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }
  });
});

// 生产环境：服务前端静态文件
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  // assets 目录带 hash，允许长期缓存；其余文件禁止缓存
  app.use('/assets', express.static(path.join(distPath, 'assets'), { maxAge: '7d' }));
  app.use(express.static(distPath, { maxAge: 0, etag: false, lastModified: false }));
  
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.setHeader('Cache-Control', 'no-store');
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
  
  logger.info(`静态文件服务已启用，目录: ${distPath}`);
}

// 错误处理中间件
app.use((err, req, res, next) => {
  systemStatus.errors++;
  logger.error('服务器错误', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 初始化数据库并启动服务器
async function startServer() {
  try {
    logger.info('正在初始化数据库...');
    initDatabase();
    logger.info('数据库初始化完成');

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`服务器运行在 http://0.0.0.0:${PORT}`);
  logger.info(`API 地址 http://0.0.0.0:${PORT}/api`);
});
  } catch (error) {
    logger.fatal('服务器启动失败', { error: error.message });
    process.exit(1);
  }
}

startServer();
