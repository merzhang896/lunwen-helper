/**
 * JWT 认证中间件 - 增强版
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { get } = require('../utils/database');
const logger = require('../utils/logger');

// 生成安全的JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secure-jwt-secret-key-for-lunwen-helper-2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-secure-refresh-secret-key-for-lunwen-helper-2026';

// 令牌过期时间
const TOKEN_EXPIRES_IN = '2h'; // 访问令牌2小时过期
const REFRESH_TOKEN_EXPIRES_IN = '7d'; // 刷新令牌7天过期

// 登录尝试记录
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30分钟

/**
 * 生成访问令牌
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || 'user',
      ip: user.ip,
      userAgent: user.userAgent
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  );
}

/**
 * 生成刷新令牌
 */
function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role || 'user'
    },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
}

/**
 * 验证访问令牌中间件
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const clientIP = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  // 记录请求信息
  req.clientInfo = {
    ip: clientIP,
    userAgent,
    timestamp: new Date().toISOString()
  };

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: '未提供认证令牌',
      code: 'NO_TOKEN'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 验证IP和用户代理是否匹配（可选，因为IP可能会变化）
    // if (decoded.ip && decoded.ip !== clientIP) {
    //   logger.warn('令牌来源异常', { expectedIP: decoded.ip, actualIP: clientIP });
    //   return res.status(401).json({ 
    //     error: '令牌来源异常',
    //     code: 'IP_MISMATCH'
    //   });
    // }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('令牌已过期', { error: error.message });
      return res.status(401).json({ 
        error: '令牌已过期',
        code: 'TOKEN_EXPIRED'
      });
    }
    logger.warn('无效的认证令牌', { error: error.message });
    return res.status(401).json({ 
      error: '无效的认证令牌',
      code: 'INVALID_TOKEN'
    });
  }
}

/**
 * 验证管理员权限中间件
 */
function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: '未提供认证令牌',
      code: 'NO_TOKEN'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 检查管理员权限
    const adminRoles = ['admin', 'super_admin'];
    if (!adminRoles.includes(decoded.role)) {
      return res.status(403).json({ 
        error: '权限不足',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // 验证管理员是否存在且活跃
    const admin = get('admins', { id: decoded.id });
    if (!admin) {
      return res.status(401).json({ 
        error: '管理员不存在',
        code: 'ADMIN_NOT_FOUND'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: '无效的认证令牌',
      code: 'INVALID_TOKEN'
    });
  }
}

/**
 * 验证超级管理员权限中间件
 */
function verifySuperAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: '未提供认证令牌',
      code: 'NO_TOKEN'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.role !== 'super_admin') {
      return res.status(403).json({ 
        error: '需要超级管理员权限',
        code: 'SUPER_ADMIN_REQUIRED'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: '无效的认证令牌',
      code: 'INVALID_TOKEN'
    });
  }
}

/**
 * 检查登录尝试限制
 */
function checkLoginAttempts(ip) {
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: Date.now() };
  
  // 检查是否在锁定期间
  if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
    return {
      allowed: false,
      remainingTime: Math.ceil((attempts.lockedUntil - Date.now()) / 1000)
    };
  }
  
  // 重置锁定状态
  if (attempts.lockedUntil) {
    attempts.lockedUntil = null;
  }
  
  return {
    allowed: true,
    attempts: attempts.count
  };
}

/**
 * 记录登录尝试
 */
function recordLoginAttempt(ip, success) {
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: Date.now() };
  
  if (success) {
    // 登录成功，重置尝试次数
    attempts.count = 0;
    attempts.lockedUntil = null;
    logger.info('登录成功', { ip });
  } else {
    // 登录失败，增加尝试次数
    attempts.count++;
    attempts.lastAttempt = Date.now();
    
    // 超过最大尝试次数，锁定IP
    if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
      attempts.lockedUntil = Date.now() + LOCKOUT_DURATION;
      logger.warn('IP 被锁定', { ip, attempts: attempts.count });
    } else {
      logger.warn('登录失败', { ip, attempts: attempts.count });
    }
  }
  
  loginAttempts.set(ip, attempts);
  
  // 清理过期的登录尝试记录
  setTimeout(() => {
    const currentAttempts = loginAttempts.get(ip);
    if (currentAttempts && currentAttempts.count === 0) {
      loginAttempts.delete(ip);
    }
  }, 24 * 60 * 60 * 1000); // 24小时后清理
}

/**
 * 刷新令牌
 */
function refreshToken(req, res) {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ 
      error: '未提供刷新令牌',
      code: 'NO_REFRESH_TOKEN'
    });
  }
  
  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    
    // 检查用户是否存在
    const user = get('users', { id: decoded.id }) || get('admins', { id: decoded.id });
    if (!user) {
      return res.status(401).json({ 
        error: '用户不存在',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // 生成新的访问令牌
    const newToken = generateToken({
      id: user.id,
      email: user.email || user.username,
      role: user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({
      token: newToken,
      expiresIn: TOKEN_EXPIRES_IN
    });
  } catch (error) {
    return res.status(401).json({ 
      error: '无效的刷新令牌',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
}

module.exports = {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyAdmin,
  verifySuperAdmin,
  checkLoginAttempts,
  recordLoginAttempt,
  refreshToken
};
