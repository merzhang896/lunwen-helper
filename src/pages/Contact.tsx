import React, { useState, useRef, useEffect } from 'react';
import { Phone, Mail, MessageSquare, MapPin, Send, CheckCircle2, Clock, Heart, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubjectSelect = (value: string) => {
    setFormData(prev => ({
      ...prev,
      subject: value
    }));
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 模拟表单提交
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      // 重置表单
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white py-20">
      <div className="container mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
            联系客服
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            如有任何问题或建议，欢迎随时联系我们，我们将竭诚为您服务
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* 联系信息 */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
            <h2 className="text-2xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
              联系方式
            </h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white mb-1">电话咨询</h3>
                  <p className="text-blue-200">400-123-4567</p>
                  <p className="text-sm text-blue-300 mt-1">工作日 9:00-18:00</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white mb-1">电子邮件</h3>
                  <p className="text-blue-200">support@lunwenzhushou.com</p>
                  <p className="text-sm text-blue-300 mt-1">24小时内回复</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white mb-1">在线客服</h3>
                  <p className="text-blue-200">工作时间在线</p>
                  <p className="text-sm text-blue-300 mt-1">工作日 9:00-18:00</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white mb-1">办公地址</h3>
                  <p className="text-blue-200">北京市海淀区中关村大街1号</p>
                </div>
              </div>
            </div>

            {/* 常见问题 */}
            <div className="mt-12">
              <h3 className="font-bold text-lg text-white mb-4">常见问题</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/features" className="text-blue-300 hover:text-blue-200 transition-colors flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    如何使用超级写作功能？
                  </Link>
                </li>
                <li>
                  <Link to="/membership" className="text-blue-300 hover:text-blue-200 transition-colors flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    会员套餐有哪些权益？
                  </Link>
                </li>
                <li>
                  <Link to="/testimonials" className="text-blue-300 hover:text-blue-200 transition-colors flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    其他用户的使用体验如何？
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* 联系表单 */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
            <h2 className="text-2xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
              发送消息
            </h2>

            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">消息发送成功！</h3>
                <p className="text-blue-200 mb-8">我们将尽快与您联系</p>
                <Link
                  to="/"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  返回首页
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-blue-200 mb-2">
                      姓名
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-blue-300"
                      placeholder="请输入您的姓名"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-blue-200 mb-2">
                      邮箱
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-blue-300"
                      placeholder="请输入您的邮箱"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-blue-200 mb-2">
                    主题
                  </label>
                  <div ref={dropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white flex justify-between items-center"
                    >
                      <span>{formData.subject ? 
                        formData.subject === 'account' ? '账号问题' :
                        formData.subject === 'usage' ? '使用问题' :
                        formData.subject === 'payment' ? '支付问题' :
                        formData.subject === 'feedback' ? '反馈建议' :
                        formData.subject === 'other' ? '其他问题' : ''
                        : '请选择咨询主题'}
                      </span>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-50">
                        <div className="py-2">
                          {[
                            { value: 'account', label: '账号问题' },
                            { value: 'usage', label: '使用问题' },
                            { value: 'payment', label: '支付问题' },
                            { value: 'feedback', label: '反馈建议' },
                            { value: 'other', label: '其他问题' }
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleSubjectSelect(option.value)}
                              className={`w-full text-left px-4 py-3 hover:bg-white/10 transition-colors ${formData.subject === option.value ? 'bg-white/10 text-purple-300' : 'text-white'}`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="hidden"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-blue-200 mb-2">
                    消息内容
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-blue-300"
                    placeholder="请详细描述您的问题或建议"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>发送中...</span>
                    </>
                  ) : (
                    <>
                      <span>发送消息</span>
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 服务承诺 */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
            我们的服务承诺
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">快速响应</h3>
              <p className="text-blue-200">工作时间内1小时内响应，非工作时间24小时内回复</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">专业服务</h3>
              <p className="text-blue-200">由经验丰富的客服团队提供专业、耐心的解决方案</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">问题解决</h3>
              <p className="text-blue-200">确保您的问题得到彻底解决，提供后续跟踪服务</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;