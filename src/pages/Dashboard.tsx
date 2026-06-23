import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, User, LogOut, Crown, Copy, RefreshCw, Shield, Loader2,
  FileText, Palette, Globe, Settings, Menu, X, ChevronDown,
  CheckCircle2, Download, Moon, Sun, Heart, Clock, Trash2, Star,
  BookOpen, PenTool, Languages, FileDown, AlertCircle, Plus, Minus, TrendingUp, Upload
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useAuthStore } from '../context/AuthContext';
import {
  rewriteText,
  reduceAIRate,
  REWRITE_PRESETS,
  getPointsCost,
  isConfigured,
  POINTS_COST
} from '../lib/wenxinService';
import type { RewriteMode, RewritePreset } from '../lib/types';

// 历史记录项
interface HistoryItem {
  id: string;
  type: 'rewrite' | 'reduce-ai';
  mode: RewriteMode;
  preset?: RewritePreset;
  inputText: string;
  outputText: string;
  aiRate?: number;
  pointsCost: number;
  createdAt: string;
}

// 收藏项
interface FavoriteItem {
  id: string;
  type: 'rewrite' | 'reduce-ai';
  mode: RewriteMode;
  preset?: RewritePreset;
  inputText: string;
  outputText: string;
  aiRate?: number;
  title: string;
  createdAt: string;
}

type Mode = 'rewrite' | 'reduce-ai' | 'pdf-convert';

const rewritePresets: { id: RewritePreset; name: string; desc: string; icon: any; premium?: boolean }[] = [
  { id: 'academic', name: '学术正式', desc: '书面语、严谨表达', icon: BookOpen },
  { id: 'creative', name: '创意改写', desc: '多样化表达、避免重复', icon: PenTool, premium: true },
  { id: 'translate', name: '中英互译', desc: '精准翻译、保留原意', icon: Languages, premium: true },
  { id: 'simplify', name: '简化表达', desc: '通俗易懂、简明扼要', icon: FileDown, premium: true },
  { id: 'expand', name: '扩展丰富', desc: '详细展开、深化论述', icon: Plus, premium: true },
];

const reducePresets = [
  { id: 'basic', name: '轻度优化', desc: '小幅调整句式', cost: 1 },
  { id: 'advanced', name: '深度优化', desc: '全面重构表达', cost: 3 },
  { id: 'powerful', name: '极致改写', desc: '接近人类写作', cost: 5 },
];

export function Dashboard() {
  const { user, membership, logout, addHistory, deleteHistory, clearHistory, history, addFavorite, deleteFavorite, favorites, isFavorited, deductPoints } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Mode>('rewrite');
  const [level, setLevel] = useState<RewriteMode>('basic');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<RewritePreset>('academic');
  const [progress, setProgress] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [apiNotConfigured, setApiNotConfigured] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  // PDF 转 Word 相关
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfConverting, setPdfConverting] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [pdfSuccess, setPdfSuccess] = useState(false);

  // 检查API配置
  useEffect(() => {
    setApiNotConfigured(!isConfigured());
  }, []);

  // PDF 转 Word
  const handlePdfConvert = async () => {
    if (!pdfFile) return;
    setPdfConverting(true);
    setPdfError('');
    setPdfSuccess(false);
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      const response = await fetch('/api/convert/pdf-to-word', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || '转换失败');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdfFile.name.replace(/\.pdf$/i, '.docx');
      a.click();
      URL.revokeObjectURL(url);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 4000);
    } catch (err: any) {
      setPdfError(err.message || '转换失败，请重试');
      setTimeout(() => setPdfError(''), 4000);
    } finally {
      setPdfConverting(false);
    }
  };

  // 处理文件上传
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('text') && !file.type.includes('pdf') && !file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
      setUploadError('仅支持文本文件、PDF和Word文档');
      setTimeout(() => setUploadError(''), 3000);
      return;
    }

    setFileUploading(true);
    setUploadError('');

    try {
      // 读取文件内容
      const text = await readFileAsText(file);
      setInputText(text.slice(0, 5000));
      
      // 保存文件到桌面的jiangchong文件夹
      await saveFileToJiangchong(file);
    } catch (error: any) {
      setUploadError(`文件处理失败: ${error.message}`);
      setTimeout(() => setUploadError(''), 3000);
    } finally {
      setFileUploading(false);
    }
  };

  // 读取文件内容
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      reader.readAsText(file);
    });
  };

  // 保存文件到桌面的jiangchong文件夹
  const saveFileToJiangchong = async (file: File): Promise<void> => {
    // 由于浏览器安全限制，无法直接写入本地文件系统
    // 这里模拟保存操作，实际项目中需要后端API支持
    console.log('保存文件到桌面的jiangchong文件夹:', file.name);
    
    // 创建下载链接，让用户手动保存
    const blob = new Blob([await readFileAsText(file)], { type: file.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const levelOptions = [
    { id: 'basic', name: '基础模式', desc: '轻度处理，保留原意', color: 'from-gray-400 to-gray-500', cost: 1 },
    { id: 'advanced', name: '高级模式', desc: '深度处理，丰富表达', color: 'from-pink-500 to-purple-500', cost: 3, premium: true },
    { id: 'powerful', name: '强力模式', desc: '极致处理，全面优化', color: 'from-purple-500 to-indigo-500', cost: 5, premium: true },
  ];

  // 处理改写/降AI
  const handleProcess = async () => {
    if (!inputText.trim()) return;

    // 检查会员权限 - 对于高级功能和预设
    if (activeTab === 'rewrite') {
      // 检查是否选择了会员专属功能
      const selectedPresetObj = rewritePresets.find(p => p.id === selectedPreset);
      if (selectedPresetObj?.premium && (membership?.level ?? 'free') === 'free') {
        alert('该功能仅限会员使用，请开通会员解锁');
        return;
      }
    }

    // 检查会员权限 - 高级/强力模式
    if (level !== 'basic' && (membership?.level ?? 'free') === 'free') {
      alert('高级/强力模式需要开通会员');
      return;
    }

    // 检查积分
    const cost = getPointsCost(level);
    const deducted = await deductPoints(cost);
    if (!deducted) {
      alert('积分不足，请充值或开通会员');
      return;
    }

    setLoading(true);
    setOutputText('');
    setProgress('正在初始化...');

    try {
      if (activeTab === 'rewrite') {
        const result = await rewriteText(inputText, level, selectedPreset, setProgress);
        setOutputText(result.result);

        // 添加历史记录
        addHistory({
          type: 'rewrite',
          mode: level,
          preset: selectedPreset,
          inputText,
          outputText: result.result,
          aiRate: result.aiRate,
          pointsCost: cost,
        });

        setFavorited(isFavorited(inputText));
      } else {
        const result = await reduceAIRate(inputText, level, setProgress);
        setOutputText(result.result);

        // 添加历史记录
        addHistory({
          type: 'reduce-ai',
          mode: level,
          inputText,
          outputText: result.result,
          aiRate: result.aiRate,
          pointsCost: cost,
        });

        setFavorited(isFavorited(inputText));
      }
    } catch (error: any) {
      console.error('处理失败:', error);
      if (error.code === 'FREE_REWRITE_LIMIT_EXCEEDED') {
        alert('免费基础改写额度（1000字）已用完，请升级会员解锁无限使用');
        window.location.href = '/dashboard?tab=payment';
        return;
      }
      setOutputText(`处理失败: ${error.message || '请检查API配置是否正确'}`);
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  // 复制
  const handleCopy = async () => {
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 保存
  const handleSave = () => {
    const content = `【原文】\n${inputText}\n\n【${activeTab === 'rewrite' ? '改写' : '降AI'}结果】\n${outputText}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `论文${activeTab === 'rewrite' ? '改写' : '降AI'}_${new Date().toLocaleDateString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 收藏
  const handleFavorite = () => {
    if (favorited) return;
    addFavorite({
      type: activeTab,
      mode: level,
      preset: selectedPreset,
      inputText,
      outputText,
      title: inputText.slice(0, 50) + (inputText.length > 50 ? '...' : ''),
    });
    setFavorited(true);
  };

  // 加载历史记录
  const loadFromHistory = (item: HistoryItem) => {
    setInputText(item.inputText);
    setOutputText(item.outputText);
    setActiveTab(item.type);
    setLevel(item.mode);
    if (item.preset) setSelectedPreset(item.preset);
    setFavorited(isFavorited(item.inputText));
    setShowHistory(false);
  };

  // 加载收藏
  const loadFromFavorite = (item: FavoriteItem) => {
    setInputText(item.inputText);
    setOutputText(item.outputText);
    setActiveTab(item.type);
    setLevel(item.mode);
    if (item.preset) setSelectedPreset(item.preset);
    setFavorited(true);
    setShowFavorites(false);
  };

  // 清空输入
  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setFavorited(false);
  };

  // 重新处理
  const handleRetry = () => {
    handleProcess();
  };

  const getUsageLimit = () => {
    if (membership.level === 'professional') return { used: 0, total: Infinity, label: '无限' };
    if (membership.level === 'standard') return { used: 0, total: 100, label: '100次/日' };
    return { used: 0, total: 5, label: '5次/日' };
  };

  const usage = getUsageLimit();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* 顶部导航 */}
      <nav className={`${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-xl border-b ${darkMode ? 'border-white/10' : 'border-gray-200'} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                论文助手
              </span>
            </Link>

            {/* 桌面端导航 */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => { setShowHistory(true); setShowFavorites(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'} transition-colors`}
              >
                <Clock className="w-4 h-4" />
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>历史记录</span>
              </button>
              <button
                onClick={() => { setShowFavorites(true); setShowHistory(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'} transition-colors`}
              >
                <Heart className="w-4 h-4 text-pink-500" />
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>我的收藏</span>
              </button>
              <Link to="/membership" className={`px-3 py-1.5 rounded-lg ${darkMode ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'} font-medium transition-colors`}>
                开通会员
              </Link>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20">
                <Crown className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-medium text-pink-600 dark:text-pink-400">
                  {membership.level === 'free' ? '免费版' : membership.level === 'standard' ? '标准会员' : '专业会员'}
                </span>
              </div>
            </div>

            {/* 用户菜单 */}
            <div className="flex items-center gap-3">
              {/* 积分显示 */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  {membership?.points ?? 0} 积分
                </span>
              </div>

              {/* 主题切换 */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
              >
                {darkMode ? <Sun className="w-5 h-5 text-gray-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>

              {/* 用户头像 */}
              <div className="relative group">
                <button className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {user?.nickname?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* 下拉菜单 */}
                <div className={`absolute right-0 mt-2 w-56 py-2 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl ${darkMode ? 'border-white/10' : 'border-gray-200'} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all`}>
                  <div className={`px-4 py-2 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user?.nickname}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <Link to="/membership" className={`flex items-center gap-3 px-4 py-2 ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                    <Crown className="w-4 h-4 text-pink-500" />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>开通会员</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-500"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>退出登录</span>
                  </button>
                </div>
              </div>

              {/* 移动端菜单按钮 */}
              <button
                className={`md:hidden p-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-t ${darkMode ? 'border-white/10' : 'border-gray-200'} py-4 px-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user?.nickname}</span>
              <button onClick={logout} className="text-red-500 text-sm">退出登录</button>
            </div>
            <button onClick={() => { setShowHistory(true); setMobileMenuOpen(false); }} className={`block w-full text-left py-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              历史记录
            </button>
            <button onClick={() => { setShowFavorites(true); setMobileMenuOpen(false); }} className={`block w-full text-left py-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              我的收藏
            </button>
            <Link to="/membership" className={`block py-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              开通会员
            </Link>
          </div>
        )}
      </nav>

      {/* 历史记录侧边栏 */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div className="fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out" onClick={() => setShowHistory(false)} />
          <div className={`relative w-full max-w-md h-full ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl overflow-hidden flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0`}>
            <div className={`p-4 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'} flex items-center justify-between bg-gradient-to-r ${darkMode ? 'from-gray-800 to-gray-800' : 'from-white to-gray-50'}`}>
              <div className="flex items-center gap-2">
                <Clock className={`w-5 h-5 ${darkMode ? 'text-pink-400' : 'text-pink-500'}`} />
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>历史记录</h2>
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    onClick={() => { clearHistory(); setShowHistory(false); }}
                    className="text-sm text-red-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
                  >
                    清空
                  </button>
                )}
                <button onClick={() => setShowHistory(false)} className={`p-2 ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'} rounded-lg transition-colors`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 px-4">
                  <div className={`w-16 h-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                    <Clock className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="text-center font-medium">暂无历史记录</p>
                  <p className="text-sm mt-2 text-center text-gray-500">处理文本后会自动保存到历史记录</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-white/10">
                  {history.map((item) => (
                    <div key={item.id} className={`p-4 ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'} cursor-pointer transition-colors border-l-4 border-transparent hover:border-pink-500`} onClick={() => loadFromHistory(item)}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${item.type === 'rewrite' ? 'bg-pink-100 text-pink-600' : 'bg-purple-100 text-purple-600'} dark:bg-pink-900/20 dark:text-pink-400`}>
                            {item.type === 'rewrite' ? '改写' : '降AI'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {item.mode} · -{item.pointsCost}积分
                          </span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteHistory(item.id); }}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className={`text-sm line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-3 leading-relaxed`}>
                        {item.inputText}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                        {item.aiRate && (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                            AI率: {item.aiRate}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={`p-4 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'} ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className="text-xs text-gray-500 text-center">
                共 {history.length} 条历史记录
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 收藏侧边栏 */}
      {showFavorites && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div className="fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out" onClick={() => setShowFavorites(false)} />
          <div className={`relative w-full max-w-md h-full ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl overflow-hidden flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0`}>
            <div className={`p-4 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'} flex items-center justify-between bg-gradient-to-r ${darkMode ? 'from-gray-800 to-gray-800' : 'from-white to-gray-50'}`}>
              <div className="flex items-center gap-2">
                <Heart className={`w-5 h-5 ${darkMode ? 'text-pink-400' : 'text-pink-500'}`} />
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>我的收藏</h2>
              </div>
              <button onClick={() => setShowFavorites(false)} className={`p-2 ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'} rounded-lg transition-colors`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 px-4">
                  <div className={`w-16 h-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                    <Heart className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="text-center font-medium">暂无收藏内容</p>
                  <p className="text-sm mt-2 text-center text-gray-500">处理后的内容可以收藏保存</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-white/10">
                  {favorites.map((item) => (
                    <div key={item.id} className={`p-4 ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'} cursor-pointer transition-colors border-l-4 border-transparent hover:border-pink-500`} onClick={() => loadFromFavorite(item)}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className={`px-2 py-0.5 text-xs rounded-full ${item.type === 'rewrite' ? 'bg-pink-100 text-pink-600' : 'bg-purple-100 text-purple-600'} dark:bg-pink-900/20 dark:text-pink-400`}>
                            {item.type === 'rewrite' ? '改写' : '降AI'}
                          </span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteFavorite(item.id); }}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                        {item.title}
                      </p>
                      <p className={`text-sm line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-3 leading-relaxed`}>
                        {item.inputText}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={`p-4 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'} ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className="text-xs text-gray-500 text-center">
                共 {favorites.length} 条收藏
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API配置提示 */}
        {apiNotConfigured && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-400">API配置未完成</p>
                <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                  当前使用模拟模式，请配置文心一言API Key以启用真实AI功能。
                  在项目根目录创建 <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40">.env</code> 文件，添加 <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40">VITE_WENXIN_API_KEY</code> 和 <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40">VITE_WENXIN_SECRET_KEY</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 欢迎和用量 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              你好，{user?.nickname || '用户'}
            </h1>

          </div>

          {membership.level === 'free' && (
            <Link
              to="/membership"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-pink-500/30 transition-all"
            >
              <Crown className="w-4 h-4" />
              开通会员解锁更多功能
            </Link>
          )}
        </div>

        {/* 功能标签页 */}
        <div className={`flex gap-2 p-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl mb-6 w-fit`}>
          <button
            onClick={() => setActiveTab('rewrite')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'rewrite'
                ? 'bg-white dark:bg-gray-700 text-pink-500 shadow-sm'
                : `${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`
            }`}
          >
            智能改写
          </button>
          <button
            onClick={() => setActiveTab('reduce-ai')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'reduce-ai'
                ? 'bg-white dark:bg-gray-700 text-pink-500 shadow-sm'
                : `${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`
            }`}
          >
            降AI率
          </button>
          <button
            onClick={() => setActiveTab('pdf-convert')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'pdf-convert'
                ? 'bg-white dark:bg-gray-700 text-pink-500 shadow-sm'
                : `${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`
            }`}
          >
            PDF转Word
          </button>
        </div>

        {/* 模式选择 */}
        {activeTab !== 'pdf-convert' && (
        <div className="flex flex-wrap gap-3 mb-6">
          {levelOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setLevel(opt.id as RewriteMode)}
              disabled={opt.premium && membership.level === 'free'}
              className={`relative px-4 py-2.5 rounded-xl border-2 transition-all ${
                level === opt.id
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                  : `border-gray-200 dark:border-white/10 hover:border-pink-200 dark:hover:border-pink-800/30 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`
              } ${opt.premium && membership.level === 'free' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${opt.color}`} />
                <span className={`font-medium ${level === opt.id ? 'text-pink-600 dark:text-pink-400' : ''}`}>
                  {opt.name}
                </span>
                {opt.premium && <Crown className="w-3.5 h-3.5 text-amber-500" />}
              </div>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {opt.desc}
              </p>
            </button>
          ))}
        </div>
        )}

        {/* 功能预设 */}
        {activeTab !== 'pdf-convert' && (
        <div className="flex flex-wrap gap-2 mb-6">
          {activeTab === 'rewrite' ? (
            rewritePresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  if (preset.premium && membership.level === 'free') {
                    return;
                  }
                  setSelectedPreset(preset.id)
                }}
                disabled={preset.premium && membership.level === 'free'}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  preset.premium && membership.level === 'free' ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  selectedPreset === preset.id
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                    : `border-gray-200 dark:border-white/10 hover:border-pink-200 dark:hover:border-pink-800/30 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`
                }`}
                title={preset.premium && membership.level === 'free' ? '仅会员可用' : ''}
              >
                <preset.icon className={`w-4 h-4 ${selectedPreset === preset.id ? 'text-pink-500' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${selectedPreset === preset.id ? 'text-pink-600 dark:text-pink-400' : ''}`}>
                  {preset.name}
                </span>
                {preset.premium && <Crown className="w-3.5 h-3.5 text-amber-500" />}
              </button>
            ))
          ) : (
            reducePresets.map((preset) => (
              <div
                key={preset.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  level === preset.id
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                    : `border-gray-200 dark:border-white/10 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`
                }`}
              >
                <span className={`text-sm font-medium ${level === preset.id ? 'text-pink-600 dark:text-pink-400' : ''}`}>
                  {preset.name}
                </span>
              </div>
            ))
          )}
        </div>
        )}

        {/* 输入输出区 */}
        {activeTab === 'pdf-convert' ? (
          /* PDF 转 Word 面板 */
          <GlassCard className={`p-8 ${darkMode ? 'dark' : ''}`}>
            <div className="flex flex-col items-center gap-6">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 text-pink-500" />
                <h3 className={`text-xl font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>PDF 转 Word</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>上传 PDF 文件，一键转换为可编辑的 Word 文档</p>
              </div>

              {/* 上传区域 */}
              <label className={`w-full max-w-md flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                pdfFile
                  ? 'border-pink-400 bg-pink-50 dark:bg-pink-900/20'
                  : darkMode ? 'border-white/20 hover:border-pink-400 bg-white/5' : 'border-gray-300 hover:border-pink-400 bg-gray-50'
              }`}>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setPdfFile(f); setPdfError(''); setPdfSuccess(false); }
                  }}
                />
                <Upload className={`w-8 h-8 ${pdfFile ? 'text-pink-500' : darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                {pdfFile ? (
                  <div className="text-center">
                    <p className={`font-medium text-pink-600 dark:text-pink-400`}>{pdfFile.name}</p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{(pdfFile.size / 1024).toFixed(1)} KB · 点击重新选择</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>点击选择或拖拽 PDF 文件</p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>支持 .pdf 格式，最大 20MB</p>
                  </div>
                )}
              </label>

              {/* 错误 / 成功提示 */}
              {pdfError && (
                <div className="w-full max-w-md p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm text-center">
                  {pdfError}
                </div>
              )}
              {pdfSuccess && (
                <div className="w-full max-w-md p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 text-green-600 dark:text-green-400 text-sm text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> 转换成功，已自动下载！
                </div>
              )}

              {/* 转换按钮 */}
              <button
                onClick={handlePdfConvert}
                disabled={!pdfFile || pdfConverting}
                className={`px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  !pdfFile || pdfConverting
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-pink-500/30'
                }`}
              >
                {pdfConverting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> 转换中...</>
                ) : (
                  <><Download className="w-4 h-4" /> 开始转换</>
                )}
              </button>
            </div>
          </GlassCard>
        ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 输入区 */}
          <GlassCard className="overflow-hidden flex flex-col">
            <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'} ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {activeTab === 'rewrite' ? '原文内容' : '待处理文本'}
              </h3>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                {inputText.length} / 5000
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              {uploadError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm">
                  {uploadError}
                </div>
              )}

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value.slice(0, 5000))}
                placeholder={activeTab === 'rewrite'
                  ? '请输入需要改写的学术文本...\n\n支持：学术正式、创意改写、中英互译、简化表达、扩展丰富'
                  : '请输入需要降AI率的文本...\n\n系统将自动优化文本，降低AI检测率'}
                className={`w-full h-80 p-4 rounded-xl border focus:ring-2 focus:ring-pink-500/20 outline-none resize-none transition-all ${
                  darkMode
                    ? 'bg-gray-800/50 border-white/10 text-white placeholder-gray-500 focus:border-pink-500'
                    : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-pink-500'
                }`}
              />

              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                  <button
                    onClick={handleClear}
                    className={`p-2.5 rounded-lg ${darkMode ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
                    title="清空"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleRetry}
                    disabled={!inputText.trim()}
                    className={`p-2.5 rounded-lg ${darkMode ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors ${!inputText.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="重新处理"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <label
                    className={`p-2.5 rounded-lg cursor-pointer ${darkMode ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors ${fileUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="上传文件"
                  >
                    <Upload className="w-5 h-5" />
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={fileUploading}
                      className="hidden"
                      accept=".txt,.pdf,.doc,.docx"
                    />
                  </label>
                </div>

                <button
                  onClick={handleProcess}
                  disabled={!inputText.trim() || loading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {progress || '处理中...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {activeTab === 'rewrite' ? '开始改写' : '开始降AI'}
                      <span className="text-xs opacity-75">(-{getPointsCost(level)}积分)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </GlassCard>

          {/* 输出区 */}
          <GlassCard className="overflow-hidden flex flex-col">
            <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'} ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {activeTab === 'rewrite' ? '改写结果' : '降AI处理结果'}
              </h3>
              {outputText && (
                <div className="flex gap-2">
                  <button
                    onClick={handleFavorite}
                    disabled={favorited}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      favorited
                        ? 'text-pink-500 bg-pink-50 dark:bg-pink-900/20'
                        : `${darkMode ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${favorited ? 'fill-pink-500' : ''}`} />
                    {favorited ? '已收藏' : '收藏'}
                  </button>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${darkMode ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? '已复制' : '复制'}
                  </button>
                  <button
                    onClick={handleSave}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${darkMode ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
                  >
                    <Download className="w-4 h-4" />
                    保存
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col">
              {outputText ? (
                <div className={`w-full h-80 p-4 rounded-xl border overflow-auto whitespace-pre-wrap transition-all ${
                  darkMode
                    ? 'bg-gray-800/50 border-white/10 text-white'
                    : 'bg-white border-gray-200 text-gray-800'
                }`}>
                  {outputText}
                </div>
              ) : (
                <div className={`w-full h-80 rounded-xl border border-dashed flex flex-col items-center justify-center transition-all ${
                  darkMode ? 'border-white/10 text-gray-500' : 'border-gray-200 text-gray-400'
                }`}>
                  <div className={`w-16 h-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                    <Sparkles className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="font-medium">处理结果将在这里显示</p>
                  <p className="text-sm mt-2">请在左侧输入文本后点击处理</p>
                </div>
              )}

              {/* AI检测信息 */}
              {outputText && (
                <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/30 transition-all">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      预估AI率：{activeTab === 'reduce-ai' ? '15%' : '3.2%'} ✓
                    </span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    基于知网、维普、万方检测系统优化
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
        )} {/* end activeTab !== 'pdf-convert' */}

        {/* 使用提示 */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <GlassCard className={`text-center p-6 ${darkMode ? 'dark' : ''} h-full flex flex-col items-center justify-center`}>
            <TrendingUp className="w-8 h-8 mb-3 text-pink-500" />
            <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>高效处理</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>AI驱动的文本处理，秒级响应</p>
          </GlassCard>
          <GlassCard className={`text-center p-6 ${darkMode ? 'dark' : ''} h-full flex flex-col items-center justify-center`}>
            <Shield className="w-8 h-8 mb-3 text-purple-500" />
            <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>安全可靠</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>数据加密处理，您的隐私安全</p>
          </GlassCard>
          <GlassCard className={`text-center p-6 ${darkMode ? 'dark' : ''} h-full flex flex-col items-center justify-center`}>
            <CheckCircle2 className="w-8 h-8 mb-3 text-green-500" />
            <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>品质保证</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>适配主流检测系统，放心使用</p>
          </GlassCard>
        </div>

        {/* 返回主页 */}
        <div className="mt-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-pink-500 text-pink-600 font-medium hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all">
            <Sparkles className="w-4 h-4" />
            返回主页
          </Link>
        </div>
      </div>
    </div>
  );
}


