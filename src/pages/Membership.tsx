import { Link } from 'react-router-dom';
import { Check, Sparkles, Crown, Zap, User, Calendar, Coins } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useAuthStore } from '../context/AuthContext';

const plans = [
  {
    id: 'free',
    name: '免费版',
    icon: Sparkles,
    price: 0,
    period: '永久',
    description: '适合轻度使用，体验核心功能',
    features: [
      '每日2000字免费改写',
      '每日2000字降AI率',
      '基础改写模式',
      '支持知网检测格式',
      '社区支持',
    ],
    limitations: [
      '无法使用高级模式',
      '无法使用强力模式',
      '有水印',
    ],
    color: 'from-gray-400 to-gray-500',
    buttonText: '当前版本',
    popular: false,
  },
  {
    id: 'standard',
    name: '标准会员',
    icon: Crown,
    price: 29,
    period: '月',
    description: '适合学术写作日常使用',
    features: [
      '每日10000字改写',
      '每日10000字降AI率',
      '基础 + 高级改写模式',
      '支持主流检测系统',
      '去除水印',
      '优先客服支持',
      '100 积分/月',
    ],
    limitations: [],
    color: 'from-pink-500 to-purple-500',
    buttonText: '立即开通',
    popular: true,
  },
  {
    id: 'professional',
    name: '专业会员',
    icon: Zap,
    price: 79,
    period: '月',
    description: '适合深度学术研究和专业写手',
    features: [
      '无限次改写',
      '无限次降AI率',
      '全部改写模式（基础/高级/强力）',
      '支持所有检测系统',
      '去除水印',
      '专属客服支持',
      '500 积分/月',
      '优先处理队列',
      '高级数据分析',
    ],
    limitations: [],
    color: 'from-purple-500 to-indigo-500',
    buttonText: '立即开通',
    popular: false,
  },
];

const annualDiscount = 40; // 年付优惠40%

export function Membership() {
  const { user, membership, isAuthenticated } = useAuthStore();

  // 检查会员是否过期
  const isExpired = membership.expireDate && new Date(membership.expireDate) < new Date();
  const currentLevel = isExpired ? 'free' : membership.level;

  // 获取当前会员信息
  const getCurrentPlanInfo = () => {
    switch (currentLevel) {
      case 'standard':
        return { name: '标准会员', color: 'from-pink-500 to-purple-500', icon: Crown };
      case 'professional':
        return { name: '专业会员', color: 'from-purple-500 to-indigo-500', icon: Zap };
      default:
        return { name: '免费版', color: 'from-gray-400 to-gray-500', icon: Sparkles };
    }
  };

  const currentPlan = getCurrentPlanInfo();
  const CurrentIcon = currentPlan.icon;

  return (
    <div className="min-h-screen gradient-bg py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
            选择您的会员计划
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            解锁全部高级功能，加速您的学术写作进程
          </p>

          {/* 年付切换提示 */}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
            <span className="text-green-600 dark:text-green-400 text-sm font-medium">
              🎉 年付最高省 40%，相当于免费用两个月！
            </span>
          </div>
        </div>

        {/* 当前会员状态卡片 */}
        {isAuthenticated && (
          <GlassCard className="mb-8 p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentPlan.color} flex items-center justify-center flex-shrink-0`}>
                <CurrentIcon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                  当前会员：{currentPlan.name}
                </h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {user?.nickname || user?.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Coins className="w-4 h-4" />
                    积分：{membership.points}
                  </span>
                  {membership.expireDate && currentLevel !== 'free' && (
                    <span className={`flex items-center gap-1 ${isExpired ? 'text-red-500' : ''}`}>
                      <Calendar className="w-4 h-4" />
                      {isExpired ? '已过期' : '有效期至'}：{new Date(membership.expireDate).toLocaleDateString('zh-CN')}
                    </span>
                  )}
                </div>
              </div>
              {currentLevel !== 'free' && !isExpired && (
                <div className="px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-medium">
                  会员生效中
                </div>
              )}
              {isExpired && (
                <div className="px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium">
                  会员已过期
                </div>
              )}
            </div>
          </GlassCard>
        )}

        {/* 价格卡片 */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <GlassCard
              key={plan.id}
              className={`relative overflow-hidden flex flex-col h-full ${plan.popular ? 'ring-2 ring-pink-500 scale-105 z-10' : ''}`}
            >
              {/* 热门标签 */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl z-10">
                  最受欢迎
                </div>
              )}

              {/* 卡片内容 */}
              <div className="flex-1 flex flex-col p-6">
                {/* 卡片头部 */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} mb-4`}>
                  <plan.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{plan.description}</p>

                {/* 价格 */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-800 dark:text-white">
                      ¥{plan.price}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">/{plan.period}</span>
                  </div>
                  {plan.id !== 'free' && (
                    <p className="text-sm text-gray-400 mt-1">
                      年付约 ¥{Math.round(plan.price * 12 * (1 - annualDiscount / 100))}/年
                    </p>
                  )}
                </div>

                {/* 功能列表 */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm opacity-50">
                      <span className="w-5 h-5 flex-shrink-0 mt-0.5 flex items-center justify-center">×</span>
                      <span className="text-gray-500 dark:text-gray-400 line-through">{limitation}</span>
                    </li>
                  ))}
                </ul>

                {/* 按钮 */}
                {plan.id === 'free' ? (
                  <button 
                    disabled={currentLevel === 'free'}
                    className={`w-full py-3 px-4 rounded-xl border-2 font-semibold transition-colors ${
                      currentLevel === 'free'
                        ? 'border-pink-500 text-pink-500 bg-pink-50 dark:bg-pink-900/20'
                        : 'border-gray-200 dark:border-white/20 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    {currentLevel === 'free' ? '当前版本' : plan.buttonText}
                  </button>
                ) : (
                  <Link
                    to={isAuthenticated ? `/payment?plan=${plan.id}` : '/login'}
                    className={`block w-full py-3 px-4 rounded-xl bg-gradient-to-r ${plan.color} text-white font-semibold text-center shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ${
                      currentLevel === plan.id && !isExpired ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                    }`}
                    onClick={(e) => {
                      if (currentLevel === plan.id && !isExpired) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {currentLevel === plan.id && !isExpired 
                      ? '当前套餐' 
                      : !isAuthenticated 
                        ? '登录后开通' 
                        : currentLevel === 'professional' && plan.id === 'standard'
                          ? '已拥有更高级别'
                          : plan.buttonText
                    }
                  </Link>
                )}
              </div>
            </GlassCard>
          ))}
        </div>

        {/* 底部说明 */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            所有会员均为订阅制，随时可以取消 • 支付安全有保障
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
            疑问？联系客服 <a href="#" className="text-pink-500 hover:text-pink-600">support@bunny.com</a>
          </p>
        </div>

        {/* 返回首页 */}
        <div className="text-center mt-8">
          <Link to="/" className="text-pink-500 hover:text-pink-600 font-medium">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
