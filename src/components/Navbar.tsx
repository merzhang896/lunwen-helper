import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sparkles, User, LogOut, Crown } from 'lucide-react';
import { useAuthStore } from '../context/AuthContext';

const navItems = [
  { label: '功能介绍', href: '/features' },
  { label: '企业合作', href: '/cooperation' },
  { label: '联系客服', href: '/contact' },
  { label: '登录管理系统', href: '/admin/login' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout, membership } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-pink-100/50'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent hidden sm:block">
              论文助手
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              item.href.startsWith('/') ? (
                <Link
                  key={item.label}
                  to={item.href}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-pink-600 rounded-lg hover:bg-pink-50 transition-all"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-pink-600 rounded-lg hover:bg-pink-50 transition-all"
                >
                  {item.label}
                </a>
              )
            ))}
          </div>

          {/* CTA / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {/* 会员标签 */}
                <Link
                  to="/membership"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border border-pink-200 dark:border-pink-800/30"
                >
                  <Crown className="w-4 h-4 text-pink-500" />
                  <span className="text-sm font-medium text-pink-600 dark:text-pink-400">
                    {membership.level === 'free' ? '免费版' : membership.level === 'standard' ? '标准会员' : '专业会员'}
                  </span>
                </Link>

                {/* 用户头像下拉 */}
                <div className="relative group">
                  <button className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {user.nickname?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </button>

                  <div className="absolute right-0 mt-2 w-56 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-white/10">
                      <p className="font-medium text-gray-800 dark:text-white">{user.nickname}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <Sparkles className="w-4 h-4 text-pink-500" />
                      <span className="text-gray-700 dark:text-gray-300">论文助手</span>
                    </Link>
                    <Link
                      to="/membership"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <Crown className="w-4 h-4 text-pink-500" />
                      <span className="text-gray-700 dark:text-gray-300">开通会员</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-white/5 text-red-500"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>退出登录</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-full hover:shadow-lg hover:shadow-pink-300/50 hover:-translate-y-0.5 transition-all"
                >
                  立即体验
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-pink-50 transition-colors"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileOpen && (
          <div className="md:hidden py-4 border-t border-pink-100">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                item.href.startsWith('/') ? (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {item.label}
                  </a>
                )
              ))}
              <div className="flex gap-3 mt-3 px-4">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-pink-600 text-center border-2 border-pink-200 rounded-full hover:bg-pink-50 transition-colors"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      进入助手
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2.5 text-sm font-medium text-red-500"
                    >
                      退出
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-pink-600 text-center border-2 border-pink-200 rounded-full hover:bg-pink-50 transition-colors"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      登录
                    </Link>
                    <Link
                      to="/register"
                      className="flex-1 px-4 py-2.5 text-sm font-semibold text-white text-center bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      立即体验
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
