import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, User, Shield, Ban, CheckCircle, Loader2 } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { adminApi } from '../../services/api';

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [membershipFilter, setMembershipFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // 加载用户数据
  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUsers({
        page,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
        level: membershipFilter === 'all' ? undefined : membershipFilter,
        search: searchTerm || undefined
      });
      setUsers(response.users);
      setTotal(response.total);
    } catch (error: any) {
      // 处理认证错误
      if (error.message.includes('认证已过期') || error.message.includes('无效的认证令牌')) {
        // 清除本地存储的令牌
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-user');
        localStorage.removeItem('refresh-token');
        // 跳转到登录页
        window.location.href = '/admin/login';
        return;
      }
      console.error('加载用户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和筛选条件变化时重新加载
  useEffect(() => {
    loadUsers();
  }, [page, searchTerm, membershipFilter, statusFilter]);

  const filteredUsers = users;

  const getMembershipBadge = (membership: string) => {
    switch (membership) {
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
        return { text: '正常', class: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' };
      case 'inactive':
        return { text: '不活跃', class: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' };
      case 'banned':
        return { text: '已封禁', class: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' };
      default:
        return { text: '未知', class: 'bg-gray-100 text-gray-600' };
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">用户管理</h1>
          <p className="text-gray-500 mt-1">管理平台注册用户，查看用户信息和状态</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
            导出数据
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{total}</p>
          <p className="text-sm text-gray-500">总用户数</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-pink-500">{users.filter(u => u.level !== 'free').length}</p>
          <p className="text-sm text-gray-500">付费用户</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{users.filter(u => u.status === 'active').length}</p>
          <p className="text-sm text-gray-500">活跃用户</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{users.filter(u => u.status === 'banned').length}</p>
          <p className="text-sm text-gray-500">封禁用户</p>
        </GlassCard>
      </div>

      {/* 筛选和搜索 */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap gap-4">
          {/* 搜索 */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索用户名或邮箱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-pink-500 outline-none transition-all text-sm"
            />
          </div>

          {/* 会员筛选 */}
          <select
            value={membershipFilter}
            onChange={(e) => setMembershipFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-gray-700 outline-none text-sm"
          >
            <option value="all">全部会员</option>
            <option value="professional">专业会员</option>
            <option value="standard">标准会员</option>
            <option value="free">免费用户</option>
          </select>

          {/* 状态筛选 */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-gray-700 outline-none text-sm"
          >
            <option value="all">全部状态</option>
            <option value="active">正常</option>
            <option value="inactive">不活跃</option>
            <option value="banned">已封禁</option>
          </select>
        </div>
      </GlassCard>

      {/* 用户列表 */}
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
                    <th className="px-6 py-4 font-medium">会员等级</th>
                    <th className="px-6 py-4 font-medium">积分余额</th>
                    <th className="px-6 py-4 font-medium">状态</th>
                    <th className="px-6 py-4 font-medium">注册时间</th>
                    <th className="px-6 py-4 font-medium">最后登录</th>
                    <th className="px-6 py-4 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => {
                      const membershipBadge = getMembershipBadge(user.level);
                      const statusBadge = getStatusBadge(user.status);
                      return (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                                {((user.nickname || '').charAt(0) || 'A').toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800 dark:text-white">{user.nickname}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${membershipBadge.class}`}>
                              {membershipBadge.text}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-amber-600">{user.points.toLocaleString()}</span>
                            <span className="text-gray-400 text-xs ml-1">积分</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.class}`}>
                              {statusBadge.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{user.createdAt}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{user.lastLogin}</td>
                          <td className="px-6 py-4">
                            <div className="relative group">
                              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              <div className="absolute right-0 top-full mt-1 py-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                                  <User className="w-4 h-4" />
                                  查看详情
                                </button>
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                                  <Shield className="w-4 h-4" />
                                  修改会员
                                </button>
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10">
                                  <CheckCircle className="w-4 h-4" />
                                  重置积分
                                </button>
                                <button className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${user.status === 'banned' ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10' : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10'}`}>
                                  <Ban className="w-4 h-4" />
                                  {user.status === 'banned' ? '解封账号' : '封禁账号'}
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
                        暂无用户数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
              <p className="text-sm text-gray-500">显示 {filteredUsers.length} 条结果，共 {total} 条</p>
              <div className="flex gap-2">
                <button 
                  className="px-3 py-1 rounded-lg border border-gray-200 dark:border-white/10 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  上一页
                </button>
                <button className="px-3 py-1 rounded-lg bg-pink-500 text-white text-sm">{page}</button>
                <button 
                  className="px-3 py-1 rounded-lg border border-gray-200 dark:border-white/10 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
                  disabled={filteredUsers.length < 20}
                  onClick={() => setPage(page + 1)}
                >
                  下一页
                </button>
              </div>
            </div>
          </>
        )}
      </GlassCard>
    </div>
  );
}
