import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Sparkles } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export function TermsOfService() {
  return (
    <div className="min-h-screen gradient-bg py-12 px-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-pink-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
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
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">论文助手</h1>
                <p className="text-white/80 text-sm">用户协议</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <FileText className="w-5 h-5" />
              <span className="text-lg font-medium">服务条款与使用协议</span>
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
                <span className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 flex items-center justify-center text-sm font-bold">1</span>
                协议接受
              </h2>
              <p className="leading-relaxed">
                欢迎使用论文助手（以下简称"本服务"）。通过访问、注册或使用本服务，您表示已阅读、理解并同意受本用户协议（以下简称"本协议"）的约束。如果您不同意本协议的任何条款，请勿使用本服务。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 flex items-center justify-center text-sm font-bold">2</span>
                服务描述
              </h2>
              <p className="leading-relaxed mb-3">
                论文助手是一款学术写作辅助工具，提供以下功能：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>论文降重与改写服务</li>
                <li>学术写作建议与优化</li>
                <li>文献格式规范化</li>
                <li>语法检查与修正</li>
                <li>其他学术相关辅助功能</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 flex items-center justify-center text-sm font-bold">3</span>
                用户账户
              </h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  <strong className="text-gray-900 dark:text-white">3.1 注册要求：</strong>
                  您需要提供真实、准确、完整的个人信息进行注册。您有责任维护账户密码的保密性，并对账户下的所有活动负责。
                </p>
                <p className="leading-relaxed">
                  <strong className="text-gray-900 dark:text-white">3.2 账户安全：</strong>
                  如发现任何未经授权使用您账户的情况，请立即通知我们。我们对因您未能遵守本条规定而导致的任何损失不承担责任。
                </p>
                <p className="leading-relaxed">
                  <strong className="text-gray-900 dark:text-white">3.3 账户限制：</strong>
                  每个用户仅限拥有一个账户。我们保留关闭重复账户或虚假账户的权利。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 flex items-center justify-center text-sm font-bold">4</span>
                使用规则
              </h2>
              <p className="leading-relaxed mb-3">您同意在使用本服务时遵守以下规则：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>不得将本服务用于任何非法目的</li>
                <li>不得上传、传播任何违法、侵权、淫秽、暴力或其他不当内容</li>
                <li>不得干扰或破坏本服务的正常运行</li>
                <li>不得尝试未经授权访问本服务的任何部分</li>
                <li>不得使用自动化工具（如机器人、爬虫）访问本服务</li>
                <li>不得冒充他人或提供虚假信息</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 flex items-center justify-center text-sm font-bold">5</span>
                知识产权
              </h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  <strong className="text-gray-900 dark:text-white">5.1 服务知识产权：</strong>
                  本服务及其所有内容（包括但不限于软件、代码、界面设计、商标、标识）的所有权利均归我们所有，受版权法和其他知识产权法律保护。
                </p>
                <p className="leading-relaxed">
                  <strong className="text-gray-900 dark:text-white">5.2 用户内容：</strong>
                  您保留对您上传内容的所有权。通过使用本服务，您授予我们有限的许可，以便我们为您提供服务。
                </p>
                <p className="leading-relaxed">
                  <strong className="text-gray-900 dark:text-white">5.3 学术诚信：</strong>
                  本服务仅供学术辅助使用。您应对使用本服务生成的内容负责，确保符合您所在机构的学术诚信政策。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 flex items-center justify-center text-sm font-bold">6</span>
                付费服务
              </h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  <strong className="text-gray-900 dark:text-white">6.1 积分系统：</strong>
                  本服务采用积分制，部分功能需要消耗积分。新注册用户将获得一定数量的免费积分。
                </p>
                <p className="leading-relaxed">
                  <strong className="text-gray-900 dark:text-white">6.2 会员服务：</strong>
                  我们提供不同等级的会员服务，具体权益以购买页面说明为准。
                </p>
                <p className="leading-relaxed">
                  <strong className="text-gray-900 dark:text-white">6.3 退款政策：</strong>
                  除非法律法规另有规定，已购买的积分和会员服务不支持退款。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 flex items-center justify-center text-sm font-bold">7</span>
                服务变更与终止
              </h2>
              <p className="leading-relaxed">
                我们保留随时修改、暂停或终止本服务（或其任何部分）的权利，恕不另行通知。我们不对服务的任何修改、暂停或终止对您或第三方造成的任何损失承担责任。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 flex items-center justify-center text-sm font-bold">8</span>
                免责声明
              </h2>
              <p className="leading-relaxed">
                本服务按"现状"和"可用性"提供，不作任何明示或暗示的保证。我们不保证服务将满足您的要求，也不保证服务不会中断、及时、安全或无错误。使用本服务的风险由您自行承担。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 flex items-center justify-center text-sm font-bold">9</span>
                协议修改
              </h2>
              <p className="leading-relaxed">
                我们保留随时修改本协议的权利。修改后的协议将在本页面公布，并在公布时生效。继续使用本服务即表示您接受修改后的协议。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 flex items-center justify-center text-sm font-bold">10</span>
                联系我们
              </h2>
              <p className="leading-relaxed">
                如您对本协议有任何疑问，请通过以下方式联系我们：
              </p>
              <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p>邮箱：support@lunwen-helper.com</p>
                <p className="mt-1">客服时间：周一至周五 9:00-18:00</p>
              </div>
            </section>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
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
