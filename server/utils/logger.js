/**
 * 日志管理模块
 * 支持不同级别的日志记录和文件存储
 */

const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
const logFile = path.join(logDir, 'app.log');
const errorLogFile = path.join(logDir, 'error.log');

// 确保日志目录存在
function ensureLogDirectory() {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

// 日志级别
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

// 当前日志级别
let currentLevel = LOG_LEVELS.INFO;

// 格式化日志时间戳
function getTimestamp() {
  return new Date().toISOString();
}

// 格式化日志消息
function formatMessage(level, message, data = {}) {
  const timestamp = getTimestamp();
  const levelStr = Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level);
  const logData = data ? JSON.stringify(data) : '';
  return `[${timestamp}] [${levelStr}] ${message} ${logData}`;
}

// 写入日志文件
function writeLogFile(file, message) {
  ensureLogDirectory();
  try {
    fs.appendFileSync(file, message + '\n');
  } catch (error) {
    console.error('写入日志文件失败:', error);
  }
}

// 日志类
class Logger {
  // 调试日志
  debug(message, data = {}) {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      const logMessage = formatMessage(LOG_LEVELS.DEBUG, message, data);
      console.log(logMessage);
      writeLogFile(logFile, logMessage);
    }
  }

  // 信息日志
  info(message, data = {}) {
    if (currentLevel <= LOG_LEVELS.INFO) {
      const logMessage = formatMessage(LOG_LEVELS.INFO, message, data);
      console.log(logMessage);
      writeLogFile(logFile, logMessage);
    }
  }

  // 警告日志
  warn(message, data = {}) {
    if (currentLevel <= LOG_LEVELS.WARN) {
      const logMessage = formatMessage(LOG_LEVELS.WARN, message, data);
      console.warn(logMessage);
      writeLogFile(logFile, logMessage);
    }
  }

  // 错误日志
  error(message, data = {}) {
    if (currentLevel <= LOG_LEVELS.ERROR) {
      const logMessage = formatMessage(LOG_LEVELS.ERROR, message, data);
      console.error(logMessage);
      writeLogFile(logFile, logMessage);
      writeLogFile(errorLogFile, logMessage);
    }
  }

  // 致命错误日志
  fatal(message, data = {}) {
    if (currentLevel <= LOG_LEVELS.FATAL) {
      const logMessage = formatMessage(LOG_LEVELS.FATAL, message, data);
      console.error(logMessage);
      writeLogFile(logFile, logMessage);
      writeLogFile(errorLogFile, logMessage);
    }
  }

  // 设置日志级别
  setLevel(level) {
    if (LOG_LEVELS[level]) {
      currentLevel = LOG_LEVELS[level];
    }
  }

  // 获取日志级别
  getLevel() {
    return Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === currentLevel);
  }
}

// 导出单例
const logger = new Logger();

module.exports = logger;