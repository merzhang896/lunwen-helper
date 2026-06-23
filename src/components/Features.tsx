import { Pencil, Bot, BookOpen, Languages, Sparkles, Zap } from 'lucide-react'
import { features } from '@/data/content'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Pencil,
  Bot,
  BookOpen,
  Languages,
}

export default function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-full border border-pink-200 mb-4">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-pink-600">四大核心功能</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            一站式学术写作平台
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            覆盖改写、降重、降AI、综述、翻译全流程，让学术写作更高效
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Sparkles
            return (
              <div
                key={feature.id}
                className={cn(
                  'group relative p-8 rounded-3xl border-2 transition-all duration-500 hover:-translate-y-2',
                  index === 0
                    ? 'bg-gradient-to-br from-pink-50 to-pink-100/50 border-pink-200 hover:border-pink-400'
                    : index === 1
                    ? 'bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 hover:border-purple-400'
                    : index === 2
                    ? 'bg-gradient-to-br from-cyan-50 to-cyan-100/50 border-cyan-200 hover:border-cyan-400'
                    : 'bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200 hover:border-indigo-400'
                )}
              >
                {/* Glow Effect */}
                <div className={cn(
                  'absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                  index === 0 ? 'bg-gradient-to-br from-pink-200/20 to-pink-300/20' :
                  index === 1 ? 'bg-gradient-to-br from-purple-200/20 to-purple-300/20' :
                  index === 2 ? 'bg-gradient-to-br from-cyan-200/20 to-cyan-300/20' :
                  'bg-gradient-to-br from-indigo-200/20 to-indigo-300/20'
                )} />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110',
                    index === 0 ? 'bg-pink-100 text-pink-600' :
                    index === 1 ? 'bg-purple-100 text-purple-600' :
                    index === 2 ? 'bg-cyan-100 text-cyan-600' :
                    'bg-indigo-100 text-indigo-600'
                  )}>
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>

                  {/* Highlight */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 rounded-full">
                    <Zap className="w-3.5 h-3.5 text-pink-500" />
                    <span className="text-xs font-medium text-gray-700">{feature.highlight}</span>
                  </div>

                  {/* Modes */}
                  {feature.modes && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {feature.modes.map((m) => (
                        <span
                          key={m}
                          className={cn(
                            'px-2.5 py-1 text-xs rounded-lg',
                            index === 0 ? 'bg-pink-100 text-pink-600' :
                            index === 1 ? 'bg-purple-100 text-purple-600' :
                            index === 2 ? 'bg-cyan-100 text-cyan-600' :
                            'bg-indigo-100 text-indigo-600'
                          )}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <a
                    href="#pricing"
                    className={cn(
                      'inline-flex items-center gap-1 mt-6 text-sm font-semibold transition-all group-hover:gap-2.5',
                      index === 0 ? 'text-pink-600' :
                      index === 1 ? 'text-purple-600' :
                      index === 2 ? 'text-cyan-600' :
                      'text-indigo-600'
                    )}
                  >
                    立即体验
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
