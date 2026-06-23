/**
 * 管理员路由 - 后台管理
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { query, get, insert, update, delete: del, count, getSettings, updateSettings, regenerateApiKey, createBackup, getBackups, restoreBackup, deleteBackup } = require('../utils/database');
const { verifyToken, verifyAdmin, generateToken, checkLoginAttempts, recordLoginAttempt, generateRefreshToken, refreshToken } = require('../middleware/auth');

const router = express.Router();

// 管理员登录
router.post('/login', [
  body('username').exists(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // 检查登录尝试限制
    const attemptCheck = checkLoginAttempts(clientIP);
    if (!attemptCheck.allowed) {
      return res.status(429).json({
        error: `登录尝试过于频繁，请 ${attemptCheck.remainingTime} 秒后再试`,
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }

    const admin = get('admins', { username });
    if (!admin) {
      // 记录失败尝试
      recordLoginAttempt(clientIP, false);
      return res.status(401).json({ 
        error: '用户名或密码错误',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      // 记录失败尝试
      recordLoginAttempt(clientIP, false);
      return res.status(401).json({ 
        error: '用户名或密码错误',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // 登录成功，记录成功尝试
    recordLoginAttempt(clientIP, true);

    // 生成令牌
    const token = generateToken({
      id: admin.id,
      email: admin.email || admin.username,
      role: admin.role,
      ip: clientIP,
      userAgent
    });
    const refreshToken = generateRefreshToken(admin);

    res.json({
      message: '登录成功',
      token,
      refreshToken,
      expiresIn: '2h',
      admin: {
        id: admin.id,
        username: admin.username,
        nickname: admin.nickname,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('管理员登录错误:', error);
    res.status(500).json({ 
      error: '登录失败',
      code: 'INTERNAL_ERROR'
    });
  }
});

// 刷新令牌
router.post('/refresh-token', (req, res) => {
  refreshToken(req, res);
});

// 以下路由需要管理员权限
router.use(verifyAdmin);

/**
 * GET /api/admin/stats - 获取统计数据
 */
router.get('/stats', (req, res) => {
  try {
    const users = query('users');
    const orders = query('orders');
    const pointLogs = query('pointLogs');
    const processLogs = query('processLogs');

    // 用户统计
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const bannedUsers = users.filter(u => u.status === 'banned').length;

    // 会员统计
    const freeUsers = users.filter(u => u.level === 'free').length;
    const standardUsers = users.filter(u => u.level === 'standard').length;
    const proUsers = users.filter(u => u.level === 'professional').length;

    // 订单统计
    const totalOrders = orders.length;
    const paidOrders = orders.filter(o => o.status === 'paid').length;
    const totalRevenue = orders
      .filter(o => o.status === 'paid')
      .reduce((sum, o) => sum + o.amount, 0);

    // 处理统计
    const totalProcesses = processLogs.length;
    const todayProcesses = processLogs.filter(l => l.createdAt.startsWith(new Date().toISOString().split('T')[0])).length;

    // 今日数据
    const today = new Date().toISOString().split('T')[0];
    const todayNewUsers = users.filter(u => u.createdAt.startsWith(today)).length;
    const todayOrders = orders.filter(o => o.createdAt.startsWith(today)).length;
    const todayRevenue = orders
      .filter(o => o.status === 'paid' && o.paidAt && o.paidAt.startsWith(today))
      .reduce((sum, o) => sum + o.amount, 0);

    // 生成近30天用户增长趋势数据
    const generateUserGrowthData = () => {
      const data = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const day = date.getDate();
        const month = date.getMonth() + 1;
        
        // 统计该日期及之前的用户总数（累计用户数）
        const cumulativeUsers = users.filter(u => {
          const userDate = u.createdAt.split('T')[0];
          return userDate <= dateStr;
        }).length;
        
        // 统计该日期当天新增用户数
        const newUsers = users.filter(u => u.createdAt.startsWith(dateStr)).length;
        
        data.push({
          date: `${month}/${day}`,
          fullDate: dateStr,
          users: cumulativeUsers,
          newUsers: newUsers
        });
      }
      
      return data;
    };

    const userGrowthData = generateUserGrowthData();

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        banned: bannedUsers,
        distribution: { free: freeUsers, standard: standardUsers, professional: proUsers }
      },
      orders: {
        total: totalOrders,
        paid: paidOrders,
        totalRevenue: totalRevenue
      },
      processes: {
        total: totalProcesses,
        today: todayProcesses
      },
      today: {
        newUsers: todayNewUsers,
        orders: todayOrders,
        revenue: todayRevenue
      },
      userGrowth: userGrowthData
    });
  } catch (error) {
    console.error('获取统计错误:', error);
    res.status(500).json({ error: '获取统计失败' });
  }
});

/**
 * GET /api/admin/users - 获取用户列表
 */
router.get('/users', (req, res) => {
  try {
    const { page = 1, limit = 20, status, level, search } = req.query;

    let users = query('users');

    // 筛选
    if (status) {
      users = users.filter(u => u.status === status);
    }
    if (level) {
      users = users.filter(u => u.level === level);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(u =>
        u.email.toLowerCase().includes(searchLower) ||
        u.nickname.toLowerCase().includes(searchLower)
      );
    }

    // 排序
    users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 分页
    const total = users.length;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedUsers = users.slice(offset, offset + parseInt(limit));

    res.json({
      users: paginatedUsers.map(u => ({
        id: u.id,
        email: u.email,
        nickname: u.nickname,
        level: u.level,
        points: u.points,
        status: u.status,
        lastLogin: u.lastLogin,
        loginCount: u.loginCount,
        createdAt: u.createdAt,
        expireDate: u.expireDate
      })),
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

/**
 * GET /api/admin/users/:id - 获取用户详情
 */
router.get('/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const user = get('users', { id });
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 获取用户的订单和积分记录
    const orders = query('orders', { userId: id });
    const pointLogs = query('pointLogs', { userId: id }).slice(0, 10);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        level: user.level,
        points: user.points,
        status: user.status,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount,
        createdAt: user.createdAt,
        expireDate: user.expireDate
      },
      orders: orders.length,
      recentPointLogs: pointLogs
    });
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({ error: '获取用户详情失败' });
  }
});

/**
 * PUT /api/admin/users/:id/ban - 封禁/解封用户
 */
router.put('/users/:id/ban', (req, res) => {
  try {
    const { id } = req.params;
    const { banned } = req.body;

    update('users', id, { status: banned ? 'banned' : 'active' });

    res.json({ message: banned ? '用户已封禁' : '用户已解封' });
  } catch (error) {
    console.error('封禁用户错误:', error);
    res.status(500).json({ error: '操作失败' });
  }
});

/**
 * PUT /api/admin/users/:id/points - 修改用户积分
 */
router.put('/users/:id/points', [
  body('points').isInt({ min: 0 }),
  body('reason').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { points, reason } = req.body;

    const user = get('users', { id });
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const diff = points - user.points;

    update('users', id, { points });

    // 记录日志
    insert('pointLogs', {
      userId: id,
      nickname: user.nickname,
      email: user.email,
      type: diff > 0 ? 'add' : 'deduct',
      amount: Math.abs(diff),
      reason: reason || '管理员调整'
    });

    res.json({ message: '积分修改成功', points });
  } catch (error) {
    console.error('修改积分错误:', error);
    res.status(500).json({ error: '修改积分失败' });
  }
});

/**
 * PUT /api/admin/users/:id/membership - 修改用户会员
 */
router.put('/users/:id/membership', [
  body('level').isIn(['free', 'standard', 'professional']),
  body('days').optional().isInt({ min: 0 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { level, days } = req.body;

    let expireDate = null;
    if (days > 0) {
      const date = new Date();
      date.setDate(date.getDate() + days);
      expireDate = date.toISOString();
    }

    update('users', id, { level, expireDate });

    res.json({ message: '会员修改成功', level, expireDate });
  } catch (error) {
    console.error('修改会员错误:', error);
    res.status(500).json({ error: '修改会员失败' });
  }
});

/**
 * DELETE /api/admin/users/:id - 删除用户
 */
router.delete('/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查用户是否存在
    const user = get('users', { id });
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 删除用户相关数据
    const orders = query('orders', { userId: id });
    orders.forEach(order => del('orders', order.id));
    
    const pointLogs = query('pointLogs', { userId: id });
    pointLogs.forEach(log => del('pointLogs', log.id));
    
    const processLogs = query('processLogs', { userId: id });
    processLogs.forEach(log => del('processLogs', log.id));
    
    const favorites = query('favorites', { userId: id });
    favorites.forEach(fav => del('favorites', fav.id));
    
    // 删除用户
    del('users', id);

    res.json({ message: '用户已删除' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ error: '删除用户失败' });
  }
});

/**
 * GET /api/admin/orders - 获取订单列表
 */
router.get('/orders', (req, res) => {
  try {
    const { page = 1, limit = 20, status, level, search, date } = req.query;

    let orders = query('orders');

    // 关联用户信息
    orders = orders.map(order => {
      const user = get('users', { id: order.userId });
      return {
        ...order,
        email: user?.email,
        nickname: user?.nickname
      };
    });

    // 筛选
    if (status) {
      orders = orders.filter(o => o.status === status);
    }
    if (level) {
      orders = orders.filter(o => o.level === level);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      orders = orders.filter(o =>
        o.orderId.toLowerCase().includes(searchLower) ||
        o.email?.toLowerCase().includes(searchLower) ||
        o.nickname?.toLowerCase().includes(searchLower)
      );
    }
    // 日期筛选
    if (date) {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      
      switch (date) {
        case 'today':
          orders = orders.filter(o => o.createdAt.startsWith(today));
          break;
        case 'week':
          orders = orders.filter(o => new Date(o.createdAt) >= weekAgo);
          break;
        case 'month':
          orders = orders.filter(o => new Date(o.createdAt) >= monthAgo);
          break;
      }
    }

    // 排序
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 分页
    const total = orders.length;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedOrders = orders.slice(offset, offset + parseInt(limit));

    res.json({
      orders: paginatedOrders.map(o => ({
        id: o.id,
        orderId: o.orderId,
        userId: o.userId,
        email: o.email,
        nickname: o.nickname,
        level: o.level,
        amount: o.amount,
        status: o.status,
        payMethod: o.payMethod,
        createdAt: o.createdAt,
        paidAt: o.paidAt
      })),
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('获取订单列表错误:', error);
    res.status(500).json({ error: '获取订单列表失败' });
  }
});

/**
 * PUT /api/admin/orders/:id/status - 修改订单状态
 */
router.put('/orders/:id/status', [
  body('status').isIn(['pending', 'paid', 'cancelled', 'refunded'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    let paidAt = null;
    if (status === 'paid') {
      paidAt = new Date().toISOString();
    }

    update('orders', id, { status, paidAt });

    res.json({ message: '订单状态已更新' });
  } catch (error) {
    console.error('修改订单状态错误:', error);
    res.status(500).json({ error: '修改订单状态失败' });
  }
});

/**
 * GET /api/admin/point-logs - 获取积分日志
 */
router.get('/point-logs', (req, res) => {
  try {
    const { page = 1, limit = 50, userId, type } = req.query;

    let logs = query('pointLogs');

    // 关联用户信息
    logs = logs.map(log => {
      const user = get('users', { id: log.userId });
      return {
        ...log,
        email: user?.email,
        nickname: user?.nickname
      };
    });

    // 筛选
    if (userId) {
      logs = logs.filter(l => l.userId === userId);
    }
    if (type) {
      logs = logs.filter(l => l.type === type);
    }

    // 排序
    logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 分页
    const total = logs.length;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedLogs = logs.slice(offset, offset + parseInt(limit));

    res.json({
      logs: paginatedLogs.map(l => ({
        id: l.id,
        userId: l.userId,
        email: l.email,
        nickname: l.nickname,
        type: l.type,
        amount: l.amount,
        reason: l.reason,
        orderId: l.orderId,
        createdAt: l.createdAt
      })),
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('获取积分日志错误:', error);
    res.status(500).json({ error: '获取积分日志失败' });
  }
});

/**
 * GET /api/admin/process-logs - 获取处理日志
 */
router.get('/process-logs', (req, res) => {
  try {
    const { page = 1, limit = 50, userId, type } = req.query;

    let logs = query('processLogs');

    // 关联用户信息
    logs = logs.map(log => {
      const user = get('users', { id: log.userId });
      return {
        ...log,
        email: user?.email,
        nickname: user?.nickname
      };
    });

    // 筛选
    if (userId) {
      logs = logs.filter(l => l.userId === userId);
    }
    if (type) {
      logs = logs.filter(l => l.type === type);
    }

    // 排序
    logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 分页
    const total = logs.length;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedLogs = logs.slice(offset, offset + parseInt(limit));

    res.json({
      logs: paginatedLogs.map(l => ({
        id: l.id,
        userId: l.userId,
        email: l.email,
        nickname: l.nickname,
        type: l.type,
        mode: l.mode,
        pointsCost: l.pointsCost,
        duration: l.duration,
        createdAt: l.createdAt
      })),
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('获取处理日志错误:', error);
    res.status(500).json({ error: '获取处理日志失败' });
  }
});

/**
 * GET /api/admin/content/testimonials - 获取用户评价
 */
router.get('/content/testimonials', (req, res) => {
  try {
    const testimonials = query('content.testimonials') || [];
    res.json({ testimonials });
  } catch (error) {
    console.error('获取用户评价错误:', error);
    res.status(500).json({ error: '获取用户评价失败' });
  }
});

/**
 * POST /api/admin/content/testimonials - 添加用户评价
 */
router.post('/content/testimonials', [
  body('name').notEmpty(),
  body('role').notEmpty(),
  body('content').notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('category').notEmpty()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, role, content, rating, category } = req.body;
    const db = require('../utils/database');
    const dbData = db.loadDb();
    
    if (!dbData.content) {
      dbData.content = { testimonials: [] };
    }
    if (!dbData.content.testimonials) {
      dbData.content.testimonials = [];
    }

    const newTestimonial = {
      id: require('uuid').v4(),
      name,
      role,
      content,
      rating,
      category,
      createdAt: new Date().toISOString()
    };

    dbData.content.testimonials.push(newTestimonial);
    db.saveDb(dbData);

    res.json({ message: '评价添加成功', testimonial: newTestimonial });
  } catch (error) {
    console.error('添加用户评价错误:', error);
    res.status(500).json({ error: '添加用户评价失败' });
  }
});

/**
 * DELETE /api/admin/content/testimonials/:id - 删除用户评价
 */
router.delete('/content/testimonials/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = require('../utils/database');
    const dbData = db.loadDb();
    
    if (dbData.content && dbData.content.testimonials) {
      const index = dbData.content.testimonials.findIndex(t => t.id === id);
      if (index !== -1) {
        dbData.content.testimonials.splice(index, 1);
        db.saveDb(dbData);
        return res.json({ message: '评价已删除' });
      }
    }

    res.status(404).json({ error: '评价不存在' });
  } catch (error) {
    console.error('删除用户评价错误:', error);
    res.status(500).json({ error: '删除用户评价失败' });
  }
});

/**
 * GET /api/admin/settings - 获取系统设置
 */
router.get('/settings', (req, res) => {
  try {
    const settings = getSettings();
    res.json({ settings });
  } catch (error) {
    console.error('获取设置错误:', error);
    res.status(500).json({ error: '获取设置失败' });
  }
});

/**
 * PUT /api/admin/settings - 更新系统设置
 */
router.put('/settings', [
  body('site').optional().isObject(),
  body('membership').optional().isObject(),
  body('security').optional().isObject(),
  body('notification').optional().isObject(),
  body('api').optional().isObject(),
  body('appearance').optional().isObject()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { site, membership, security, notification, api, appearance } = req.body;
    
    if (site) {
      updateSettings('site', site);
    }
    if (membership) {
      updateSettings('membership', membership);
    }
    if (security) {
      updateSettings('security', security);
    }
    if (notification) {
      updateSettings('notification', notification);
    }
    if (api) {
      // 保留现有 API 密钥，只更新其他配置
      const currentSettings = getSettings();
      updateSettings('api', {
        ...api,
        apiKey: currentSettings.api?.apiKey || ''
      });
    }
    if (appearance) {
      updateSettings('appearance', appearance);
    }

    res.json({ message: '设置更新成功', settings: getSettings() });
  } catch (error) {
    console.error('更新设置错误:', error);
    res.status(500).json({ error: '更新设置失败' });
  }
});

/**
 * POST /api/admin/settings/api-key/regenerate - 重新生成 API 密钥
 */
router.post('/settings/api-key/regenerate', verifyToken, verifyAdmin, (req, res) => {
  try {
    const newKey = regenerateApiKey();
    res.json({ 
      message: 'API 密钥重新生成成功',
      apiKey: newKey.key,
      createdAt: newKey.createdAt
    });
  } catch (error) {
    console.error('重新生成 API 密钥错误:', error);
    res.status(500).json({ error: '重新生成 API 密钥失败' });
  }
});

/**
 * GET /api/admin/backups - 获取备份列表
 */
router.get('/backups', verifyToken, verifyAdmin, (req, res) => {
  try {
    const backups = getBackups();
    res.json({ backups });
  } catch (error) {
    console.error('获取备份列表错误:', error);
    res.status(500).json({ error: '获取备份列表失败' });
  }
});

/**
 * POST /api/admin/backups - 创建备份
 */
router.post('/backups', verifyToken, verifyAdmin, [
  body('notes').optional().isString()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { notes } = req.body;
    const backup = createBackup(notes);
    res.json({ 
      message: '备份创建成功',
      backup
    });
  } catch (error) {
    console.error('创建备份错误:', error);
    res.status(500).json({ error: '创建备份失败' });
  }
});

/**
 * POST /api/admin/backups/:id/restore - 恢复备份
 */
router.post('/backups/:id/restore', verifyToken, verifyAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const result = restoreBackup(id);
    res.json(result);
  } catch (error) {
    console.error('恢复备份错误:', error);
    res.status(500).json({ error: error.message || '恢复备份失败' });
  }
});

/**
 * DELETE /api/admin/backups/:id - 删除备份
 */
router.delete('/backups/:id', verifyToken, verifyAdmin, (req, res) => {
  try {
    const { id } = req.params;
    deleteBackup(id);
    res.json({ message: '备份删除成功' });
  } catch (error) {
    console.error('删除备份错误:', error);
    res.status(500).json({ error: error.message || '删除备份失败' });
  }
});

/**
 * GET /api/admin/admins - 获取管理员列表
 */
router.get('/admins', (req, res) => {
  try {
    const admins = query('admins').map(a => ({
      id: a.id,
      username: a.username,
      nickname: a.nickname,
      role: a.role,
      createdAt: a.createdAt
    }));
    res.json({ admins });
  } catch (error) {
    console.error('获取管理员列表错误:', error);
    res.status(500).json({ error: '获取管理员列表失败' });
  }
});

/**
 * GET /api/admin/health - 系统健康检查
 */
router.get('/health', (req, res) => {
  try {
    const startTime = Date.now();
    
    // 检查数据库连接（尝试查询用户表）
    let dbStatus = 'healthy';
    let dbLatency = 0;
    try {
      const dbStart = Date.now();
      query('users', {}, { limit: 1 });
      dbLatency = Date.now() - dbStart;
    } catch (error) {
      dbStatus = 'unhealthy';
    }
    
    // 检查磁盘空间（使用 data 目录下的数据库文件）
    const fs = require('fs');
    const path = require('path');
    let diskStatus = 'healthy';
    let diskMessage = '存储空间充足';
    try {
      // 尝试多个可能的数据库文件路径
      const possiblePaths = [
        path.join(__dirname, '../data/db.json'),
        path.join(__dirname, '../db.json'),
        './data/db.json',
        './db.json'
      ];
      
      let dbFilePath = null;
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          dbFilePath = p;
          break;
        }
      }
      
      if (dbFilePath) {
        const stats = fs.statSync(dbFilePath);
        const fileSizeMB = stats.size / (1024 * 1024);
        // 如果数据库文件超过 100MB，警告
        if (fileSizeMB > 100) {
          diskStatus = 'warning';
          diskMessage = `存储空间警告 (${fileSizeMB.toFixed(1)}MB)`;
        } else {
          diskMessage = `存储空间正常 (${fileSizeMB.toFixed(1)}MB)`;
        }
      } else {
        // 如果找不到数据库文件，检查 data 目录是否存在
        const dataDir = path.join(__dirname, '../data');
        if (fs.existsSync(dataDir)) {
          diskStatus = 'healthy';
          diskMessage = '存储目录正常';
        } else {
          diskStatus = 'unknown';
          diskMessage = '无法检测存储状态';
        }
      }
    } catch (error) {
      diskStatus = 'unknown';
      diskMessage = '无法检测存储状态';
    }
    
    // 计算系统运行时间（从服务器启动开始）
    const uptime = process.uptime();
    
    // 内存使用情况
    const memoryUsage = process.memoryUsage();
    
    // 总体状态
    let overallStatus = 'healthy';
    if (dbStatus === 'unhealthy') {
      overallStatus = 'critical';
    } else if (dbStatus === 'warning' || diskStatus === 'warning') {
      overallStatus = 'warning';
    }
    
    res.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      services: {
        database: {
          status: dbStatus,
          latency: dbLatency,
          message: dbStatus === 'healthy' ? '数据库连接正常' : '数据库连接异常'
        },
        disk: {
          status: diskStatus,
          message: diskMessage
        }
      },
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        unit: 'MB'
      },
      responseTime: Date.now() - startTime
    });
  } catch (error) {
    console.error('健康检查错误:', error);
    res.status(500).json({ 
      status: 'critical',
      error: '健康检查失败',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
