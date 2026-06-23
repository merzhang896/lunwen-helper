import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Sparkles, Lock, Eye, Database, Share2, Cookie } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen gradient-bg py-12 px-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回注册
          </Link>
        </div>

        <GlassCard className="overflow-hidden">
          {/* 头部 */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-8 py-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">论文助手</h1>
                <p className="text-white/80 text-sm">隐私政策</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Shield className="w-5 h-5" />
              <span className="text-lg font-medium">我们重视并保护您的隐私</span>
            </div>
          </div>

          {/* 内容 */}
          <div className="px-8 py-8 space-y-8 text-gray-700 dark:text-gray-300">
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <p>最后更新日期：2026年4月4日</p>
              <p className="mt-1">生效日期：2026年4月4日</p>
            </div>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-sm font-bold">1</span>
                引言
              </h2>
              <p className="leading-relaxed">
                论文助手（以下简称"我们"或"本服务"）非常重视用户的隐私保护。本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息。请您在使用本服务前仔细阅读本政策。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-sm font-bold">2</span>
                信息收集
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Database className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">2.1 您提供的信息</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>账户信息：邮箱地址、昵称、密码</li>
                      <li>支付信息：购买记录、交易信息</li>
                      <li>联系信息：您主动提供的反馈或咨询内容</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">2.2 自动收集的信息</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>设备信息：IP地址、浏览器类型、操作系统</li>
                      <li>使用数据：访问时间、使用功能、操作记录</li>
                      <li>日志信息：错误报告、性能数据</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                    <Cookie className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">2.3 Cookie 和类似技术</h3>
                    <p className="text-sm leading-relaxed">
                      我们使用 Cookie 和类似技术来识别您的浏览器、记住您的偏好设置、了解您如何使用我们的服务，并改善用户体验。您可以通过浏览器设置管理 Cookie 偏好。
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-sm font-bold">3</span>
                信息使用
              </h2>
              <p className="leading-relaxed mb-3">我们收集的信息将用于以下目的：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>提供、维护和改进本服务</li>
                <li>处理您的注册、登录和账户管理</li>
                <li>处理积分购买和会员服务</li>
                <li>发送服务通知、更新和安全提醒</li>
                <li>响应您的咨询和反馈</li>
                <li>防止欺诈和滥用，保障服务安全</li>
                <li>进行数据分析和研究，改善服务质量</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-sm font-bold">4</span>
                信息存储与安全
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">4.1 数据安全</h3>
                    <p className="text-sm leading-relaxed">
                      我们采取业界标准的安全措施保护您的个人信息，包括数据加密、访问控制、安全审计等。但请注意，互联网传输无法保证100%安全。
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">4.2 数据存储位置</h3>
                  <p className="text-sm leading-relaxed">
                    您的数据存储在中国大陆境内的服务器上。我们遵守中国相关法律法规对数据存储和保护的要求。
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">4.3 数据保留期限</h3>
                  <p className="text-sm leading-relaxed">
                    我们将在您使用服务期间保留您的信息，并在账户注销后根据法律要求保留必要的信息。
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-sm font-bold">5</span>
                信息共享
              </h2>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                  <Share2 className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="leading-relaxed mb-3">
                    <strong className="text-gray-900 dark:text-white">我们不会出售您的个人信息。</strong>仅在以下情况下，我们可能与第三方共享信息：
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>获得您的明确同意</li>
                    <li>与为我们提供服务的可信第三方（如支付处理商）共享，且受保密义务约束</li>
                    <li>根据法律法规要求或政府部门要求</li>
                    <li>保护我们的合法权益或公共安全</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-sm font-bold">6</span>
                您的权利
              </h2>
              <p className="leading-relaxed mb-3">根据适用法律，您对个人信息享有以下权利：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>访问权：</strong>您有权访问我们持有的关于您的个人信息</li>
                <li><strong>更正权：</strong>您有权要求更正不准确或不完整的信息</li>
                <li><strong>删除权：</strong>在特定情况下，您有权要求删除您的个人信息</li>
                <li><strong>限制处理权：</strong>在特定情况下，您有权要求限制对您信息的处理</li>
                <li><strong>数据可携带权：</strong>您有权以结构化格式获取您的数据</li>
                <li><strong>反对权：</strong>您有权反对某些类型的信息处理</li>
              </ul>
              <p className="mt-3 text-sm">
                如需行使上述权利，请通过本政策末尾的联系方式与我们联系。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-sm font-bold">7</span>
                未成年人保护
              </h2>
              <p className="leading-relaxed">
                本服务不面向14周岁以下的未成年人。如果我们发现收集了未成年人的个人信息，将立即删除。如果您认为我们可能持有未成年人的信息，请联系我们。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-sm font-bold">8</span>
                第三方链接
              </h2>
              <p className="leading-relaxed">
                本服务可能包含指向第三方网站或服务的链接。我们不对这些第三方的隐私实践负责。建议您在访问第三方网站时阅读其隐私政策。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-sm font-bold">9</span>
                政策更新
              </h2>
              <p className="leading-relaxed">
                我们可能会不时更新本隐私政策。更新后的政策将在本页面公布，并在公布时生效。重大变更将通过服务通知或邮件告知您。继续使用本服务即表示您接受更新后的政策。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-sm font-bold">10</span>
                联系我们
              </h2>
              <p className="leading-relaxed">
                如您对本隐私政策有任何疑问、意见或请求，请通过以下方式联系我们：
              </p>
              <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p>邮箱：privacy@lunwen-helper.com</p>
                <p className="mt-1">地址：中国北京市海淀区xxx路xxx号</p>
                <p className="mt-1">客服时间：周一至周五 9:00-18:00</p>
              </div>
            </section>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                返回注册
              </Link>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
