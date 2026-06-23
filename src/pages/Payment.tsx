import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, CheckCircle, AlertCircle, CreditCard, 
  Crown, Zap, Calendar, ArrowLeft, ShieldCheck 
} from 'lucide-react';
import { paymentApi } from '../services/api';
import { useAuthStore } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';

const plans = {
  standard: {
    name: '标准会员',
    icon: Crown,
    color: 'from-pink-500 to-purple-500',
    monthlyPrice: 29,
    yearlyPrice: 209,
    features: ['每日10000字改写', '每日10000字降AI率', '基础+高级改写模式', '去除水印', '优先客服支持', '100积分/月']
  },
  professional: {
    name: '专业会员',
    icon: Zap,
    color: 'from-purple-500 to-indigo-500',
    monthlyPrice: 79,
    yearlyPrice: 569,
    features: ['无限次改写', '无限次降AI率', '全部改写模式', '去除水印', '专属客服支持', '优先处理队列', '500积分/月', '高级数据分析']
  }
};

export function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, refreshUser } = useAuthStore();
  
  const planId = searchParams.get('plan') as 'standard' | 'professional' | null;
  
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [payMethod, setPayMethod] = useState<'alipay' | 'wechat'>('alipay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'select' | 'confirm' | 'paying' | 'success'>('select');
  const [order, setOrder] = useState<any>(null);

  // 如果没有plan参数或无效，返回会员页面
  useEffect(() => {
    if (!planId || !plans[planId]) {
      navigate('/membership');
    }
  }, [planId, navigate]);

  const plan = planId ? plans[planId] : null;
  const price = plan ? (billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice) : 0;
  const duration = billingCycle === 'yearly' ? 365 : 30;

  // 创建订单
  const handleCreateOrder = async () => {
    if (!planId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await paymentApi.createOrder(planId, billingCycle);
      setOrder(response.order);
      setStep('confirm');
    } catch (err: any) {
      setError(err.message || '创建订单失败');
    } finally {
      setLoading(false);
    }
  };

  // 支付
  const handlePay = async () => {
    if (!order) return;
    
    setLoading(true);
    setError('');
    setStep('paying');
    
    try {
      const response = await paymentApi.payOrder(order.id, payMethod);
      
      // 刷新用户信息以获取最新会员状态
      await refreshUser();
      
      setStep('success');
    } catch (err: any) {
      setError(err.message || '支付失败');
      setStep('confirm');
    } finally {
      setLoading(false);
    }
  };

  if (!plan) return null;

  const PlanIcon = plan.icon;

  return (
    <div className="min-h-screen gradient-bg py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate('/membership')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          返回会员页面
        </button>

        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
            {step === 'success' ? '支付成功！' : '开通会员'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {step === 'success' ? '您的会员权益已生效' : '选择套餐，解锁全部高级功能'}
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* 步骤1：选择周期 */}
        {step === 'select' && (
          <GlassCard className="p-6">
            {/* 套餐信息 */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                <PlanIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{plan.name}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{plan.features[0]} 等 {plan.features.length} 项权益</p>
              </div>
            </div>

            {/* 计费周期选择 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                选择计费周期
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    billingCycle === 'monthly'
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800 dark:text-white">月付</span>
                    {billingCycle === 'monthly' && <CheckCircle className="w-5 h-5 text-pink-500" />}
                  </div>
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    ¥{plan.monthlyPrice}
                    <span className="text-sm font-normal text-gray-500">/月</span>
                  </div>
                </button>

                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                    billingCycle === 'yearly'
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
                  }`}
                >
                  <div className="absolute -top-3 left-4 px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full">
                    省40%
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800 dark:text-white">年付</span>
                    {billingCycle === 'yearly' && <CheckCircle className="w-5 h-5 text-pink-500" />}
                  </div>
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    ¥{plan.yearlyPrice}
                    <span className="text-sm font-normal text-gray-500">/年</span>
                  </div>
                  <div className="text-xs text-gray-400 line-through">
                    原价 ¥{plan.monthlyPrice * 12}
                  </div>
                </button>
              </div>
            </div>

            {/* 权益列表 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                会员权益
              </label>
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* 价格汇总 */}
            <div className="flex items-center justify-between py-4 border-t border-gray-200 dark:border-gray-700 mb-6">
              <span className="text-gray-600 dark:text-gray-400">应付金额</span>
              <span className="text-3xl font-bold text-pink-500">¥{price}</span>
            </div>

            {/* 下一步按钮 */}
            <button
              onClick={handleCreateOrder}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  确认订单
                </>
              )}
            </button>

            {/* 安全提示 */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4" />
              支付安全加密保护
            </div>
          </GlassCard>
        )}

        {/* 步骤2：确认支付 */}
        {step === 'confirm' && order && (
          <GlassCard className="p-6">
            {/* 订单信息 */}
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 dark:text-gray-400">订单编号</span>
                <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{order.orderNo}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 dark:text-gray-400">套餐类型</span>
                <span className="font-semibold text-gray-800 dark:text-white">{order.planName}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 dark:text-gray-400">计费周期</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {order.billingCycle === 'yearly' ? '年付' : '月付'} ({order.duration}天)
                </span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 font-medium">应付金额</span>
                <span className="text-3xl font-bold text-pink-500">¥{order.amount}</span>
              </div>
            </div>

            {/* 支付方式选择 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                选择支付方式
              </label>
              <div className="space-y-3">
                <button
                  onClick={() => setPayMethod('alipay')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                    payMethod === 'alipay'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.5 16.5h-9a1.5 1.5 0 01-1.5-1.5V9a1.5 1.5 0 011.5-1.5h9A1.5 1.5 0 0118 9v6a1.5 1.5 0 01-1.5 1.5z"/>
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-800 dark:text-white">支付宝</div>
                    <div className="text-xs text-gray-500">推荐使用</div>
                  </div>
                  {payMethod === 'alipay' && <CheckCircle className="w-5 h-5 text-blue-500" />}
                </button>

                <button
                  onClick={() => setPayMethod('wechat')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                    payMethod === 'wechat'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.5 13a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5.5 1c0 2.5-2.5 4.5-6 4.5-.7 0-1.4-.1-2-.2l-2 1.2.5-1.5C7.5 17 6 15.5 6 14c0-2.5 2.5-4.5 6-4.5s6 2 6 4.5z"/>
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-800 dark:text-white">微信支付</div>
                    <div className="text-xs text-gray-500">快捷支付</div>
                  </div>
                  {payMethod === 'wechat' && <CheckCircle className="w-5 h-5 text-green-500" />}
                </button>
              </div>
            </div>

            {/* 支付按钮 */}
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  支付处理中...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  立即支付 ¥{order.amount}
                </>
              )}
            </button>

            <button
              onClick={() => setStep('select')}
              disabled={loading}
              className="w-full mt-3 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              返回修改
            </button>
          </GlassCard>
        )}

        {/* 步骤3：支付中 */}
        {step === 'paying' && (
          <GlassCard className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">正在处理支付...</h2>
            <p className="text-gray-500 dark:text-gray-400">请稍候，正在确认您的支付状态</p>
          </GlassCard>
        )}

        {/* 步骤4：支付成功 */}
        {step === 'success' && (
          <GlassCard className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">支付成功！</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              恭喜您成为 {plan.name}，会员权益已立即生效
            </p>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-pink-500" />
                <span className="text-gray-600 dark:text-gray-400">会员有效期至</span>
              </div>
              <div className="text-lg font-semibold text-gray-800 dark:text-white pl-8">
                {user?.expireDate ? new Date(user.expireDate).toLocaleDateString('zh-CN') : '永久'}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/rewrite')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                开始使用
              </button>
              <button
                onClick={() => navigate('/membership')}
                className="w-full py-3.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                查看会员详情
              </button>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
