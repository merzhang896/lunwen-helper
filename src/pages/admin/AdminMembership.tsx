import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Crown, Calendar, Check, X, Loader2 } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { adminApi } from '../../services/api';

export function AdminMembership() {
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // 加载会员数据
  const loadMemberships = async () => {
    setLoading(true);
    try {
      // 从用户列表获取会员信息
      const usersResponse = await adminApi.getUsers();
      const users = usersResponse.users;
      
      // 构建会员数据
      const membershipData = users.map(user => {
        let status = 'active';
        if (user.expireDate) {
          const expireDate = new Date(user.expireDate);
          if (expireDate < new Date()) {
            status = 'expired';
          }
        }
        
        return {
          id: user.id,
          userId: user.id,
          user: user.nickname,
          email: user.email,
          plan: user.level,
          status: status,
          startDate: user.createdAt.split('T')[0],
          expireDate: user.expireDate ? user.expireDate.split('T')[0] : '永久',
          autoRenew: false
        };
      }).filter(m => m.plan !== 'free'); // 只显示付费会员
      
      setMemberships(membershipData);
    } catch (error) {
      console.error('加载会员数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    loadMemberships();
  }, []);

  const filteredMemberships = memberships.filter(m => {
    const matchesSearch = m.user.toLowerCase().includes(searchTerm.toLowerCase()) || m.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === 'all' || m.plan === planFilter;
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'professional':
        return { text: '专业会员', class: 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-600 dark:from-purple-900/30 dark:to-indigo-900/30 dark:text-purple-400' };
      case 'standard':
        return { text: '标准会员', class: 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-600 dark:from-pink-900/30 dark:to-rose-900/30 dark:text-pink-400' };
      default:
        return { text: '免费用户', class: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { text: '生效中', class: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' };
      case 'expired':
        return { text: '已过期', class: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' };
      case 'cancelled':
        return { text: '已取消', class: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400' };
      default:
        return { text: '未知', class: 'bg-gray-100 text-gray-600' };
    }
  };

  // 统计数据
  const stats = {
    total: memberships.length,
    active: memberships.filter(m => m.status === 'active').length,
    expired: memberships.filter(m => m.status === 'expired').length,
    professional: memberships.filter(m => m.plan === 'professional').length,
    standard: memberships.filter(m => m.plan === 'standard').length,
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">会员管理</h1>
          <p className="text-gray-500 mt-1">管理用户会员订阅状态和权限</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-5 gap-4">
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
          <p className="text-sm text-gray-500">总订阅数</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{stats.active}</p>
          <p className="text-sm text-gray-500">生效中</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-yellow-500">{stats.expired}</p>
          <p className="text-sm text-gray-500">已过期</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-purple-500">{stats.professional}</p>
          <p className="text-sm text-gray-500">专业会员</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-pink-500">{stats.standard}</p>
          <p className="text-sm text-gray-500">标准会员</p>
        </GlassCard>
      </div>

      {/* 筛选和搜索 */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索用户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-pink-500 outline-none transition-all text-sm"
            />
          </div>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-gray-700 outline-none text-sm"
          >
            <option value="all">全部套餐</option>
            <option value="professional">专业会员</option>
            <option value="standard">标准会员</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-gray-700 outline-none text-sm"
          >
            <option value="all">全部状态</option>
            <option value="active">生效中</option>
            <option value="expired">已过期</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>
      </GlassCard>

      {/* 会员列表 */}
      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="p-20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 bg-gray-50 dark:bg-white/5">
                    <th className="px-6 py-4 font-medium">用户</th>
                    <th className="px-6 py-4 font-medium">会员套餐</th>
                    <th className="px-6 py-4 font-medium">状态</th>
                    <th className="px-6 py-4 font-medium">开始日期</th>
                    <th className="px-6 py-4 font-medium">到期日期</th>
                    <th className="px-6 py-4 font-medium">自动续费</th>
                    <th className="px-6 py-4 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                  {filteredMemberships.length > 0 ? (
                    filteredMemberships.map((membership) => {
                      const planBadge = getPlanBadge(membership.plan);
                      const statusBadge = getStatusBadge(membership.status);
                      return (
                        <tr key={membership.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-800 dark:text-white">{membership.user}</p>
                              <p className="text-sm text-gray-500">{membership.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${planBadge.class}`}>
                              {planBadge.text}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.class}`}>
                              {statusBadge.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{membership.startDate}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{membership.expireDate}</td>
                          <td className="px-6 py-4">
                            {membership.autoRenew ? (
                              <span className="flex items-center gap-1 text-green-500 text-sm">
                                <Check className="w-4 h-4" /> 已开启
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-gray-400 text-sm">
                                <X className="w-4 h-4" /> 未开启
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="relative group">
                              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              <div className="absolute right-0 top-full mt-1 py-2 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                                  <Crown className="w-4 h-4" />
                                  升级会员
                                </button>
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                                  <Calendar className="w-4 h-4" />
                                  延长会员
                                </button>
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
                                  <X className="w-4 h-4" />
                                  取消会员
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        暂无会员数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
              <p className="text-sm text-gray-500">显示 {filteredMemberships.length} 条结果</p>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded-lg border border-gray-200 dark:border-white/10 text-sm text-gray-500" disabled>上一页</button>
                <button className="px-3 py-1 rounded-lg bg-pink-500 text-white text-sm">1</button>
                <button className="px-3 py-1 rounded-lg border border-gray-200 dark:border-white/10 text-sm text-gray-500">下一页</button>
              </div>
            </div>
          </>
        )}
      </GlassCard>
    </div>
  );
}
