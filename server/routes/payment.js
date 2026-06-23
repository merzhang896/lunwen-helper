/**
 * 支付路由 - 订单创建、支付回调、会员升级
 * 使用模拟支付流程（实际生产环境可接入支付宝/微信支付SDK）
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { query, get, insert, update } = require('../utils/database');
const { verifyToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// 会员套餐配置
const MEMBERSHIP_PLANS = {
  standard: {
    name: '标准会员',
    monthlyPrice: 29,
    yearlyPrice: 209, // 年付约省40%
    level: 'standard',
    points: 100,
    features: ['每日10000字改写', '每日10000字降AI率', '基础+高级改写模式', '去除水印', '优先客服支持']
  },
  professional: {
    name: '专业会员',
    monthlyPrice: 79,
    yearlyPrice: 569, // 年付约省40%
    level: 'professional',
    points: 500,
    features: ['无限次改写', '无限次降AI率', '全部改写模式', '去除水印', '专属客服支持', '优先处理队列', '高级数据分析']
  }
};

/**
 * POST /api/payment/plans - 获取会员套餐列表
 */
router.get('/plans', (req, res) => {
  res.json({
    plans: MEMBERSHIP_PLANS,
    annualDiscount: 40
  });
});

/**
 * POST /api/payment/create-order - 创建支付订单
 */
router.post('/create-order', verifyToken, [
  body('planId').isIn(['standard', 'professional']).withMessage('无效的套餐类型'),
  body('billingCycle').isIn(['monthly', 'yearly']).withMessage('无效的计费周期')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { planId, billingCycle } = req.body;
    const userId = req.user.id;

    // 获取套餐信息
    const plan = MEMBERSHIP_PLANS[planId];
    if (!plan) {
      return res.status(400).json({ error: '套餐不存在' });
    }

    // 计算价格
    const amount = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
    const duration = billingCycle === 'yearly' ? 365 : 30; // 天数

    // 创建订单
    const order = insert('orders', {
      userId,
      orderNo: `ORD${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      planId,
      planName: plan.name,
      billingCycle,
      amount,
      duration,
      status: 'pending', // pending, paid, cancelled, refunded
      payMethod: null,
      payTime: null,
      expireDate: null,
      remark: ''
    });

    logger.info('创建订单成功', { orderId: order.id, userId, planId, amount });

    res.json({
      message: '订单创建成功',
      order: {
        id: order.id,
        orderNo: order.orderNo,
        planId: order.planId,
        planName: order.planName,
        billingCycle: order.billingCycle,
        amount: order.amount,
        duration: order.duration,
        status: order.status,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    logger.error('创建订单失败', { error: error.message, userId: req.user.id });
    res.status(500).json({ error: '创建订单失败' });
  }
});

/**
 * POST /api/payment/pay - 模拟支付（实际应接入支付宝/微信SDK）
 * 这里模拟支付流程，直接返回支付成功
 */
router.post('/pay', verifyToken, [
  body('orderId').isUUID().withMessage('无效的订单ID'),
  body('payMethod').isIn(['alipay', 'wechat']).withMessage('无效的支付方式')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId, payMethod } = req.body;
    const userId = req.user.id;

    // 查找订单
    const order = get('orders', { id: orderId, userId });
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: '订单状态无效' });
    }

    // 模拟支付处理（实际应调用支付宝/微信SDK）
    // 这里直接模拟支付成功
    const payTime = new Date().toISOString();
    
    // 计算会员到期时间
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + order.duration);

    // 更新订单状态
    update('orders', orderId, {
      status: 'paid',
      payMethod,
      payTime,
      expireDate: expireDate.toISOString()
    });

    // 更新用户会员信息
    const plan = MEMBERSHIP_PLANS[order.planId];
    const user = get('users', { id: userId });
    
    // 如果用户已有会员且未过期，则累加时间
    let newExpireDate = expireDate;
    if (user.expireDate && new Date(user.expireDate) > new Date()) {
      newExpireDate = new Date(user.expireDate);
      newExpireDate.setDate(newExpireDate.getDate() + order.duration);
    }

    update('users', userId, {
      level: plan.level,
      points: (user.points || 0) + plan.points,
      expireDate: newExpireDate.toISOString()
    });

    logger.info('支付成功', { 
      orderId, 
      userId, 
      planId: order.planId, 
      amount: order.amount,
      expireDate: newExpireDate.toISOString()
    });

    res.json({
      message: '支付成功',
      order: {
        id: order.id,
        orderNo: order.orderNo,
        status: 'paid',
        payTime,
        expireDate: newExpireDate.toISOString()
      },
      user: {
        level: plan.level,
        points: (user.points || 0) + plan.points,
        expireDate: newExpireDate.toISOString()
      }
    });
  } catch (error) {
    logger.error('支付失败', { error: error.message, orderId: req.body.orderId });
    res.status(500).json({ error: '支付失败' });
  }
});

/**
 * GET /api/payment/orders - 获取用户订单列表
 */
router.get('/orders', verifyToken, (req, res) => {
  try {
    const userId = req.user.id;
    const orders = query('orders', { userId }, { key: 'createdAt', order: 'desc' });

    res.json({
      orders: orders.map(order => ({
        id: order.id,
        orderNo: order.orderNo,
        planName: order.planName,
        billingCycle: order.billingCycle,
        amount: order.amount,
        status: order.status,
        payMethod: order.payMethod,
        payTime: order.payTime,
        expireDate: order.expireDate,
        createdAt: order.createdAt
      }))
    });
  } catch (error) {
    logger.error('获取订单列表失败', { error: error.message, userId: req.user.id });
    res.status(500).json({ error: '获取订单列表失败' });
  }
});

/**
 * GET /api/payment/order/:id - 获取订单详情
 */
router.get('/order/:id', verifyToken, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = get('orders', { id, userId });
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }

    res.json({ order });
  } catch (error) {
    logger.error('获取订单详情失败', { error: error.message, orderId: req.params.id });
    res.status(500).json({ error: '获取订单详情失败' });
  }
});

/**
 * POST /api/payment/check-status - 检查支付状态（用于轮询）
 */
router.post('/check-status', verifyToken, [
  body('orderId').isUUID().withMessage('无效的订单ID')
], async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    const order = get('orders', { id: orderId, userId });
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }

    // 获取最新用户信息
    const user = get('users', { id: userId });

    res.json({
      status: order.status,
      order: {
        id: order.id,
        orderNo: order.orderNo,
        status: order.status,
        payTime: order.payTime,
        expireDate: order.expireDate
      },
      user: {
        level: user.level,
        points: user.points,
        expireDate: user.expireDate
      }
    });
  } catch (error) {
    logger.error('检查支付状态失败', { error: error.message, orderId: req.body.orderId });
    res.status(500).json({ error: '检查支付状态失败' });
  }
});

module.exports = router;
