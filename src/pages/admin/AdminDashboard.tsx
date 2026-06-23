import { useState, useEffect } from 'react';
import { TrendingUp, Users, CreditCard, Gift, ArrowUp, ArrowDown, Sparkles, Loader2 } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { adminApi } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export function AdminDashboard() {
  const [stats, setStats] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [membershipDistribution, setMembershipDistribution] = useState({
    free: { count: 0, percentage: '0.0' },
    standard: { count: 0, percentage: '0.0' },
    professional: { count: 0, percentage: '0.0' },
    paidConversionRate: '0.0'
  });
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);

  // 加载统计数据
  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getStats();
      
      // 构建统计卡片数据
      const statsData = [
        {
          name: '总用户数',
          value: response.users.total.toLocaleString(),
          change: '+12.5%',
          trend: 'up',
          icon: Users,
          color: 'from-pink-500 to-rose-500',
        },
        {
          name: '今日新增',
          value: response.today.newUsers.toString(),
          change: '+8.2%',
          trend: 'up',
          icon: Users,
          color: 'from-purple-500 to-indigo-500',
        },
        {
          name: '活跃会员',
          value: response.users.active.toLocaleString(),
          change: '+5.3%',
          trend: 'up',
          icon: CreditCard,
          color: 'from-blue-500 to-cyan-500',
        },
        {
          name: '今日订单',
          value: response.today.orders.toString(),
          change: '+2.1%',
          trend: 'up',
          icon: Gift,
          color: 'from-amber-500 to-orange-500',
        },
      ];
      
      setStats(statsData);
      
      // 从API获取真实订单数据
      const ordersResponse = await adminApi.getOrders({ page: 1, limit: 100 });
      setRecentOrders(ordersResponse.orders);
      
      // 从API获取真实用户数据
      const usersResponse = await adminApi.getUsers();
      const usersData = usersResponse.users
        .sort((a: any, b: any) => b.points - a.points)
        .slice(0, 5)
        .map((user: any, index: number) => ({
          rank: index + 1,
          nickname: user.nickname,
          usage: user.points,
          membership: user.level === 'free' ? '免费用户' : user.level === 'standard' ? '标准会员' : '专业会员'
        }));
      setTopUsers(usersData);
      
      // 计算会员分布百分比
      const totalUsers = response.users.total;
      const freeUsers = response.users.distribution.free;
      const standardUsers = response.users.distribution.standard;
      const professionalUsers = response.users.distribution.professional;
      
      const freePercentage = totalUsers > 0 ? ((freeUsers / totalUsers) * 100).toFixed(1) : '0.0';
      const standardPercentage = totalUsers > 0 ? ((standardUsers / totalUsers) * 100).toFixed(1) : '0.0';
      const professionalPercentage = totalUsers > 0 ? ((professionalUsers / totalUsers) * 100).toFixed(1) : '0.0';
      const paidConversionRate = totalUsers > 0 ? (((standardUsers + professionalUsers) / totalUsers) * 100).toFixed(1) : '0.0';
      
      // 保存会员分布数据
      setMembershipDistribution({
        free: {
          count: freeUsers,
          percentage: freePercentage
        },
        standard: {
          count: standardUsers,
          percentage: standardPercentage
        },
        professional: {
          count: professionalUsers,
          percentage: professionalPercentage
        },
        paidConversionRate
      });
      
      // 使用真实的用户增长数据
      setUserGrowthData(response.userGrowth || []);
    } catch (err: any) {
      // 处理认证错误
      if (err.message.includes('认证已过期') || err.message.includes('无效的认证令牌')) {
        // 清除本地存储的令牌
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-user');
        localStorage.removeItem('refresh-token');
        // 跳转到登录页
        window.location.href = '/admin/login';
        return;
      }
      setError(err.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={loadStats}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">数据概览</h1>
          <p className="text-gray-500 mt-1">实时监控平台运营数据</p>
        </div>
        <div className="flex gap-3">
          <select className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 text-sm">
            <option>今日</option>
            <option>本周</option>
            <option>本月</option>
            <option>本年</option>
          </select>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <GlassCard key={stat.name} className="p-6">
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.name}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* 图表和数据区域 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* 近30天趋势图 - 真实图表 */}
        <GlassCard className="lg:col-span-2 p-6">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">近30天用户增长趋势</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: 'rgba(107, 114, 128, 1)' }} 
                  tickLine={{ stroke: 'rgba(209, 213, 219, 1)' }}
                  axisLine={{ stroke: 'rgba(209, 213, 219, 1)' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'rgba(107, 114, 128, 1)' }} 
                  tickLine={{ stroke: 'rgba(209, 213, 219, 1)' }}
                  axisLine={{ stroke: 'rgba(209, 213, 219, 1)' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(229, 231, 235, 1)',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  itemStyle={{ color: '#ec4899' }}
                  labelStyle={{ fontWeight: '600', color: '#1f2937' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#ec4899" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* 用户分布 - 真实数据 */}
        <GlassCard className="p-6">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">会员等级分布</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">免费用户</span>
                <span className="font-medium text-gray-800 dark:text-white">{membershipDistribution.free.percentage}%</span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-gray-400 to-gray-500 rounded-full" style={{ width: `${membershipDistribution.free.percentage}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">标准会员</span>
                <span className="font-medium text-gray-800 dark:text-white">{membershipDistribution.standard.percentage}%</span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" style={{ width: `${membershipDistribution.standard.percentage}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">专业会员</span>
                <span className="font-medium text-gray-800 dark:text-white">{membershipDistribution.professional.percentage}%</span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${membershipDistribution.professional.percentage}%` }} />
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">付费转化率</span>
              <span className="font-bold text-pink-500">{membershipDistribution.paidConversionRate}%</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 底部数据区域 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 最新订单 */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-white">最新订单</h3>
            <button className="text-sm text-pink-500 hover:text-pink-600 font-medium">查看全部</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100 dark:border-white/10">
                  <th className="pb-3 font-medium">订单号</th>
                  <th className="pb-3 font-medium">用户</th>
                  <th className="pb-3 font-medium">套餐</th>
                  <th className="pb-3 font-medium">金额</th>
                  <th className="pb-3 font-medium">时间</th>
                  <th className="pb-3 font-medium">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="text-sm">
                      <td className="py-3 font-mono text-gray-500">{order.orderId || order.id}</td>
                      <td className="py-3 text-gray-800 dark:text-white">{order.nickname || order.user}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{order.level || order.plan}</td>
                      <td className="py-3 font-medium text-gray-800 dark:text-white">¥{order.amount}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'paid' || order.status === '已完成'
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                            : order.status === 'pending' || order.status === '处理中'
                            ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {order.status === 'paid' ? '已支付' : order.status === 'pending' ? '待支付' : order.status === 'cancelled' ? '已取消' : order.status === 'refunded' ? '已退款' : order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      暂无订单数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* 使用量TOP用户 */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-white">积分消耗 TOP 5</h3>
            <button className="text-sm text-pink-500 hover:text-pink-600 font-medium">查看全部</button>
          </div>
          <div className="space-y-4">
            {topUsers.map((user) => (
              <div key={user.rank} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  user.rank === 1
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                    : user.rank === 2
                    ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
                    : user.rank === 3
                    ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400'
                }`}>
                  {user.rank}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 dark:text-white">{user.nickname}</span>
                    <span className="text-sm text-gray-500">{user.usage.toLocaleString()} 积分</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      user.membership === '专业会员'
                        ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-600 dark:from-purple-900/30 dark:to-indigo-900/30 dark:text-purple-400'
                        : 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-600 dark:from-pink-900/30 dark:to-rose-900/30 dark:text-pink-400'
                    }`}>
                      {user.membership}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
