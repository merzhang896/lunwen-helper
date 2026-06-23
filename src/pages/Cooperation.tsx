import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Building, Users, Award, CheckCircle2, ArrowRight, Mail, Phone, MapPin } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export function Cooperation() {
  // 滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const services = [
    {
      title: '企业定制方案',
      description: '根据企业需求定制专属的学术写作解决方案，包括批量处理、API集成、企业级安全保障等。',
      icon: Building,
      color: 'from-pink-500 to-purple-600',
      features: ['批量文档处理', 'API接口集成', '企业级安全', '定制化功能']
    },
    {
      title: '学术机构合作',
      description: '与高校、研究机构合作，提供学术写作培训、论文指导、AI写作规范等服务，提升学术产出质量。',
      icon: Users,
      color: 'from-blue-500 to-cyan-600',
      features: ['学术写作培训', '论文指导服务', 'AI写作规范', '学术成果优化']
    },
    {
      title: '行业解决方案',
      description: '针对不同行业的学术需求，提供专业的写作和编辑服务，确保内容符合行业标准和规范。',
      icon: Award,
      color: 'from-green-500 to-emerald-600',
      features: ['行业专业术语', '标准规范遵循', '内容质量保障', '行业专家审核']
    }
  ];

  const benefits = [
    '提升企业学术产出效率',
    '确保内容质量和原创性',
    '降低AI检测率，符合学术规范',
    '专业的技术支持和服务',
    '灵活的合作模式和定价'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-20 px-4">
      {/* 标题部分 */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 dark:bg-pink-900/20 rounded-full border border-pink-200 dark:border-pink-800/30 mb-6">
          <Sparkles className="w-4 h-4 text-pink-500" />
          <span className="text-sm font-medium text-pink-600 dark:text-pink-400">企业合作</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">企业级学术写作解决方案</span>
          <br />
          <span className="text-gray-800 dark:text-white">助力企业学术创新与发展</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          论文助手为企业和学术机构提供专业的学术写作解决方案，帮助提升学术产出质量，
          降低写作成本，确保内容符合学术规范和行业标准。
        </p>
      </div>

      {/* 服务卡片 */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-20">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <GlassCard key={index} className="p-6 hover:shadow-xl transition-all duration-300">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} mb-6 shadow-lg`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">{service.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          );
        })}
      </div>

      {/* 合作优势 */}
      <div className="max-w-4xl mx-auto mb-20">
        <GlassCard className="p-8 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">
            我们的合作优势
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* 联系我们 */}
      <div className="max-w-4xl mx-auto mb-16">
        <GlassCard className="p-8 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">
            联系我们
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-2xl mx-auto">
            无论您是企业还是学术机构，我们都将为您提供专业的解决方案和优质的服务。
            请通过以下方式联系我们，了解更多合作详情。
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="font-medium text-gray-800 dark:text-white mb-2">邮箱</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">cooperation@lunwenzhushou.com</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="font-medium text-gray-800 dark:text-white mb-2">电话</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">400-123-4567</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="font-medium text-gray-800 dark:text-white mb-2">地址</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">北京市海淀区中关村科技园区</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 行动号召 */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6">
          开始您的企业合作之旅
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          填写表单或直接联系我们，我们的专业团队将在24小时内与您联系，
          为您提供定制化的合作方案。
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-pink-300/50 hover:-translate-y-0.5 transition-all"
        >
          立即联系
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* 返回首页 */}
      <div className="text-center">
        <Link to="/" className="text-pink-500 hover:text-pink-600 font-medium flex items-center justify-center gap-1">
          <ArrowRight className="w-4 h-4 rotate-180" />
          返回首页
        </Link>
      </div>
    </div>
  );
}
