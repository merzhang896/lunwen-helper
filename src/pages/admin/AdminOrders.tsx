import { useState, useEffect } from 'react';
import { Search, Filter, Download, CheckCircle, Clock, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { adminApi } from '../../services/api';

export function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // 加载订单数据
  useEffect(() => {
    loadOrders();
  }, [statusFilter, dateFilter, page]);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminApi.getOrders({
        page,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
        date: dateFilter === 'all' ? undefined : dateFilter
      });
      setOrders(response.orders);
      setTotal(response.total);
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
      setError(err.message || '加载订单失败');
    } finally {
      setLoading(false);
    }
  };

  // 标准化订单数据，兼容新旧两种格式
  const normalizedOrders = orders.map(order => ({
    ...order,
    // 兼容新旧字段名
    orderId: order.orderId || order.orderNo || order.id,
    level: order.level || order.planId || 'free',
    paidAt: order.paidAt || order.payTime,
    amount: order.amount || 0
  }));

  const filteredOrders = normalizedOrders.filter(order => {
    const matchesSearch = order.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return { text: '已完成', class: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400', icon: CheckCircle };
      case 'pending':
        return { text: '处理中', class: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400', icon: Clock };
      case 'failed':
        return { text: '失败', class: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400', icon: XCircle };
      case 'refunded':
        return { text: '已退款', class: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400', icon: AlertCircle };
      case 'cancelled':
        return { text: '已取消', class: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400', icon: XCircle };
      default:
        return { text: status, class: 'bg-gray-100 text-gray-600', icon: AlertCircle };
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'alipay': return '💙';
      case 'wechat': return '💚';
      case 'card': return '💳';
      default: return '💰';
    }
  };

  // 统计数据（使用标准化后的数据）
  const stats = {
    totalOrders: total,
    totalAmount: normalizedOrders.filter(o => o.status === 'paid').reduce((sum, o) => sum + (o.amount || 0), 0),
    completedOrders: normalizedOrders.filter(o => o.status === 'paid').length,
    refundedOrders: normalizedOrders.filter(o => o.status === 'refunded').length,
  };

  // 导出订单为CSV文件
  const exportOrdersToCSV = async () => {
    try {
      // 获取所有订单数据
      const response = await adminApi.getOrders({ page: 1, limit: 1000 });
      const allOrders = response.orders;

      // 准备CSV内容
      const headers = ['订单号', '用户昵称', '邮箱', '套餐', '金额', '支付方式', '状态', '下单时间'];
      const rows = allOrders.map(order => [
        order.orderId || order.orderNo || order.id,
        order.nickname || '未知用户',
        order.email || '无邮箱',
        order.planName || (order.level === 'professional' ? '专业会员' : order.level === 'standard' ? '标准会员' : '免费用户'),
        order.amount || 0,
        order.payMethod === 'alipay' ? '支付宝' : order.payMethod === 'wechat' ? '微信支付' : order.payMethod || '其他',
        order.status === 'paid' ? '已支付' : order.status === 'pending' ? '待支付' : order.status === 'cancelled' ? '已取消' : order.status === 'refunded' ? '已退款' : order.status,
        new Date(order.createdAt).toLocaleString('zh-CN')
      ]);

      // 构建CSV内容
      const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
      
      // 添加BOM以支持中文
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // 下载文件
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `订单导出_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出订单失败:', error);
      alert('导出订单失败，请稍后重试');
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">订单管理</h1>
          <p className="text-gray-500 mt-1">查看和管理所有支付订单</p>
        </div>
        <button 
          onClick={exportOrdersToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
        >
          <Download className="w-4 h-4" />
          导出订单
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalOrders}</p>
          <p className="text-sm text-gray-500">总订单数</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-pink-500">¥{stats.totalAmount}</p>
          <p className="text-sm text-gray-500">总收入</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{stats.completedOrders}</p>
          <p className="text-sm text-gray-500">已完成</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-500">{stats.refundedOrders}</p>
          <p className="text-sm text-gray-500">已退款</p>
        </GlassCard>
      </div>

      {/* 筛选和搜索 */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索订单号或用户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-pink-500 outline-none transition-all text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-gray-700 outline-none text-sm"
          >
            <option value="all">全部状态</option>
            <option value="paid">已完成</option>
            <option value="pending">处理中</option>
            <option value="cancelled">已取消</option>
            <option value="refunded">已退款</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-gray-700 outline-none text-sm"
          >
            <option value="all">全部时间</option>
            <option value="today">今天</option>
            <option value="week">本周</option>
            <option value="month">本月</option>
          </select>
        </div>
      </GlassCard>

      {/* 订单列表 */}
      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">
            {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            暂无订单数据
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 bg-gray-50 dark:bg-white/5">
                    <th className="px-6 py-4 font-medium">订单号</th>
                    <th className="px-6 py-4 font-medium">用户</th>
                    <th className="px-6 py-4 font-medium">套餐</th>
                    <th className="px-6 py-4 font-medium">支付方式</th>
                    <th className="px-6 py-4 font-medium">金额</th>
                    <th className="px-6 py-4 font-medium">状态</th>
                    <th className="px-6 py-4 font-medium">下单时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                  {filteredOrders.map((order) => {
                    const statusBadge = getStatusBadge(order.status);
                    const StatusIcon = statusBadge.icon;
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-gray-600 dark:text-gray-400">{order.orderId}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">{order.nickname}</p>
                            <p className="text-sm text-gray-500">{order.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 dark:from-pink-900/30 dark:to-purple-900/30 dark:text-pink-400">
                            {order.level === 'professional' || order.level === '专业会员' ? '专业会员' : 
                             order.level === 'standard' || order.level === '标准会员' ? '标准会员' : 
                             order.planName || '免费用户'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg">{getPaymentIcon(order.payMethod)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-800 dark:text-white">¥{order.amount}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.class}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
              <p className="text-sm text-gray-500">显示 {filteredOrders.length} 条结果，共 {total} 条</p>
              <div className="flex gap-2">
                <button 
                  className="px-3 py-1 rounded-lg border border-gray-200 dark:border-white/10 text-sm text-gray-500" 
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  上一页
                </button>
                <button className="px-3 py-1 rounded-lg bg-pink-500 text-white text-sm">{page}</button>
                <button 
                  className="px-3 py-1 rounded-lg border border-gray-200 dark:border-white/10 text-sm text-gray-500"
                  disabled={filteredOrders.length < 20}
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
