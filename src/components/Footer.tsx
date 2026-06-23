import { useState } from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const footerLinks = [
    {
      title: '产品',
      links: [
        { label: '学术写作', href: '#features' },
        { label: '降AI率', href: '#humanize' },
        { label: '超级写作', href: '#magic' },
        { label: '超级翻译', href: '#translate' },
      ]
    },
    {
      title: '关于',
      links: [
        { label: '免责声明', href: '#', onClick: () => setShowDisclaimer(true) },
        { label: '价格说明', href: '#pricing' },
        { label: '隐私政策', href: '#' },
        { label: '用户协议', href: '#' },
      ]
    },
    {
      title: '支持',
      links: [
        { label: '帮助中心', href: '#' },
        { label: '常见问题', href: '#faq' },
        { label: '联系客服', href: '#' },
        { label: '商务合作', href: '#' },
      ]
    }
  ]

  return (
    <>
      <footer className="bg-gray-900 text-gray-400">
        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-400 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">论</span>
                </div>
                <span className="font-bold text-xl text-white">论文助手</span>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                专注学术写作领域，提供智能改写、降重、降AI率、文献综述生成等一站式服务。
                让学术写作更高效、更安全。
              </p>
              <div className="flex gap-4">
                {['weibo', 'wechat', 'zhihu'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-pink-500 transition-colors group"
                  >
                    <span className="text-sm group-hover:text-white transition-colors">
                      {social === 'weibo' ? '微' : social === 'wechat' ? '微' : '知'}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h4 className="font-semibold text-white mb-4">{group.title}</h4>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        onClick={(e) => {
                          if (link.onClick) {
                            e.preventDefault();
                            link.onClick();
                          }
                        }}
                        className="text-sm hover:text-pink-400 transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm">
                © {currentYear} 论文助手. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm">
                <span>京ICP备XXXXXXXX号</span>
                <span>|</span>
                <span>北京技术支持</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* 免责声明弹窗 */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">免责声明</h2>
                <button
                  onClick={() => setShowDisclaimer(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4 text-gray-600 dark:text-gray-300">
              <section>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. 服务说明</h3>
                <p className="text-sm leading-relaxed">
                  论文助手是一款学术写作辅助工具，旨在帮助用户提升写作效率和文本质量。
                  我们提供的所有功能仅供参考和学习使用，不构成任何形式的学术建议或指导。
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. 使用责任</h3>
                <p className="text-sm leading-relaxed">
                  用户应对使用本服务生成的内容承担全部责任。我们不对用户如何使用本服务生成的内容负责，
                  包括但不限于学术不端、版权侵权、内容违规等行为。
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. 内容准确性</h3>
                <p className="text-sm leading-relaxed">
                  虽然我们努力确保服务的准确性和可靠性，但不保证生成内容的完全正确性。
                  用户应自行核实和验证所有重要信息，特别是涉及学术、法律、医疗等专业领域的内容。
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">4. 知识产权</h3>
                <p className="text-sm leading-relaxed">
                  用户使用本服务生成的内容，其知识产权归用户所有。但用户应确保输入内容的合法性，
                  不得使用本服务处理侵犯他人知识产权的内容。
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">5. 服务变更</h3>
                <p className="text-sm leading-relaxed">
                  我们保留随时修改、暂停或终止服务的权利，恕不另行通知。对于服务变更给用户造成的任何损失，
                  我们不承担责任。
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">6. 法律适用</h3>
                <p className="text-sm leading-relaxed">
                  本免责声明受中华人民共和国法律管辖。如发生争议，双方应友好协商解决；
                  协商不成的，任何一方均可向有管辖权的人民法院提起诉讼。
                </p>
              </section>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500">
                  最后更新日期：2024年1月1日
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <button
                onClick={() => setShowDisclaimer(false)}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-pink-500/30 transition-all"
              >
                我已阅读并理解
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
