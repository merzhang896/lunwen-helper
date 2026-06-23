import { useState, useEffect } from 'react';
import { Search, Gift, Plus, Minus, History, AlertCircle, Loader2 } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { adminApi } from '../../services/api';

export function AdminPoints() {
  const [users, setUsers] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  // 加载用户和积分历史数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // 加载用户列表
      const usersResponse = await adminApi.getUsers();
      setUsers(usersResponse.users);

      // 加载积分日志
      const pointLogsResponse = await adminApi.getPointLogs({ limit: 50 });
      setHistory(pointLogsResponse.logs);
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

  const filteredUsers = users.filter(user =>
    user.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPoints = users.reduce((sum, u) => sum + u.points, 0);
  const totalConsumed = history.filter(h => h.type === 'deduct').reduce((sum, h) => sum + h.amount, 0);

  const handleAdjust = async () => {
    if (!selectedUser || !adjustAmount || !adjustReason) return;
    
    setLoading(true);
    setError('');
    
    try {
      const user = users.find(u => u.id === selectedUser);
      if (!user) {
        setError('用户不存在');
        setLoading(false);
        return;
      }
      
      const newPoints = adjustType === 'add' 
        ? user.points + Number(adjustAmount) 
        : Math.max(0, user.points - Number(adjustAmount));
      
      await adminApi.updatePoints(Number(selectedUser), newPoints, adjustReason);
      
      // 重新加载数据
      await loadData();
      
      // 关闭弹窗并清空表单
      setShowAddModal(false);
      setSelectedUser(null);
      setAdjustAmount('');
      setAdjustReason('');
    } catch (err: any) {
      setError(err.message || '调整积分失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">积分管理</h1>
          <p className="text-gray-500 mt-1">管理用户积分余额和积分记录</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{totalPoints.toLocaleString()}</p>
          <p className="text-sm text-gray-500">平台总积分</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-pink-500">{totalConsumed.toLocaleString()}</p>
          <p className="text-sm text-gray-500">累计消耗</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{users.filter(u => u.points > 1000).length}</p>
          <p className="text-sm text-gray-500">高积分用户</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-purple-500">{users.filter(u => u.points < 100).length}</p>
          <p className="text-sm text-gray-500">低积分用户</p>
        </GlassCard>
      </div>

      {/* 积分记录 */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-pink-500" />
          <h3 className="font-semibold text-gray-800 dark:text-white">最近积分变动</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100 dark:border-white/10">
                <th className="pb-3 font-medium">用户</th>
                <th className="pb-3 font-medium">变动</th>
                <th className="pb-3 font-medium">原因</th>
                <th className="pb-3 font-medium">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {history.map((item) => (
                <tr key={item.id} className="text-sm">
                  <td className="py-3 text-gray-800 dark:text-white">{item.nickname}</td>
                  <td className="py-3">
                    <span className={`font-bold ${item.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {item.amount > 0 ? '+' : ''}{item.amount}
                    </span>
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{item.reason}</td>
                  <td className="py-3 text-gray-500">{item.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* 用户积分列表 */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-white">用户积分余额</h3>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索用户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-pink-500 outline-none transition-all text-sm"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100 dark:border-white/10">
                <th className="pb-3 font-medium">用户</th>
                <th className="pb-3 font-medium">会员等级</th>
                <th className="pb-3 font-medium">当前积分</th>
                <th className="pb-3 font-medium">累计消耗</th>
                <th className="pb-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="text-sm">
                  <td className="py-4">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{user.nickname}</p>
                      <p className="text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.level === 'professional'
                        ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-600 dark:from-purple-900/30 dark:to-indigo-900/30 dark:text-purple-400'
                        : user.level === 'standard'
                        ? 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-600 dark:from-pink-900/30 dark:to-rose-900/30 dark:text-pink-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'
                    }`}>
                      {user.level === 'professional' ? '专业会员' : user.level === 'standard' ? '标准会员' : '免费用户'}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="font-bold text-amber-500">{user.points.toLocaleString()}</span>
                  </td>
                  <td className="py-4 text-gray-600 dark:text-gray-400">
                    0
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedUser(user.id); setAdjustType('add'); setShowAddModal(true); }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 text-xs font-medium dark:bg-green-900/20 dark:text-green-400"
                      >
                        <Plus className="w-3 h-3" />
                        充值
                      </button>
                      <button
                        onClick={() => { setSelectedUser(user.id); setAdjustType('subtract'); setShowAddModal(true); }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 text-xs font-medium dark:bg-red-900/20 dark:text-red-400"
                      >
                        <Minus className="w-3 h-3" />
                        扣除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* 调整积分弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <GlassCard className="w-full max-w-md p-6 m-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              {adjustType === 'add' ? '充值积分' : '扣除积分'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  积分数量
                </label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="请输入积分数量"
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-pink-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  原因
                </label>
                <textarea
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="请输入操作原因"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-pink-500 outline-none resize-none"
                />
              </div>
              {adjustType === 'subtract' && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    扣除积分可能导致用户无法正常使用服务，请谨慎操作。
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/20 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-white/5"
              >
                取消
              </button>
              <button
                onClick={handleAdjust}
                disabled={!adjustAmount || !adjustReason || loading}
                className={`flex-1 py-3 rounded-xl font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  adjustType === 'add'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/30'
                    : 'bg-gradient-to-r from-red-500 to-rose-500 hover:shadow-lg hover:shadow-red-500/30'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>确认{adjustType === 'add' ? '充值' : '扣除'}</>
                )}
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
