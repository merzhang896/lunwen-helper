/**
 * API 服务层 - 与后端通信
 */

const API_BASE = '/api';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  requireAuth?: boolean;
}

/**
 * 发送 API 请求
 */
async function request<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  let token = localStorage.getItem('admin-token') || localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data = await response.json();

  // 处理认证错误 - 尝试刷新令牌
  if (response.status === 401 && (data.code === 'INVALID_TOKEN' || data.code === 'TOKEN_EXPIRED' || data.code === 'NO_TOKEN')) {
    try {
      // 尝试刷新令牌
      const newToken = await refreshAuthToken();
      // 使用新令牌重新请求
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(`${API_BASE}${endpoint}`, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      data = await response.json();
    } catch (error) {
      // 刷新令牌失败，跳转到登录页
      localStorage.removeItem('admin-token');
      localStorage.removeItem('admin-user');
      localStorage.removeItem('refresh-token');
      window.location.href = '/admin/login';
      throw new Error('认证已过期，请重新登录');
    }
  }

  if (!response.ok) {
    const err: any = new Error(data.error || data.message || '请求失败');
    err.status = response.status;
    err.code = data.code;
    throw err;
  }

  return data;
}

/**
 * 刷新令牌
 */
export async function refreshAuthToken() {
  try {
    const refreshToken = localStorage.getItem('refresh-token');
    if (!refreshToken) {
      throw new Error('没有刷新令牌');
    }
    
    const response = await fetch(`${API_BASE}/admin/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    
    if (!response.ok) {
      throw new Error('刷新令牌失败');
    }
    
    const data = await response.json();
    localStorage.setItem('admin-token', data.token);
    return data.token;
  } catch (error) {
    // 刷新令牌失败，跳转到登录页
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-user');
    localStorage.removeItem('refresh-token');
    window.location.href = '/admin/login';
    throw error;
  }
}

// ============ 认证相关 ============

export const authApi = {
  // 发送注册验证码
  sendCode: (email: string) =>
    request<{ message: string; devCode?: string }>('/auth/send-code', {
      method: 'POST',
      body: { email },
    }),

  // 注册（携带验证码）
  register: (email: string, password: string, nickname: string, code: string) =>
    request<{ token: string; user: any; message: string }>('/auth/register', {
      method: 'POST',
      body: { email, password, nickname, code },
    }),

  // 登录
  login: (email: string, password: string) =>
    request<{ token: string; user: any; message: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  // 获取当前用户
  getMe: () =>
    request<{ user: any }>('/auth/me'),

  // 修改密码
  changePassword: (oldPassword: string, newPassword: string) =>
    request('/auth/password', {
      method: 'PUT',
      body: { oldPassword, newPassword },
    }),

  // 找回密码 - 发送验证码
  forgotPassword: (email: string) =>
    request<{ message: string; devCode?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    }),

  // 找回密码 - 验证验证码
  verifyResetCode: (email: string, code: string) =>
    request<{ message: string }>('/auth/verify-reset-code', {
      method: 'POST',
      body: { email, code },
    }),

  // 找回密码 - 重置密码
  resetPassword: (email: string, code: string, password: string) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: { email, code, password },
    }),
};

// ============ 用户相关 ============

export const userApi = {
  // 获取用户资料
  getProfile: () =>
    request<{ user: any }>('/users/profile'),

  // 更新资料
  updateProfile: (nickname: string) =>
    request<{ user: any; message: string }>('/users/profile', {
      method: 'PUT',
      body: { nickname },
    }),

  // 获取积分
  getPoints: () =>
    request<{ points: number; logs: any[] }>('/users/points'),

  // 扣减积分（前端调用，由后端验证）
  deductPoints: (amount: number, reason?: string) =>
    request<{ points: number; message: string }>('/users/points/deduct', {
      method: 'POST',
      body: { amount, reason },
    }),

  // 增加积分
  addPoints: (amount: number, orderId?: string) =>
    request<{ points: number; message: string }>('/users/points/add', {
      method: 'POST',
      body: { amount, orderId },
    }),

  // 获取会员信息
  getMembership: () =>
    request<{ level: string; expireDate: string }>('/users/membership'),

  // 升级会员
  upgradeMembership: (level: string, days: number) =>
    request('/users/membership/upgrade', {
      method: 'POST',
      body: { level, days },
    }),

  // 获取历史记录
  getHistory: (limit = 50, offset = 0) =>
    request<{ history: any[]; total: number }>(`/users/history?limit=${limit}&offset=${offset}`),

  // 删除单条历史
  deleteHistory: (id: string) =>
    request('/users/history/' + id, { method: 'DELETE' }),

  // 清空历史
  clearHistory: () =>
    request('/users/history', { method: 'DELETE' }),

  // 获取收藏
  getFavorites: () =>
    request<{ favorites: any[] }>('/users/favorites'),

  // 添加收藏
  addFavorite: (favorite: {
    type: string;
    mode: string;
    preset?: string;
    title: string;
    inputText: string;
    outputText: string;
    aiRate?: number;
  }) =>
    request('/users/favorites', {
      method: 'POST',
      body: favorite,
    }),

  // 删除收藏
  deleteFavorite: (id: string) =>
    request('/users/favorites/' + id, { method: 'DELETE' }),

  // 记录处理（扣积分）
  recordProcess: (process: {
    type: string;
    mode: string;
    preset?: string;
    inputText: string;
    outputText: string;
    aiRate?: number;
    pointsCost: number;
  }) =>
    request<{ logId: number; points: number }>('/users/process', {
      method: 'POST',
      body: process,
    }),

  // 降重处理
  reduceAI: (inputText: string, mode: string) =>
    request<{ output: string; aiRate: number; points: number }>('/users/reduce-ai', {
      method: 'POST',
      body: { inputText, mode },
    }),

  // 学术改写
  rewriteText: (params: { inputText: string; mode: string; preset: string }) =>
    request<{ output: string; aiRate: number }>('/users/rewrite', {
      method: 'POST',
      body: params,
    }),
};

// ============ 支付相关 ============

export const paymentApi = {
  // 获取会员套餐
  getPlans: () =>
    request<{ plans: any; annualDiscount: number }>('/payment/plans'),

  // 创建订单
  createOrder: (planId: string, billingCycle: 'monthly' | 'yearly') =>
    request<{ message: string; order: any }>('/payment/create-order', {
      method: 'POST',
      body: { planId, billingCycle },
    }),

  // 支付订单
  payOrder: (orderId: string, payMethod: 'alipay' | 'wechat') =>
    request<{ message: string; order: any; user: any }>('/payment/pay', {
      method: 'POST',
      body: { orderId, payMethod },
    }),

  // 获取订单列表
  getOrders: () =>
    request<{ orders: any[] }>('/payment/orders'),

  // 获取订单详情
  getOrder: (orderId: string) =>
    request<{ order: any }>(`/payment/order/${orderId}`),

  // 检查支付状态
  checkStatus: (orderId: string) =>
    request<{ status: string; order: any; user: any }>('/payment/check-status', {
      method: 'POST',
      body: { orderId },
    }),
};

// ============ 管理后台 ============

export const adminApi = {
  // 管理员登录
  login: (username: string, password: string) =>
    request<{ token: string; refreshToken: string; admin: any }>('/admin/login', {
      method: 'POST',
      body: { username, password },
    }),

  // 获取统计
  getStats: () =>
    request<{
      users: { total: number; active: number; banned: number; distribution: any };
      orders: { total: number; paid: number; totalRevenue: number };
      today: { newUsers: number; orders: number; revenue: number };
      userGrowth: { date: string; fullDate: string; users: number; newUsers: number }[];
    }>('/admin/stats'),

  // 获取用户列表
  getUsers: (params?: { page?: number; limit?: number; status?: string; level?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.status) queryParams.set('status', params.status);
    if (params?.level) queryParams.set('level', params.level);
    if (params?.search) queryParams.set('search', params.search);
    return request<{ users: any[]; total: number; page: number; limit: number }>(`/admin/users?${queryParams}`);
  },

  // 封禁/解封用户
  toggleBan: (userId: number, banned: boolean) =>
    request(`/admin/users/${userId}/ban`, {
      method: 'PUT',
      body: { banned },
    }),

  // 修改用户积分
  updatePoints: (userId: number, points: number, reason?: string) =>
    request(`/admin/users/${userId}/points`, {
      method: 'PUT',
      body: { points, reason },
    }),

  // 修改用户会员
  updateMembership: (userId: number, level: string, days?: number) =>
    request(`/admin/users/${userId}/membership`, {
      method: 'PUT',
      body: { level, days },
    }),

  // 获取订单列表
  getOrders: (params?: { page?: number; limit?: number; status?: string; date?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.status) queryParams.set('status', params.status);
    if (params?.date) queryParams.set('date', params.date);
    return request<{ orders: any[]; total: number }>(`/admin/orders?${queryParams}`);
  },

  // 修改订单状态
  updateOrderStatus: (orderId: number, status: string) =>
    request(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: { status },
    }),

  // 获取积分日志
  getPointLogs: (params?: { page?: number; limit?: number; userId?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.userId) queryParams.set('userId', String(params.userId));
    return request<{ logs: any[] }>(`/admin/point-logs?${queryParams}`);
  },

  // 获取用户评价
  getTestimonials: () => {
    return request<{ testimonials: any[] }>('/admin/content/testimonials');
  },

  // 获取系统设置
  getSettings: () => {
    return request<{ settings: any }>('/admin/settings');
  },

  // 更新系统设置
  updateSettings: (settings: any) => {
    return request('/admin/settings', {
      method: 'PUT',
      body: settings
    });
  },

  // 系统健康检查
  getHealth: () => {
    return request<{
      status: 'healthy' | 'warning' | 'critical';
      timestamp: string;
      uptime: number;
      services: {
        database: { status: string; latency: number; message: string };
        disk: { status: string; message: string };
      };
      memory: { used: number; total: number; unit: string };
      responseTime: number;
    }>('/admin/health');
  },

  // 重新生成 API 密钥
  regenerateApiKey: () => {
    return request<{ message: string; apiKey: string; createdAt: string }>('/admin/settings/api-key/regenerate', {
      method: 'POST'
    });
  },

  // 获取备份列表
  getBackups: () => {
    return request<{ backups: any[] }>('/admin/backups');
  },

  // 创建备份
  createBackup: (notes?: string) => {
    return request<{ message: string; backup: any }>('/admin/backups', {
      method: 'POST',
      body: { notes }
    });
  },

  // 恢复备份
  restoreBackup: (backupId: string) => {
    return request<{ success: boolean; message: string }>(`/admin/backups/${backupId}/restore`, {
      method: 'POST'
    });
  },

  // 删除备份
  deleteBackup: (backupId: string) => {
    return request<{ message: string }>(`/admin/backups/${backupId}`, {
      method: 'DELETE'
    });
  },
};
