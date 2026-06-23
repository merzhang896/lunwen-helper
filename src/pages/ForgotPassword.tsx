import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Sparkles, ArrowLeft, Mail, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { authApi } from '../services/api';
import { GlassCard } from '../components/GlassCard';

// 步骤枚举
type Step = 'email' | 'verify' | 'reset' | 'success';

export function ForgotPassword() {
  const navigate = useNavigate();

  // 步骤状态
  const [step, setStep] = useState<Step>('email');

  // 表单数据
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI 状态
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  // 验证码输入框引用
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 发送验证码
  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      setError('请输入正确的邮箱地址');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authApi.forgotPassword(email);
      setCountdown(60);
      setStep('verify');
      // 开发模式下显示验证码
      if (res.devCode) {
        console.log('[开发模式] 找回密码验证码:', res.devCode);
      }
    } catch (err: any) {
      setError(err.message || '发送验证码失败，请检查邮箱是否已注册');
    } finally {
      setLoading(false);
    }
  };

  // 重发验证码
  const handleResendCode = async () => {
    if (countdown > 0) return;
    await handleSendCode();
  };

  // 验证码输入处理
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // 自动聚焦下一个
    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }

    // 填完6位自动验证
    if (index === 5 && value) {
      const fullCode = [...newCode.slice(0, 5), value].join('');
      if (fullCode.length === 6) {
        handleVerifyCode(fullCode);
      }
    }
  };

  // 验证码键盘处理
  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  // 验证验证码
  const handleVerifyCode = async (fullCode?: string) => {
    const verifyCode = fullCode || code.join('');
    if (verifyCode.length !== 6) {
      setError('请输入完整的6位验证码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authApi.verifyResetCode(email, verifyCode);
      setStep('reset');
    } catch (err: any) {
      setError(err.message || '验证码错误');
      // 清空验证码输入
      setCode(['', '', '', '', '', '']);
      codeRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // 重置密码
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setError('密码至少需要6位');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authApi.resetPassword(email, code.join(''), password);
      setStep('success');
    } catch (err: any) {
      setError(err.message || '重置密码失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 渲染步骤指示器
  const renderStepIndicator = () => {
    const steps = [
      { key: 'email', label: '输入邮箱' },
      { key: 'verify', label: '验证身份' },
      { key: 'reset', label: '重置密码' },
    ];

    const currentIndex = steps.findIndex(s => s.key === step);

    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((s, index) => (
          <div key={s.key} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                index <= currentIndex
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`ml-2 text-sm hidden sm:block ${
                index <= currentIndex ? 'text-gray-800 dark:text-white' : 'text-gray-400'
              }`}
            >
              {s.label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-2 ${
                  index < currentIndex ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // 渲染邮箱输入步骤
  const renderEmailStep = () => (
    <form onSubmit={(e) => { e.preventDefault(); handleSendCode(); }} className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
          <Mail className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">找回密码</h2>
        <p className="text-gray-500 mt-2 text-sm">请输入您注册时使用的邮箱地址</p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          邮箱地址
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="w-full px-4 py-3.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            发送中...
          </>
        ) : (
          '发送验证码'
        )}
      </button>

      <div className="text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回登录
        </Link>
      </div>
    </form>
  );

  // 渲染验证码验证步骤
  const renderVerifyStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">验证身份</h2>
        <p className="text-gray-500 mt-2 text-sm">
          验证码已发送至 <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
          请输入6位验证码
        </label>
        <div className="flex justify-center gap-3">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { codeRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleCodeKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-bold rounded-xl bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
            />
          ))}
        </div>
      </div>

      <div className="text-center">
        {countdown > 0 ? (
          <span className="text-sm text-gray-500">
            {countdown} 秒后可重新发送
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResendCode}
            disabled={loading}
            className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
          >
            重新发送验证码
          </button>
        )}
      </div>

      <button
        onClick={() => handleVerifyCode()}
        disabled={loading || code.join('').length !== 6}
        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            验证中...
          </>
        ) : (
          '下一步'
        )}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setStep('email')}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回上一步
        </button>
      </div>
    </div>
  );

  // 渲染重置密码步骤
  const renderResetStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
          <Lock className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">重置密码</h2>
        <p className="text-gray-500 mt-2 text-sm">请设置您的新密码</p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          新密码
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少6位字符"
            required
            minLength={6}
            className="w-full px-4 py-3.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          确认新密码
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="再次输入新密码"
            required
            minLength={6}
            className="w-full px-4 py-3.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all pr-12"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            重置中...
          </>
        ) : (
          '重置密码'
        )}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setStep('verify')}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回上一步
        </button>
      </div>
    </form>
  );

  // 渲染成功步骤
  const renderSuccessStep = () => (
    <div className="text-center space-y-6 py-8">
      <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
      </div>
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
          密码重置成功！
        </h2>
        <p className="text-gray-500">
          您的密码已成功重置，请使用新密码登录
        </p>
      </div>
      <button
        onClick={() => navigate('/login')}
        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        去登录
      </button>
    </div>
  );

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-12">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-orange-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-400/20 rounded-full blur-3xl" />
      </div>

      <GlassCard className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-6 pt-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              论文助手
            </span>
          </Link>
        </div>

        {/* 步骤指示器 */}
        {step !== 'success' && renderStepIndicator()}

        {/* 内容区域 */}
        <div className="p-6">
          {step === 'email' && renderEmailStep()}
          {step === 'verify' && renderVerifyStep()}
          {step === 'reset' && renderResetStep()}
          {step === 'success' && renderSuccessStep()}
        </div>
      </GlassCard>
    </div>
  );
}
