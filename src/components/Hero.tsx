import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, FileText, Zap, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../context/AuthContext';

export default function Hero() {
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20 overflow-hidden">
      {/* Background - 粉紫色渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100" />
      
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-300 rounded-full blur-3xl opacity-20 animate-float" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl opacity-20 animate-float delay-200" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-300 rounded-full blur-3xl opacity-15 animate-float delay-400" />
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,105,180,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,105,180,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        {/* Main Content */}
        <div className="mb-12 animate-slide-up">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-pink-100 rounded-2xl">
              <Sparkles className="w-12 h-12 text-pink-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">智能论文</span>
            <br />
            <span className="text-gray-800">降重助手</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            基于先进的 AI 算法，帮助您快速降低论文重复率，保持原义不变，让学术写作更轻松
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-pink-300/50 hover:-translate-y-0.5 transition-all"
              >
                进入论文助手
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <button
                  onClick={() => window.location.href = '/register'}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-pink-300/50 hover:-translate-y-0.5 transition-all"
                >
                  免费注册
                  <ArrowRight className="w-5 h-5" />
                </button>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-full border-2 border-gray-200 hover:border-pink-300 hover:text-pink-600 transition-all"
                >
                  登录
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-20 animate-fade-in delay-300">
          <div className="p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-pink-200/50 shadow-lg shadow-pink-100/30">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-pink-100 rounded-full">
                <FileText className="w-6 h-6 text-pink-500" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">10万+</div>
            <div className="text-gray-600">用户信赖</div>
          </div>

          <div className="p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-pink-200/50 shadow-lg shadow-pink-100/30">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <Zap className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">500万+</div>
            <div className="text-gray-600">论文处理</div>
          </div>

          <div className="p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-pink-200/50 shadow-lg shadow-pink-100/30">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">98%</div>
            <div className="text-gray-600">满意度</div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 mt-16 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
            内容不上传不存储
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
            隐私安全有保障
          </span>
        </div>
      </div>
    </section>
  )
}
