import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Sparkles, Check, Mail, ShieldCheck, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../context/AuthContext';
import { authApi } from '../services/api';
import { GlassCard } from '../components/GlassCard';

// 两步注册：
//  Step 1 - 填写昵称 + 邮箱 + 密码 → 发送验证码
//  Step 2 - 输入验证码 → 完成注册

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuthStore();

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 表单
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Step 2 验证码
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 公共状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 倒计时重发
  const [countdown, setCountdown] = useState(0);
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: '至少8个字符' },
    { met: /[A-Z]/.test(formData.password), text: '包含大写字母' },
    { met: /[0-9]/.test(formData.password), text: '包含数字' },
  ];

  // ── Step 1 提交：发送验证码 ─────────────────────────────────
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }
    if (!agreed) {
      setError('请同意用户协议和隐私政策');
      return;
    }
    if (!passwordRequirements.every(r => r.met)) {
      setError('请满足所有密码要求');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.sendCode(formData.email);
      setSuccessMsg(res.message || '验证码已发送');
      setCountdown(60);
      setStep(2);
      setTimeout(() => codeRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message || '发送失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // ── 重新发送验证码 ──────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return;
    setError('');
    setLoading(true);
    try {
      const res = await authApi.sendCode(formData.email);
      setSuccessMsg(res.message || '验证码已重新发送');
      setCountdown(60);
      setCode(['', '', '', '', '', '']);
      setTimeout(() => codeRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message || '发送失败');
    } finally {
      setLoading(false);
    }
  };

  // ── 验证码输入框 ──────────────────────────────────────────
  const handleCodeInput = (index: number, value: string) => {
    const v = value.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = v;
    setCode(next);
    if (v && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }
  };
  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };
  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...code];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setCode(next);
    const lastFilled = Math.min(pasted.length, 5);
    codeRefs.current[lastFilled]?.focus();
  };

  // ── Step 2 提交：完成注册 ──────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('请输入完整的6位验证码');
      return;
    }
    setLoading(true);
    try {
      const result = await register(formData.email, formData.password, formData.nickname, fullCode);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || '注册失败，请重试');
      }
    } catch {
      setError('注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-12">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-pink-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
      </div>

      <GlassCard className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-6 pt-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              论文助手
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {step === 1 ? '创建账户' : '验证邮箱'}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {step === 1 ? '加入我们开始学术写作之旅' : `验证码已发送至 ${formData.email}`}
          </p>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-center gap-3 mb-6 px-6">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step > s
                  ? 'bg-green-500 text-white'
                  : step === s
                  ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
              }`}>
                {step > s ? <Check className="w-3.5 h-3.5" /> : s}
              </div>
              <span className={`text-xs ${step === s ? 'text-gray-700 dark:text-gray-200 font-medium' : 'text-gray-400'}`}>
                {s === 1 ? '填写信息' : '验证邮箱'}
              </span>
              {s < 2 && <div className={`w-8 h-0.5 ${step > s ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />}
            </div>
          ))}
        </div>

        {/* 奖励提示 */}
        {step === 1 && (
          <div className="mx-6 mb-5 p-3.5 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10 border border-pink-200 dark:border-pink-800/20">
            <p className="text-sm text-pink-700 dark:text-pink-400">
              🎁 注册即送 <span className="font-bold">100积分</span>，可免费体验所有基础功能！
            </p>
          </div>
        )}

        {/* 错误/成功提示 */}
        <div className="px-6">
          {error && (
            <div className="mb-4 p-3.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          {successMsg && !error && (
            <div className="mb-4 p-3.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              {successMsg}
            </div>
          )}
        </div>

        {/* ── Step 1：填写信息 ── */}
        {step === 1 && (
          <form onSubmit={handleSendCode} className="space-y-5 px-6 pb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">昵称</label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                placeholder="您的昵称（2-20个字符）"
                required
                minLength={2}
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">邮箱地址</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">密码</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="创建密码"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all pr-12 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {passwordRequirements.map((req, i) => (
                  <div key={i} className={`flex items-center gap-1.5 text-xs ${req.met ? 'text-green-500' : 'text-gray-400'}`}>
                    <Check className={`w-3 h-3 ${req.met ? 'opacity-100' : 'opacity-30'}`} />
                    {req.text}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">确认密码</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="再次输入密码"
                required
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all text-sm"
              />
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="agreement"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
              />
              <label htmlFor="agreement" className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                我已阅读并同意{' '}
                <Link to="/terms" target="_blank" className="text-pink-500 hover:text-pink-600 transition-colors inline-flex items-center gap-0.5">
                  《用户协议》
                  <ExternalLink className="w-3 h-3" />
                </Link>
                {' '}和{' '}
                <Link to="/privacy" target="_blank" className="text-pink-500 hover:text-pink-600 transition-colors inline-flex items-center gap-0.5">
                  《隐私政策》
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" />发送中...</>
              ) : (
                <><Mail className="w-4 h-4" />发送验证码</>
              )}
            </button>
          </form>
        )}

        {/* ── Step 2：输入验证码 ── */}
        {step === 2 && (
          <form onSubmit={handleRegister} className="px-6 pb-6 space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 mb-3">
                <ShieldCheck className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                请输入发送至<br />
                <span className="font-semibold text-gray-700 dark:text-gray-200">{formData.email}</span><br />
                的6位验证码
              </p>
            </div>

            {/* 6格验证码输入 */}
            <div className="flex justify-center gap-2" onPaste={handleCodePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { codeRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleCodeInput(i, e.target.value)}
                  onKeyDown={e => handleCodeKeyDown(i, e)}
                  className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all bg-white dark:bg-gray-700
                    ${digit
                      ? 'border-purple-400 text-purple-600 dark:text-purple-400 shadow-sm shadow-purple-200'
                      : 'border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white'
                    }
                    focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20`}
                />
              ))}
            </div>

            {/* 重发 */}
            <div className="text-center text-sm text-gray-500">
              没收到验证码？{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0 || loading}
                className={`font-semibold transition-colors ${
                  countdown > 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-pink-500 hover:text-pink-600 cursor-pointer'
                }`}
              >
                {countdown > 0 ? `${countdown}秒后重发` : '重新发送'}
              </button>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || code.join('').length < 6}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />注册中...</>
                ) : (
                  '完成注册'
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep(1); setError(''); setCode(['','','','','','']); }}
                className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm"
              >
                ← 返回修改信息
              </button>
            </div>
          </form>
        )}

        {/* 登录链接 */}
        <p className="text-center pb-6 text-gray-600 dark:text-gray-400 text-sm">
          已有账户？{' '}
          <Link to="/login" className="text-pink-500 hover:text-pink-600 font-semibold transition-colors">
            立即登录
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
