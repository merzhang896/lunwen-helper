import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, Gift, FileText, Settings,
  LogOut, Menu, X, ChevronDown, Bell, Search, Sparkles, BarChart3,
  Clock, Shield, Database, Activity, Sun, Moon, Loader2, CheckCircle2, User,
  ChevronRight, Server, HardDrive, Cpu, MemoryStick, Network, XCircle
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { adminApi } from '../services/api';

const menuItems = [
  { path: '/admin', icon: LayoutDashboard, label: '数据概览', badge: null },
  { path: '/admin/users', icon: Users, label: '用户管理', badge: null },
  { path: '/admin/membership', icon: CreditCard, label: '会员管理', badge: null },
  { path: '/admin/orders', icon: CreditCard, label: '订单管理', badge: null },
  { path: '/admin/points', icon: Gift, label: '积分管理', badge: null },
  { path: '/admin/content', icon: FileText, label: '内容管理', badge: null },
  { path: '/admin/settings', icon: Settings, label: '系统设置', badge: null },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, banned: 0, distribution: { free: 0, standard: 0, professional: 0 } },
    orders: { total: 0, paid: 0, totalRevenue: 0 },
    processes: { total: 0, today: 0 },
    today: { newUsers: 0, orders: 0, revenue: 0 }
  });
  const [loading, setLoading] = useState(false);
  
  // 系统健康状态
  const [systemHealth, setSystemHealth] = useState<{
    status: 'healthy' | 'warning' | 'critical';
    message: string;
    timestamp: string;
    uptime: number;
    responseTime: number;
    memory: { used: number; total: number; unit: string };
    services: {
      database: { status: string; latency: number; message: string };
      disk: { status: string; message: string };
    };
  }>({
    status: 'healthy',
    message: '所有服务运行中',
    timestamp: new Date().toISOString(),
    uptime: 0,
    responseTime: 0,
    memory: { used: 0, total: 0, unit: 'MB' },
    services: {
      database: { status: 'healthy', latency: 0, message: '数据库连接正常' },
      disk: { status: 'healthy', message: '存储空间充足' }
    }
  });
  const [healthLoading, setHealthLoading] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [admin, setAdmin] = useState({
    nickname: '超级管理员',
    email: 'admin@bunny.com',
    avatar: null,
    role: 'super_admin'
  });
  
  // 通知状态管理
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'system',
      title: '系统通知',
      content: '系统已完成每日更新，所有服务正常运行',
      time: '10分钟前',
      read: false
    },
    {
      id: '2',
      type: 'user',
      title: '新用户注册',
      content: '用户 test@example.com 已成功注册',
      time: '30分钟前',
      read: false
    },
    {
      id: '3',
      type: 'order',
      title: '订单完成',
      content: '用户 学术达人 已完成会员升级订单',
      time: '1小时前',
      read: false
    },
    {
      id: '4',
      type: 'system',
      title: '备份完成',
      content: '系统数据库备份已完成',
      time: '2小时前',
      read: true
    },
    {
      id: '5',
      type: 'order',
      title: '订单取消',
      content: '用户 SAXCS 取消了会员升级订单',
      time: '3小时前',
      read: true
    }
  ]);
  
  // 显示历史通知
  const [showHistory, setShowHistory] = useState(false);

  // 认证检查
  useEffect(() => {
    const token = localStorage.getItem('admin-token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    // 从localStorage获取管理员信息
    const adminStr = localStorage.getItem('admin-user');
    if (adminStr) {
      try {
        const adminData = JSON.parse(adminStr);
        setAdmin(adminData);
      } catch (error) {
        console.error('解析管理员信息失败:', error);
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-user');
        localStorage.removeItem('refresh-token');
        navigate('/admin/login');
      }
    } else {
      // 没有管理员信息，跳转到登录页
      localStorage.removeItem('admin-token');
      localStorage.removeItem('refresh-token');
      navigate('/admin/login');
    }
  }, [navigate]);

  // 处理退出登录
  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-user');
    localStorage.removeItem('refresh-token');
    window.location.href = '/admin/login';
  };

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 加载统计数据
  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getStats();
      setStats({
        users: response.users || { total: 0, active: 0, banned: 0, distribution: { free: 0, standard: 0, professional: 0 } },
        orders: response.orders || { total: 0, paid: 0, totalRevenue: 0 },
        processes: { total: 0, today: 0 },
        today: response.today || { newUsers: 0, orders: 0, revenue: 0 }
      });
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载系统健康状态
  const loadHealth = async () => {
    setHealthLoading(true);
    try {
      const response = await adminApi.getHealth();

      let message = '所有服务运行中';
      if (response.status === 'warning') {
        message = '部分服务异常';
      } else if (response.status === 'critical') {
        message = '系统服务异常';
      }

      setSystemHealth({
        status: response.status,
        message,
        timestamp: response.timestamp,
        uptime: response.uptime,
        responseTime: response.responseTime,
        memory: response.memory,
        services: response.services
      });
    } catch (error) {
      console.error('加载健康状态失败:', error);
      setSystemHealth({
        status: 'critical',
        message: '无法连接服务器',
        timestamp: new Date().toISOString(),
        uptime: 0,
        responseTime: 0,
        memory: { used: 0, total: 0, unit: 'MB' },
        services: {
          database: { status: 'unhealthy', latency: 0, message: '连接失败' },
          disk: { status: 'unknown', message: '无法检测' }
        }
      });
    } finally {
      setHealthLoading(false);
    }
  };

  // 初始加载和路径变化时加载数据
  useEffect(() => {
    if (location.pathname === '/admin') {
      loadStats();
      loadHealth();
    }
  }, [location.pathname]);
  
  // 定时刷新健康状态（每3秒）
  useEffect(() => {
    const interval = setInterval(() => {
      if (location.pathname.startsWith('/admin')) {
        loadHealth();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  // 处理主题切换
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };
  
  // 一键已读功能
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({
        ...notification,
        read: true
      }))
    );
  };
  
  // 标记单个通知为已读
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  // 查看历史通知
  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  // 获取当前页面标题
  const getPageTitle = () => {
    const path = location.pathname;
    const menuItem = menuItems.find(item => item.path === path);
    return menuItem ? menuItem.label : '管理后台';
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex ${isDarkMode ? 'dark' : ''}`}>
      {/* 侧边栏 */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-white/10 flex flex-col transition-all duration-300 fixed h-full z-20 shadow-md`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-white/10 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <Link to="/admin" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
                管理后台
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-colors"
            title={sidebarOpen ? '收起侧边栏' : '展开侧边栏'}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* 菜单 */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 relative ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="font-medium flex-1">{item.label}</span>
                )}
                {item.badge && sidebarOpen && (
                  <span className="absolute right-3 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* 底部用户信息 */}
        <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-md">
                {((admin.nickname || '').charAt(0) || 'A').toUpperCase()}
              </div>
              {sidebarOpen && (
                <>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-800 dark:text-white text-sm">{admin.nickname}</p>
                    <p className="text-xs text-gray-500">{admin.role === 'super_admin' ? '超级管理员' : '管理员'}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-300" />
                </>
              )}
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 animate-fade-in">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  返回前台
                </Link>
                <button 
                  onClick={toggleDarkMode}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors w-full text-left"
                >
                  {isDarkMode ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                  {isDarkMode ? '浅色模式' : '深色模式'}
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 min-h-screen`}>
        {/* 顶部栏 */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-white/10 sticky top-0 z-10 shadow-sm">
          <div className="h-full px-6 flex items-center justify-between">
            {/* 左侧：面包屑和标题 */}
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">{getPageTitle()}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Link to="/admin" className="hover:text-pink-500 transition-colors">首页</Link>
                  <span>/</span>
                  <span className="text-gray-400">{getPageTitle()}</span>
                </div>
              </div>
            </div>

            {/* 右侧 */}
            <div className="flex items-center gap-4">
              {/* 搜索 */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索用户、订单、内容..."
                  className="pl-10 pr-4 py-2 w-80 rounded-xl bg-gray-100 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-pink-500 outline-none transition-all text-sm"
                />
              </div>

              {/* 通知 */}
              <div className="relative group">
                <button className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-colors">
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>
                {/* 通知下拉菜单 */}
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 dark:text-white">通知中心</h3>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-pink-500 hover:text-pink-600 font-medium"
                      >
                        一键已读
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {/* 通知项 */}
                    {notifications
                      .filter(n => showHistory || !n.read)
                      .map(notification => {
                        let IconComponent = CheckCircle2;
                        let bgColor = 'bg-green-100 dark:bg-green-900/20';
                        let textColor = 'text-green-500';
                        
                        if (notification.type === 'user') {
                          IconComponent = User;
                          bgColor = 'bg-blue-100 dark:bg-blue-900/20';
                          textColor = 'text-blue-500';
                        } else if (notification.type === 'order') {
                          IconComponent = CreditCard;
                          bgColor = 'bg-purple-100 dark:bg-purple-900/20';
                          textColor = 'text-purple-500';
                        }
                        
                        return (
                          <div 
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                              !notification.read ? 'bg-pink-50/50 dark:bg-pink-900/10' : ''
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
                                <IconComponent className={`w-4 h-4 ${textColor}`} />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800 dark:text-white mb-1">{notification.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{notification.content}</p>
                                <p className="text-xs text-gray-400">{notification.time}</p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                              )}
                            </div>
                          </div>
                        );
                      })
                    }
                    {notifications.filter(n => showHistory || !n.read).length === 0 && (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                        {showHistory ? '暂无历史通知' : '暂无新通知'}
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                    <button 
                      onClick={toggleHistory}
                      className="text-sm text-pink-500 hover:text-pink-600 font-medium"
                    >
                      {showHistory ? '查看新通知' : '查看历史通知'}
                    </button>
                    <span className="text-xs text-gray-500">
                      未读: {notifications.filter(n => !n.read).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* 系统状态 */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-700 dark:text-green-400">系统正常</span>
              </div>

              {/* 时间 */}
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{currentTime.toLocaleTimeString('zh-CN')}</span>
              </div>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="p-6">
          {/* 系统概览卡片 */}
          {location.pathname === '/admin' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <GlassCard 
                className="p-6 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group"
                onClick={() => navigate('/admin/users')}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">总用户数</h3>
                  <Users className="w-5 h-5 text-pink-500" />
                </div>
                {loading ? (
                  <div className="flex items-center justify-center h-12">
                    <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.users.total.toLocaleString()}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-green-500 text-sm flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        <span>2.5% 增长</span>
                      </p>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-pink-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </>
                )}
              </GlassCard>
              
              <GlassCard 
                className="p-6 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group"
                onClick={() => navigate('/admin/orders')}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">今日订单</h3>
                  <CreditCard className="w-5 h-5 text-purple-500" />
                </div>
                {loading ? (
                  <div className="flex items-center justify-center h-12">
                    <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.today.orders}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-green-500 text-sm flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        <span>12.8% 增长</span>
                      </p>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </>
                )}
              </GlassCard>
              
              <GlassCard 
                className="p-6 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group"
                onClick={() => navigate('/admin/orders')}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">总收入</h3>
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                </div>
                {loading ? (
                  <div className="flex items-center justify-center h-12">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">¥{stats.orders.totalRevenue.toLocaleString()}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-green-500 text-sm flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        <span>8.3% 增长</span>
                      </p>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </>
                )}
              </GlassCard>
              
              <GlassCard
                className="p-6 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group"
                onClick={() => setShowHealthModal(true)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">系统状态</h3>
                  <Database className={`w-5 h-5 ${
                    systemHealth.status === 'healthy' ? 'text-green-500' :
                    systemHealth.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                  }`} />
                </div>
                {healthLoading ? (
                  <div className="flex items-center justify-center h-12">
                    <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
                  </div>
                ) : (
                  <>
                    <p className={`text-3xl font-bold ${
                      systemHealth.status === 'healthy' ? 'text-gray-800 dark:text-white' :
                      systemHealth.status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {systemHealth.status === 'healthy' ? '正常' :
                       systemHealth.status === 'warning' ? '警告' : '异常'}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className={`text-sm flex items-center gap-1 ${
                        systemHealth.status === 'healthy' ? 'text-green-500' :
                        systemHealth.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        <Shield className="w-3 h-3" />
                        <span>{systemHealth.message}</span>
                      </p>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                    </div>
                    {/* 服务详情 */}
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/10 space-y-1">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          systemHealth.services.database.status === 'healthy' ? 'bg-green-500' :
                          systemHealth.services.database.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        {systemHealth.services.database.message}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          systemHealth.services.disk.status === 'healthy' ? 'bg-green-500' :
                          systemHealth.services.disk.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        {systemHealth.services.disk.message}
                      </p>
                    </div>
                  </>
                )}
              </GlassCard>
            </div>
          )}
          
          <Outlet />
        </main>
      </div>

      {/* 系统状态详情弹窗 */}
      {showHealthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-fade-in">
            {/* 弹窗头部 */}
            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  systemHealth.status === 'healthy' ? 'bg-green-100 dark:bg-green-900/20' :
                  systemHealth.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-red-100 dark:bg-red-900/20'
                }`}>
                  <Server className={`w-6 h-6 ${
                    systemHealth.status === 'healthy' ? 'text-green-500' :
                    systemHealth.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                  }`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">系统状态监控</h2>
                  <p className="text-sm text-gray-500">
                    最后更新: {new Date(systemHealth.timestamp).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHealthModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* 总体状态 */}
              <div className={`p-4 rounded-xl mb-6 ${
                systemHealth.status === 'healthy' ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30' :
                systemHealth.status === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30' :
                'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${
                    systemHealth.status === 'healthy' ? 'bg-green-500' :
                    systemHealth.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className={`font-medium ${
                    systemHealth.status === 'healthy' ? 'text-green-700 dark:text-green-400' :
                    systemHealth.status === 'warning' ? 'text-yellow-700 dark:text-yellow-400' :
                    'text-red-700 dark:text-red-400'
                  }`}>
                    {systemHealth.message}
                  </span>
                </div>
              </div>

              {/* 服务状态网格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* 数据库服务 */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <Database className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-800 dark:text-white">数据库服务</span>
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
                      systemHealth.services.database.status === 'healthy'
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                        : systemHealth.services.database.status === 'warning'
                        ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {systemHealth.services.database.status === 'healthy' ? '正常' :
                       systemHealth.services.database.status === 'warning' ? '警告' : '异常'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {systemHealth.services.database.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    响应延迟: {systemHealth.services.database.latency}ms
                  </p>
                </div>

                {/* 存储空间 */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <HardDrive className="w-5 h-5 text-purple-500" />
                    <span className="font-medium text-gray-800 dark:text-white">存储空间</span>
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
                      systemHealth.services.disk.status === 'healthy'
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                        : systemHealth.services.disk.status === 'warning'
                        ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {systemHealth.services.disk.status === 'healthy' ? '正常' :
                       systemHealth.services.disk.status === 'warning' ? '警告' : '异常'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {systemHealth.services.disk.message}
                  </p>
                </div>

                {/* 内存使用 */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <MemoryStick className="w-5 h-5 text-pink-500" />
                    <span className="font-medium text-gray-800 dark:text-white">内存使用</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {systemHealth.memory.used} {systemHealth.memory.unit} / {systemHealth.memory.total} {systemHealth.memory.unit}
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      {systemHealth.memory.total > 0
                        ? Math.round((systemHealth.memory.used / systemHealth.memory.total) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${systemHealth.memory.total > 0
                          ? (systemHealth.memory.used / systemHealth.memory.total) * 100
                          : 0}%`
                      }}
                    />
                  </div>
                </div>

                {/* 响应时间 */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <Network className="w-5 h-5 text-cyan-500" />
                    <span className="font-medium text-gray-800 dark:text-white">API 响应时间</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {systemHealth.responseTime}ms
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {systemHealth.responseTime < 100 ? '响应迅速' :
                     systemHealth.responseTime < 300 ? '响应正常' : '响应较慢'}
                  </p>
                </div>
              </div>

              {/* 系统运行时间 */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span className="font-medium text-gray-800 dark:text-white">系统运行时间</span>
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {Math.floor(systemHealth.uptime / 3600)}小时 {Math.floor((systemHealth.uptime % 3600) / 60)}分钟
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  自上次重启以来
                </p>
              </div>
            </div>

            {/* 弹窗底部 */}
            <div className="p-6 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
              <button
                onClick={loadHealth}
                disabled={healthLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors disabled:opacity-50"
              >
                <Loader2 className={`w-4 h-4 ${healthLoading ? 'animate-spin' : ''}`} />
                刷新状态
              </button>
              <button
                onClick={() => setShowHealthModal(false)}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
