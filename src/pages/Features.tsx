import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, FileText, Globe, Shield, Brain, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export function Features() {
  // 滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      title: '智能改写',
      description: 'AI驱动的文本改写，支持学术正式、创意改写、中英互译、简化表达、扩展丰富等多种模式，帮助您快速生成高质量的学术内容。',
      icon: Sparkles,
      color: 'from-pink-500 to-purple-600',
      benefits: ['多种改写模式', '智能语义理解', '保持学术严谨性', '支持中英文']
    },
    {
      title: '降AI率',
      description: '专业的AI检测率降低工具，通过深度优化文本结构和表达方式，使AI生成的内容更接近人类写作，有效应对各种AI检测系统。',
      icon: Brain,
      color: 'from-purple-500 to-indigo-600',
      benefits: ['深度文本优化', '模拟人类写作', '适配多种检测系统', '保持内容质量']
    },
    {
      title: '文件处理',
      description: '支持上传文本文件、PDF和Word文档，自动提取内容进行处理，并将处理结果保存到您的设备，方便后续编辑和使用。',
      icon: FileText,
      color: 'from-blue-500 to-cyan-600',
      benefits: ['多种文件格式支持', '自动内容提取', '批量处理', '安全保存']
    },
    {
      title: '多语言支持',
      description: '支持中英文互译和处理，帮助国际学生和研究者轻松应对跨语言学术写作需求，确保翻译质量和学术准确性。',
      icon: Globe,
      color: 'from-green-500 to-emerald-600',
      benefits: ['中英文互译', '专业学术术语', '保持原意', '流畅自然']
    },
    {
      title: '隐私安全',
      description: '严格的隐私保护措施，所有内容在本地处理，不上传至服务器，确保您的学术成果和个人信息安全。',
      icon: Shield,
      color: 'from-amber-500 to-orange-600',
      benefits: ['本地处理', '不上传数据', '加密传输', '隐私保护']
    },
    {
      title: '历史记录',
      description: '自动保存您的处理历史，方便查看和管理过往的改写和降AI率结果，支持收藏重要内容，提高工作效率。',
      icon: Clock,
      color: 'from-red-500 to-pink-600',
      benefits: ['自动保存', '快速访问', '内容收藏', '历史管理']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-20 px-4">
      {/* 标题部分 */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 dark:bg-pink-900/20 rounded-full border border-pink-200 dark:border-pink-800/30 mb-6">
          <Sparkles className="w-4 h-4 text-pink-500" />
          <span className="text-sm font-medium text-pink-600 dark:text-pink-400">核心功能</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">强大的学术写作工具</span>
          <br />
          <span className="text-gray-800 dark:text-white">满足您的所有学术需求</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          论文助手提供全面的学术写作解决方案，从智能改写、降AI率到文件处理，
          帮助您轻松应对各种学术写作挑战，提高写作效率和质量。
        </p>
      </div>

      {/* 功能卡片 */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <GlassCard key={index} className="p-6 hover:shadow-xl transition-all duration-300">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{feature.description}</p>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          );
        })}
      </div>

      {/* 行动号召 */}
      <div className="max-w-4xl mx-auto mt-20 text-center">
        <GlassCard className="p-8 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            开始使用论文助手
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            注册即可获得100积分，免费体验所有基础功能，解锁学术写作新体验
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-pink-300/50 hover:-translate-y-0.5 transition-all"
            >
              立即注册
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-full border-2 border-gray-200 dark:border-white/20 hover:border-pink-300 hover:text-pink-600 transition-all"
            >
              已有账户？登录
            </Link>
          </div>
        </GlassCard>
      </div>

      {/* 返回首页 */}
      <div className="text-center mt-12">
        <Link to="/" className="text-pink-500 hover:text-pink-600 font-medium flex items-center justify-center gap-1">
          <ArrowRight className="w-4 h-4 rotate-180" />
          返回首页
        </Link>
      </div>
    </div>
  );
}
