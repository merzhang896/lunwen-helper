/**
 * 文心一言 API 配置
 * 使用新版 bce-v3 Bearer Token 认证方式
 * API Key 申请地址: https://console.bce.baidu.com/
 */

// API配置（新版 bce-v3 格式，直接作为 Bearer Token 使用）
export const WENXIN_CONFIG = {
  // API Key - bce-v3/ALTAK-xxx/xxx 格式，直接用作 Bearer Token
  API_KEY: import.meta.env.VITE_WENXIN_API_KEY || '',
};

// API端点（新版 ERNIE Speed/Lite 免费模型）
export const WENXIN_ENDPOINTS = {
  // ERNIE-4.0 (最新最强模型)
  ERNIE_4: 'https://qianfan.baidubce.com/v2/chat/completions',
  // ERNIE-3.5 (主力模型)
  ERNIE_35: 'https://qianfan.baidubce.com/v2/chat/completions',
  // ERNIE-Speed (快速响应)
  ERNIE_SPEED: 'https://qianfan.baidubce.com/v2/chat/completions',
  // ERNIE-Lite (轻量模型)
  ERNIE_LITE: 'https://qianfan.baidubce.com/v2/chat/completions',
};

// 模型选择
export const MODEL_SELECTION = {
  rewrite: {
    basic: 'ernie-lite-8k',      // 基础改写 - 用轻量快速模型
    advanced: 'ernie-speed-128k', // 高级改写 - 用快速模型
    powerful: 'ernie-3.5-8k',     // 强力改写 - 用主力模型
  },
  reduceAI: {
    basic: 'ernie-lite-8k',       // 基础降AI
    advanced: 'ernie-speed-128k', // 高级降AI
    powerful: 'ernie-4',          // 强力降AI - 用最新最强模型
  },
};

// 积分消耗配置 (每次调用消耗积分)
export const POINTS_COST = {
  basic: 1,      // 基础模式
  advanced: 3,   // 高级模式
  powerful: 5,   // 强力模式
};
