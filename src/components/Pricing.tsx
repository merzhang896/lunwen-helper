import { Link } from 'react-router-dom';
import { pricingPlans } from '@/data/content';
import { Check, Zap, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-pink-50/50 via-white to-purple-50/50" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-full border border-pink-200 mb-4">
            <Crown className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-pink-600">灵活的会员方案</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            选择适合你的方案
          </h2>
          <p className="text-gray-500">所有方案均支持中英文，无隐藏费用</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.name}
              className={cn(
                'relative rounded-3xl p-8 transition-all hover:-translate-y-1',
                plan.highlight
                  ? 'bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 text-white shadow-2xl shadow-pink-300/50'
                  : 'bg-white border-2 border-gray-100 hover:border-pink-200 hover:shadow-xl dark:bg-gray-800 dark:border-white/10'
              )}
            >
              {/* Popular Badge */}
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                  最受欢迎
                </div>
              )}

              {/* Plan Name */}
              <h3 className={cn('text-xl font-bold mb-2', plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white')}>
                {plan.name}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-6">
                <span className={cn('text-4xl font-bold', plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white')}>
                  {plan.price}
                </span>
                {plan.originalPrice && (
                  <span className={cn('text-lg line-through', plan.highlight ? 'text-pink-200' : 'text-gray-400')}>
                    {plan.originalPrice}
                  </span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                      plan.highlight ? 'bg-white/20' : 'bg-pink-100 dark:bg-pink-900/30'
                    )}>
                      <Check className={cn('w-3 h-3', plan.highlight ? 'text-white' : 'text-pink-600')} />
                    </div>
                    <span className={cn('text-sm', plan.highlight ? 'text-pink-100' : 'text-gray-600 dark:text-gray-400')}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link
                to="/membership"
                className={cn(
                  'block w-full py-4 rounded-2xl font-semibold text-center transition-all hover:-translate-y-0.5',
                  plan.highlight
                    ? 'bg-white text-pink-600 hover:shadow-lg'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg hover:shadow-pink-300/50'
                )}
              >
                {plan.buttonText}
              </Link>
            </div>
          ))}
        </div>

        {/* Note */}
        <p className="text-center text-sm text-gray-400 mt-8">
          所有会员均为订阅制，可随时取消。支持支付宝、微信支付、对公转账。
        </p>
      </div>
    </section>
  )
}
