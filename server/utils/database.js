/**
 * 数据库工具 - JSON 文件存储
 * 增强版：支持更多功能和错误处理
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

const dataDir = path.join(__dirname, '../data');
const dbFile = path.join(dataDir, 'db.json');
const backupDir = path.join(dataDir, 'backups');

// 确保目录存在
function ensureDirectories() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
}

// 初始化数据库文件
function initDatabase() {
  ensureDirectories();
  let db = loadDb();

  // 如果数据库为空，初始化
  if (Object.keys(db).length === 0) {
    db = {
      users: [],
      admins: [],
      orders: [],
      pointLogs: [],
      processLogs: [],
      favorites: [],
      content: {
        testimonials: [],
        faq: [],
        features: []
      },
      settings: {
        site: {
          name: '论文助手',
          description: '专业的学术写作辅助工具',
          logo: '',
          favicon: '',
          contactEmail: 'support@bunny.com',
          maintenanceMode: false
        },
        membership: {
          free: { points: 100, dailyLimit: 5 },
          standard: { points: 1000, dailyLimit: 100, price: 99 },
          professional: { points: 5000, dailyLimit: Infinity, price: 299 }
        },
        security: {
          twoFactorAuth: false
        },
        notification: {
          newUser: true,
          membershipPurchase: true,
          unusualLogin: true,
          systemMaintenance: true
        },
        api: {
          apiKey: '',
          rateLimit: '1000次/分钟',
          enabled: true
        },
        appearance: {
          darkMode: false,
          primaryColor: '#ec4899'
        }
      },
      apiKeys: [],
      apiUsage: {},
      backups: []
    };

    // 创建默认管理员
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.admins.push({
      id: uuidv4(),
      username: 'admin',
      password: hashedPassword,
      role: 'super_admin',
      nickname: '超级管理员',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 创建测试用户
    const testPassword = bcrypt.hashSync('123456', 10);
    db.users.push({
      id: uuidv4(),
      email: 'test@example.com',
      password: testPassword,
      nickname: '学术达人',
      level: 'free',
      points: 100,
      expireDate: null,
      status: 'active',
      lastLogin: null,
      loginCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 添加默认内容
    db.content.testimonials = [
      {
        id: uuidv4(),
        name: '学术探索者',
        role: '研究生',
        content: '使用论文助手后，我的论文质量显著提高，老师对我的写作风格给予了高度评价。',
        rating: 5,
        category: '学术论文',
        createdAt: new Date().toISOString()
      }
    ];

    saveDb(db);
    console.log('✅ 默认管理员已创建: admin / admin123');
    console.log('✅ 测试用户已创建: test@example.com / 123456');
  }

  console.log('✅ 数据库初始化完成');
  return db;
}

// 加载数据库
function loadDb() {
  ensureDirectories();
  if (!fs.existsSync(dbFile)) {
    return {};
  }
  try {
    const data = fs.readFileSync(dbFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    logger.error('加载数据库失败', { error: error.message });
    // 尝试从备份恢复
    const backups = fs.readdirSync(backupDir).sort().reverse();
    if (backups.length > 0) {
      const latestBackup = path.join(backupDir, backups[0]);
      logger.info('尝试从备份恢复', { backupFile: latestBackup });
      try {
        const backupData = fs.readFileSync(latestBackup, 'utf-8');
        const backupDb = JSON.parse(backupData);
        saveDb(backupDb);
        logger.info('从备份恢复成功');
        return backupDb;
      } catch (backupError) {
        logger.error('从备份恢复失败', { error: backupError.message });
      }
    }
    return {};
  }
}

// 保存数据库
function saveDb(db) {
  ensureDirectories();
  try {
    // 创建备份
    const backupFile = path.join(backupDir, `db_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(db, null, 2), 'utf-8');
    
    // 清理旧备份（保留最近5个）
    const backups = fs.readdirSync(backupDir).sort().reverse();
    if (backups.length > 5) {
      backups.slice(5).forEach(oldBackup => {
        fs.unlinkSync(path.join(backupDir, oldBackup));
      });
    }
    
    // 保存主数据库
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf-8');
    logger.debug('数据库保存成功');
    return true;
  } catch (error) {
    logger.error('保存数据库失败', { error: error.message });
    throw error;
  }
}

// 数据库操作类
class Database {
  constructor() {
    this.db = loadDb();
  }

  // 通用查询（返回数组）
  query(table, conditions = {}, sort = null) {
    let items = this.db[table] || [];

    // 应用条件筛选
    Object.keys(conditions).forEach(key => {
      if (conditions[key] !== undefined) {
        items = items.filter(item => {
          if (typeof conditions[key] === 'function') {
            return conditions[key](item[key]);
          }
          return item[key] === conditions[key];
        });
      }
    });

    // 应用排序
    if (sort) {
      items.sort((a, b) => {
        if (a[sort.key] < b[sort.key]) return sort.order === 'asc' ? -1 : 1;
        if (a[sort.key] > b[sort.key]) return sort.order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return items;
  }

  // 获取单个
  get(table, conditions = {}) {
    const items = this.query(table, conditions);
    return items.length > 0 ? items[0] : null;
  }

  // 插入
  insert(table, data) {
    if (!this.db[table]) {
      this.db[table] = [];
    }

    const id = data.id || uuidv4();
    const timestamp = new Date().toISOString();
    const item = {
      ...data,
      id,
      createdAt: data.createdAt || timestamp,
      updatedAt: timestamp
    };

    this.db[table].push(item);
    saveDb(this.db);

    return { lastInsertRowid: id, ...item };
  }

  // 更新
  update(table, id, data) {
    const index = this.db[table].findIndex(item => item.id === id);
    if (index === -1) {
      return { changes: 0, error: '记录不存在' };
    }

    this.db[table][index] = {
      ...this.db[table][index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    saveDb(this.db);

    return { changes: 1, ...this.db[table][index] };
  }

  // 删除
  delete(table, id) {
    const index = this.db[table].findIndex(item => item.id === id);
    if (index === -1) {
      return { changes: 0, error: '记录不存在' };
    }

    const deletedItem = this.db[table][index];
    this.db[table].splice(index, 1);
    saveDb(this.db);

    return { changes: 1, deleted: deletedItem };
  }

  // 计数
  count(table, conditions = {}) {
    const items = this.query(table, conditions);
    return items.length;
  }

  // 分页查询
  paginate(table, conditions = {}, page = 1, limit = 20, sort = null) {
    const offset = (page - 1) * limit;
    let items = this.query(table, conditions, sort);
    const total = items.length;

    items = items.slice(offset, offset + limit);

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    };
  }

  // 批量操作
  batch(table, operations) {
    let results = [];
    
    try {
      operations.forEach(op => {
        switch (op.type) {
          case 'insert':
            results.push(this.insert(table, op.data));
            break;
          case 'update':
            results.push(this.update(table, op.id, op.data));
            break;
          case 'delete':
            results.push(this.delete(table, op.id));
            break;
        }
      });
      return { success: true, results };
    } catch (error) {
      return { success: false, error: error.message, results };
    }
  }

  // 获取设置
  getSettings(key = null) {
    const settings = this.db.settings || {};
    if (key) {
      return settings[key] || null;
    }
    return settings;
  }

  // 更新设置
  updateSettings(key, value) {
    if (!this.db.settings) {
      this.db.settings = {};
    }
    this.db.settings[key] = value;
    saveDb(this.db);
    return { success: true, settings: this.db.settings };
  }
}

// 导出单例
const db = new Database();

// API 密钥管理
function generateApiKey() {
  return 'sk_live_' + uuidv4().replace(/-/g, '');
}

function createApiKey(name, permissions = ['read']) {
  const db = loadDb();
  if (!db.apiKeys) {
    db.apiKeys = [];
  }
  
  const apiKey = {
    id: uuidv4(),
    key: generateApiKey(),
    name: name || 'API Key',
    permissions,
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
    usageCount: 0,
    enabled: true
  };
  
  db.apiKeys.push(apiKey);
  saveDb(db);
  
  // 更新 settings 中的 apiKey
  if (!db.settings) db.settings = {};
  if (!db.settings.api) db.settings.api = {};
  db.settings.api.apiKey = apiKey.key;
  saveDb(db);
  
  return apiKey;
}

function getApiKey(key) {
  const db = loadDb();
  if (!db.apiKeys) return null;
  return db.apiKeys.find(k => k.key === key && k.enabled);
}

function regenerateApiKey() {
  const db = loadDb();
  
  // 禁用所有旧密钥
  if (db.apiKeys) {
    db.apiKeys.forEach(k => {
      k.enabled = false;
      k.disabledAt = new Date().toISOString();
    });
  }
  
  // 创建新密钥
  const newKey = createApiKey('主API密钥', ['read', 'write']);
  
  saveDb(db);
  return newKey;
}

function recordApiUsage(apiKey) {
  const db = loadDb();
  if (!db.apiUsage) db.apiUsage = {};
  
  const today = new Date().toISOString().split('T')[0];
  if (!db.apiUsage[today]) {
    db.apiUsage[today] = {};
  }
  if (!db.apiUsage[today][apiKey]) {
    db.apiUsage[today][apiKey] = 0;
  }
  db.apiUsage[today][apiKey]++;
  
  // 更新密钥使用统计
  const keyRecord = db.apiKeys?.find(k => k.key === apiKey);
  if (keyRecord) {
    keyRecord.lastUsedAt = new Date().toISOString();
    keyRecord.usageCount++;
  }
  
  saveDb(db);
}

function getApiUsage(apiKey, days = 7) {
  const db = loadDb();
  if (!db.apiUsage) return [];
  
  const result = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    result.push({
      date: dateStr,
      count: db.apiUsage[dateStr]?.[apiKey] || 0
    });
  }
  
  return result.reverse();
}

// 数据备份管理
function createBackup(notes = '') {
  ensureDirectories();
  
  const db = loadDb();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
  
  const backup = {
    id: uuidv4(),
    filename: `backup-${timestamp}.json`,
    createdAt: new Date().toISOString(),
    size: 0,
    notes: notes || '手动备份',
    tables: {}
  };
  
  // 统计各表数据量
  Object.keys(db).forEach(key => {
    if (Array.isArray(db[key])) {
      backup.tables[key] = db[key].length;
    } else if (typeof db[key] === 'object') {
      backup.tables[key] = Object.keys(db[key]).length;
    }
  });
  
  // 保存备份文件
  fs.writeFileSync(backupFile, JSON.stringify(db, null, 2));
  
  // 记录备份信息
  backup.size = fs.statSync(backupFile).size;
  
  if (!db.backups) db.backups = [];
  db.backups.unshift(backup);
  
  // 只保留最近 20 个备份
  if (db.backups.length > 20) {
    const oldBackups = db.backups.splice(20);
    oldBackups.forEach(b => {
      const oldFile = path.join(backupDir, b.filename);
      if (fs.existsSync(oldFile)) {
        fs.unlinkSync(oldFile);
      }
    });
  }
  
  saveDb(db);
  return backup;
}

function getBackups() {
  const db = loadDb();
  return db.backups || [];
}

function restoreBackup(backupId) {
  const db = loadDb();
  const backup = db.backups?.find(b => b.id === backupId);
  
  if (!backup) {
    throw new Error('备份不存在');
  }
  
  const backupFile = path.join(backupDir, backup.filename);
  if (!fs.existsSync(backupFile)) {
    throw new Error('备份文件不存在');
  }
  
  // 先创建当前数据的备份
  createBackup('恢复前自动备份');
  
  // 恢复数据
  const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
  saveDb(backupData);
  
  return { success: true, message: '数据恢复成功' };
}

function deleteBackup(backupId) {
  const db = loadDb();
  const backupIndex = db.backups?.findIndex(b => b.id === backupId);
  
  if (backupIndex === -1 || backupIndex === undefined) {
    throw new Error('备份不存在');
  }
  
  const backup = db.backups[backupIndex];
  const backupFile = path.join(backupDir, backup.filename);
  
  if (fs.existsSync(backupFile)) {
    fs.unlinkSync(backupFile);
  }
  
  db.backups.splice(backupIndex, 1);
  saveDb(db);
  
  return { success: true };
}

module.exports = {
  initDatabase,
  query: (table, conditions, sort) => db.query(table, conditions, sort),
  get: (table, conditions) => db.get(table, conditions),
  insert: (table, data) => db.insert(table, data),
  update: (table, id, data) => db.update(table, id, data),
  delete: (table, id) => db.delete(table, id),
  count: (table, conditions) => db.count(table, conditions),
  paginate: (table, conditions, page, limit, sort) => db.paginate(table, conditions, page, limit, sort),
  batch: (table, operations) => db.batch(table, operations),
  getSettings: (key) => db.getSettings(key),
  updateSettings: (key, value) => db.updateSettings(key, value),
  loadDb,
  saveDb,
  // API 密钥管理
  generateApiKey,
  createApiKey,
  getApiKey,
  regenerateApiKey,
  recordApiUsage,
  getApiUsage,
  // 备份管理
  createBackup,
  getBackups,
  restoreBackup,
  deleteBackup
};
