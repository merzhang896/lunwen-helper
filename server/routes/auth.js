/**
 * 认证路由 - 用户注册/登录
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { query, get, insert, update } = require('../utils/database');
const { generateToken, verifyToken } = require('../middleware/auth');
const { sendVerifyCode } = require('../utils/mailer');

const router = express.Router();

// ── 内存中存储验证码（生产环境可换 Redis）──────────────────────
// 结构：{ email: { code, expiresAt, attempts } }
const verifyCodeStore = new Map();

// 生成6位数字验证码
function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// 清理过期验证码（每5分钟执行一次）
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of verifyCodeStore.entries()) {
    if (data.expiresAt < now) {
      verifyCodeStore.delete(email);
    }
  }
}, 5 * 60 * 1000);

/**
 * POST /api/auth/send-code - 发送注册验证码
 */
router.post('/send-code', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: '请输入正确的邮箱地址' });
    }

    const { email } = req.body;

    // 检查邮箱是否已被注册
    const existingUser = get('users', { email });
    if (existingUser) {
      return res.status(400).json({ error: '该邮箱已被注册' });
    }

    // 防刷：60秒内不允许重复发送
    const existing = verifyCodeStore.get(email);
    if (existing && existing.expiresAt - Date.now() > 9 * 60 * 1000) {
      const waitSec = Math.ceil((existing.sentAt + 60000 - Date.now()) / 1000);
      if (waitSec > 0) {
        return res.status(429).json({ error: `请 ${waitSec} 秒后再试` });
      }
    }

    const code = generateCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10分钟有效

    // 检查是否配置了邮件服务
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      // 未配置邮件服务时，返回验证码（仅开发调试用）
      verifyCodeStore.set(email, { code, expiresAt, sentAt: Date.now(), attempts: 0 });
      console.warn(`[开发模式] ${email} 的验证码: ${code}`);
      return res.json({ 
        message: '验证码已发送（开发模式，请查看服务端控制台）',
        devCode: process.env.NODE_ENV !== 'production' ? code : undefined
      });
    }

    // 发送邮件
    await sendVerifyCode(email, code);

    verifyCodeStore.set(email, { code, expiresAt, sentAt: Date.now(), attempts: 0 });

    res.json({ message: `验证码已发送至 ${email}，请在10分钟内完成注册` });
  } catch (error) {
    console.error('发送验证码错误:', error);
    res.status(500).json({ error: '发送验证码失败，请检查邮箱地址或稍后重试' });
  }
});

/**
 * POST /api/auth/register - 用户注册（需要验证码）
 */
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('nickname').trim().isLength({ min: 2, max: 20 }),
  body('code').trim().isLength({ min: 6, max: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, nickname, code } = req.body;

    // ── 验证码校验 ──────────────────────────────────────────────
    const stored = verifyCodeStore.get(email);

    if (!stored) {
      return res.status(400).json({ error: '验证码不存在，请先发送验证码' });
    }
    if (Date.now() > stored.expiresAt) {
      verifyCodeStore.delete(email);
      return res.status(400).json({ error: '验证码已过期，请重新发送' });
    }
    // 防暴力破解：最多5次
    stored.attempts = (stored.attempts || 0) + 1;
    if (stored.attempts > 5) {
      verifyCodeStore.delete(email);
      return res.status(400).json({ error: '验证码错误次数过多，请重新发送' });
    }
    if (stored.code !== code) {
      return res.status(400).json({ error: `验证码错误，还可尝试 ${5 - stored.attempts} 次` });
    }
    // 验证通过，删除验证码（一次性）
    verifyCodeStore.delete(email);
    // ────────────────────────────────────────────────────────────

    // 检查邮箱是否已存在
    const existingUser = get('users', { email });
    if (existingUser) {
      return res.status(400).json({ error: '该邮箱已被注册' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = insert('users', {
      email,
      password: hashedPassword,
      nickname,
      level: 'free',
      points: 100,
      expireDate: null,
      status: 'active'
    });

    // 生成 Token
    const token = generateToken({ id: user.id, email: user.email, role: 'user' });

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        level: user.level,
        points: user.points,
        expireDate: user.expireDate,
        status: user.status
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

/**
 * POST /api/auth/login - 用户登录
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // 查找用户
    const user = get('users', { email });
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 检查用户状态
    if (user.status === 'banned') {
      return res.status(403).json({ error: '该账号已被封禁' });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 生成 Token
    const token = generateToken({ id: user.id, email: user.email, role: 'user' });

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        level: user.level,
        points: user.points,
        expireDate: user.expireDate,
        status: user.status,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

/**
 * GET /api/auth/me - 获取当前用户信息
 */
router.get('/me', verifyToken, (req, res) => {
  try {
    const user = get('users', { id: req.user.id });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        level: user.level,
        points: user.points,
        expireDate: user.expireDate,
        status: user.status,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

/**
 * PUT /api/auth/password - 修改密码
 */
router.put('/password', verifyToken, [
  body('oldPassword').exists(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { oldPassword, newPassword } = req.body;

    const user = get('users', { id: req.user.id });

    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: '原密码错误' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    update('users', req.user.id, { password: hashedPassword });

    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({ error: '修改密码失败' });
  }
});

// ═══════════════════════════════════════════════════════════════
// 找回密码功能
// ═══════════════════════════════════════════════════════════════

// ── 内存中存储找回密码验证码（与注册验证码分开存储）──────────────
// 结构：{ email: { code, expiresAt, attempts, verified } }
const resetCodeStore = new Map();

/**
 * POST /api/auth/forgot-password - 发送找回密码验证码
 */
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: '请输入正确的邮箱地址' });
    }

    const { email } = req.body;

    // 检查邮箱是否存在（必须已注册才能找回密码）
    const existingUser = get('users', { email });
    if (!existingUser) {
      return res.status(400).json({ error: '该邮箱未注册，请先注册' });
    }

    // 防刷：60秒内不允许重复发送
    const existing = resetCodeStore.get(email);
    if (existing && existing.expiresAt - Date.now() > 9 * 60 * 1000) {
      const waitSec = Math.ceil((existing.sentAt + 60000 - Date.now()) / 1000);
      if (waitSec > 0) {
        return res.status(429).json({ error: `请 ${waitSec} 秒后再试` });
      }
    }

    const code = generateCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10分钟有效

    // 检查是否配置了邮件服务
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      // 未配置邮件服务时，返回验证码（仅开发调试用）
      resetCodeStore.set(email, { code, expiresAt, sentAt: Date.now(), attempts: 0, verified: false });
      console.warn(`[开发模式-找回密码] ${email} 的验证码: ${code}`);
      return res.json({ 
        message: '验证码已发送（开发模式，请查看服务端控制台）',
        devCode: process.env.NODE_ENV !== 'production' ? code : undefined
      });
    }

    // 发送邮件（复用注册时的邮件模板，但内容不同）
    const siteName = process.env.SITE_NAME || '论文助手';
    const html = `
      <div style="max-width: 480px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 30px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
          <h1 style="color: #ffffff; font-size: 24px; font-weight: 600; margin: 0;">找回密码</h1>
          <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0;">${siteName}</p>
        </div>
        <div style="padding: 40px 30px;">
          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            您正在找回密码，请使用以下验证码完成验证：
          </p>
          <div style="background: #fff7ed; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; border: 2px dashed #fdba74;">
            <div style="font-size: 36px; font-weight: 700; color: #ea580c; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</div>
          </div>
          <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0 0 16px;">
            此验证码 <strong style="color: #ea580c;">10分钟内</strong> 有效，请勿泄露给他人。
          </p>
          <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
            如非本人操作，请忽略此邮件。如有疑问，请联系客服。
          </p>
        </div>
        <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">${siteName} © ${new Date().getFullYear()}</p>
        </div>
      </div>
    `;

    const { sendVerifyCode } = require('../utils/mailer');
    await sendVerifyCode(email, code, '找回密码验证码', html);

    resetCodeStore.set(email, { code, expiresAt, sentAt: Date.now(), attempts: 0, verified: false });

    res.json({ message: `验证码已发送至 ${email}，请在10分钟内完成验证` });
  } catch (error) {
    console.error('发送找回密码验证码错误:', error);
    res.status(500).json({ error: '发送验证码失败，请检查邮箱地址或稍后重试' });
  }
});

/**
 * POST /api/auth/verify-reset-code - 验证找回密码验证码
 */
router.post('/verify-reset-code', [
  body('email').isEmail().normalizeEmail(),
  body('code').trim().isLength({ min: 6, max: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: '请输入正确的邮箱和验证码' });
    }

    const { email, code } = req.body;

    const stored = resetCodeStore.get(email);

    if (!stored) {
      return res.status(400).json({ error: '验证码不存在，请先发送验证码' });
    }
    if (Date.now() > stored.expiresAt) {
      resetCodeStore.delete(email);
      return res.status(400).json({ error: '验证码已过期，请重新发送' });
    }
    // 防暴力破解：最多5次
    stored.attempts = (stored.attempts || 0) + 1;
    if (stored.attempts > 5) {
      resetCodeStore.delete(email);
      return res.status(400).json({ error: '验证码错误次数过多，请重新发送' });
    }
    if (stored.code !== code) {
      return res.status(400).json({ error: `验证码错误，还可尝试 ${5 - stored.attempts} 次` });
    }

    // 验证通过，标记为已验证（不删除，重置密码时还需要）
    stored.verified = true;

    res.json({ message: '验证码验证通过，请设置新密码' });
  } catch (error) {
    console.error('验证找回密码验证码错误:', error);
    res.status(500).json({ error: '验证失败' });
  }
});

/**
 * POST /api/auth/reset-password - 重置密码
 */
router.post('/reset-password', [
  body('email').isEmail().normalizeEmail(),
  body('code').trim().isLength({ min: 6, max: 6 }),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, code, password } = req.body;

    // ── 验证码校验 ──────────────────────────────────────────────
    const stored = resetCodeStore.get(email);

    if (!stored) {
      return res.status(400).json({ error: '验证码不存在，请先发送验证码' });
    }
    if (Date.now() > stored.expiresAt) {
      resetCodeStore.delete(email);
      return res.status(400).json({ error: '验证码已过期，请重新发送' });
    }
    if (!stored.verified) {
      return res.status(400).json({ error: '请先验证验证码' });
    }
    if (stored.code !== code) {
      return res.status(400).json({ error: '验证码错误' });
    }
    // 验证通过，删除验证码（一次性）
    resetCodeStore.delete(email);
    // ────────────────────────────────────────────────────────────

    // 查找用户
    const user = get('users', { email });
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(password, 10);
    update('users', user.id, { password: hashedPassword });

    res.json({ message: '密码重置成功，请使用新密码登录' });
  } catch (error) {
    console.error('重置密码错误:', error);
    res.status(500).json({ error: '重置密码失败' });
  }
});

module.exports = router;
