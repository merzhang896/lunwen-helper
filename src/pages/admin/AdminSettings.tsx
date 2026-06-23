import { useState, useEffect } from 'react';
import { Save, Shield, Bell, Key, Globe, Palette, Database, Loader2, RefreshCw, Download, RotateCcw, Trash2 } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { adminApi } from '../../services/api';

export function AdminSettings() {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    site: {
      name: '论文助手',
      description: '专业的学术写作辅助平台，提供论文改写、降重、降AI率等服务。',
      contactEmail: 'support@bunny.com',
      maintenanceMode: false
    },
    membership: {
      free: { points: 100, dailyLimit: 5 },
      standard: { points: 1000, dailyLimit: 100, price: 99 },
      professional: { points: 5000, dailyLimit: Infinity, price: 299 }
    },
    security: {
      twoFactorAuth: false
    },
    notification: {
      newUser: true,
      membershipPurchase: true,
      unusualLogin: true,
      systemMaintenance: true
    },
    api: {
      apiKey: '',
      rateLimit: '1000次/分钟'
    },
    appearance: {
      darkMode: false,
      primaryColor: '#ec4899'
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState(false);
  const [backups, setBackups] = useState<any[]>([]);
  const [backupsLoading, setBackupsLoading] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);

  const sections = [
    { id: 'general', icon: Globe, label: '基本设置' },
    { id: 'security', icon: Shield, label: '安全设置' },
    { id: 'notification', icon: Bell, label: '通知设置' },
    { id: 'api', icon: Key, label: 'API配置' },
    { id: 'appearance', icon: Palette, label: '外观设置' },
    { id: 'database', icon: Database, label: '数据管理' },
  ];

  // 加载设置数据
  useEffect(() => {
    loadSettings();
  }, []);

  // 当切换到数据管理标签时加载备份列表
  useEffect(() => {
    if (activeSection === 'database') {
      loadBackups();
    }
  }, [activeSection]);

  const loadSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminApi.getSettings();
      // 确保settings对象结构正确
      const settingsData = response?.settings || {};
      setSettings({
        site: {
          name: '论文助手',
          description: '专业的学术写作辅助平台，提供论文改写、降重、降AI率等服务。',
          contactEmail: 'support@bunny.com',
          maintenanceMode: false,
          ...(settingsData.site || {})
        },
        membership: {
          free: { points: 100, dailyLimit: 5 },
          standard: { points: 1000, dailyLimit: 100, price: 99 },
          professional: { points: 5000, dailyLimit: Infinity, price: 299 },
          ...(settingsData.membership || {})
        },
        security: {
          twoFactorAuth: false,
          ...(settingsData.security || {})
        },
        notification: {
          newUser: true,
          membershipPurchase: true,
          unusualLogin: true,
          systemMaintenance: true,
          ...(settingsData.notification || {})
        },
        api: {
          apiKey: 'sk_live_xxxxxxxxxxxxx',
          rateLimit: '1000次/分钟',
          ...(settingsData.api || {})
        },
        appearance: {
          darkMode: false,
          primaryColor: '#ec4899',
          ...(settingsData.appearance || {})
        }
      });
    } catch (err: any) {
      // 处理认证错误
      if (err.message.includes('认证已过期') || err.message.includes('无效的认证令牌')) {
        // 清除本地存储的令牌
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-user');
        localStorage.removeItem('refresh-token');
        // 跳转到登录页
        window.location.href = '/admin/login';
        return;
      }
      setError(err.message || '加载设置失败');
      // 确保settings对象不会变为undefined
      if (!settings) {
        setSettings({
          site: {
            name: '论文助手',
            description: '专业的学术写作辅助平台，提供论文改写、降重、降AI率等服务。',
            contactEmail: 'support@bunny.com',
            maintenanceMode: false
          },
          membership: {
            free: { points: 100, dailyLimit: 5 },
            standard: { points: 1000, dailyLimit: 100, price: 99 },
            professional: { points: 5000, dailyLimit: Infinity, price: 299 }
          },
          security: {
            twoFactorAuth: false
          },
          notification: {
            newUser: true,
            membershipPurchase: true,
            unusualLogin: true,
            systemMaintenance: true
          },
          api: {
            apiKey: 'sk_live_xxxxxxxxxxxxx',
            rateLimit: '1000次/分钟'
          },
          appearance: {
            darkMode: false,
            primaryColor: '#ec4899'
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setError('');
    try {
      await adminApi.updateSettings(settings);
      alert('设置保存成功');
    } catch (err: any) {
      // 处理认证错误
      if (err.message.includes('认证已过期') || err.message.includes('无效的认证令牌')) {
        // 清除本地存储的令牌
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-user');
        localStorage.removeItem('refresh-token');
        // 跳转到登录页
        window.location.href = '/admin/login';
        return;
      }
      setError(err.message || '保存设置失败');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section: keyof typeof settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [key]: value
      }
    }));
  };

  // 重新生成 API 密钥
  const handleRegenerateApiKey = async () => {
    if (!confirm('确定要重新生成 API 密钥吗？旧的密钥将立即失效。')) {
      return;
    }
    setRegeneratingKey(true);
    try {
      const response = await adminApi.regenerateApiKey();
      setSettings(prev => ({
        ...prev,
        api: {
          ...prev.api,
          apiKey: response.apiKey
        }
      }));
      alert('API 密钥重新生成成功');
    } catch (err: any) {
      setError(err.message || '重新生成 API 密钥失败');
    } finally {
      setRegeneratingKey(false);
    }
  };

  // 加载备份列表
  const loadBackups = async () => {
    setBackupsLoading(true);
    try {
      const response = await adminApi.getBackups();
      setBackups(response.backups || []);
    } catch (err: any) {
      console.error('加载备份列表失败:', err);
    } finally {
      setBackupsLoading(false);
    }
  };

  // 创建备份
  const handleCreateBackup = async () => {
    const notes = prompt('请输入备份备注（可选）：');
    if (notes === null) return; // 用户取消
    
    setCreatingBackup(true);
    try {
      const response = await adminApi.createBackup(notes || undefined);
      setBackups(prev => [response.backup, ...prev]);
      alert('备份创建成功');
    } catch (err: any) {
      alert(err.message || '创建备份失败');
    } finally {
      setCreatingBackup(false);
    }
  };

  // 恢复备份
  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('确定要恢复此备份吗？当前数据将被替换，系统会自动创建当前数据的备份。')) {
      return;
    }
    try {
      await adminApi.restoreBackup(backupId);
      alert('数据恢复成功，页面将刷新');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || '恢复备份失败');
    }
  };

  // 删除备份
  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('确定要删除此备份吗？此操作不可恢复。')) {
      return;
    }
    try {
      await adminApi.deleteBackup(backupId);
      setBackups(prev => prev.filter(b => b.id !== backupId));
      alert('备份删除成功');
    } catch (err: any) {
      alert(err.message || '删除备份失败');
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN');
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">系统设置</h1>
        <p className="text-gray-500 mt-1">配置平台各项系统参数</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* 左侧导航 */}
        <GlassCard className="p-2 lg:col-span-1 h-fit">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span className="font-medium">{section.label}</span>
              </button>
            ))}
          </nav>
        </GlassCard>

        {/* 右侧内容 */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">
              {error}
              <button 
                className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg"
                onClick={loadSettings}
              >
                重试
              </button>
            </div>
          ) : (
            <>
              {/* 基本设置 */}
              {activeSection === 'general' && (
                <GlassCard className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">基本设置</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        网站名称
                      </label>
                      <input
                        type="text"
                        value={(settings?.site?.name || '论文助手')}
                        onChange={(e) => handleInputChange('site', 'name', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-pink-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        网站描述
                      </label>
                      <textarea
                        rows={3}
                        value={(settings?.site?.description || '专业的学术写作辅助平台，提供论文改写、降重、降AI率等服务。')}
                        onChange={(e) => handleInputChange('site', 'description', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-pink-500 outline-none transition-all resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        联系邮箱
                      </label>
                      <input
                        type="email"
                        value={(settings?.site?.contactEmail || 'support@bunny.com')}
                        onChange={(e) => handleInputChange('site', 'contactEmail', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-pink-500 outline-none transition-all"
                      />
                    </div>
                    <div className="flex items-center justify-between py-4 border-t border-gray-100 dark:border-white/10">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">维护模式</p>
                        <p className="text-sm text-gray-500">开启后普通用户无法访问网站</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={(settings?.site?.maintenanceMode || false)}
                          onChange={(e) => handleInputChange('site', 'maintenanceMode', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                      </label>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/10">
                    <button 
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={saveSettings}
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saving ? '保存中...' : '保存设置'}
                    </button>
                  </div>
                </GlassCard>
              )}

              {/* 安全设置 */}
              {activeSection === 'security' && (
                <GlassCard className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">安全设置</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        当前密码
                      </label>
                      <input
                        type="password"
                        placeholder="请输入当前密码"
                        className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-pink-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        新密码
                      </label>
                      <input
                        type="password"
                        placeholder="请输入新密码"
                        className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-pink-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        确认新密码
                      </label>
                      <input
                        type="password"
                        placeholder="请再次输入新密码"
                        className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-pink-500 outline-none transition-all"
                      />
                    </div>
                    <div className="flex items-center justify-between py-4 border-t border-gray-100 dark:border-white/10">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">双因素认证</p>
                        <p className="text-sm text-gray-500">启用后登录需要输入手机验证码</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={(settings?.security?.twoFactorAuth || false)}
                          onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                      </label>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/10">
                    <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-pink-500/30">
                      <Save className="w-4 h-4" />
                      更新密码
                    </button>
                  </div>
                </GlassCard>
              )}

              {/* 通知设置 */}
              {activeSection === 'notification' && (
                <GlassCard className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">通知设置</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'newUser', title: '新用户注册', desc: '有新用户注册时发送邮件通知' },
                      { key: 'membershipPurchase', title: '会员购买', desc: '有用户购买会员时发送通知' },
                      { key: 'unusualLogin', title: '异常登录', desc: '检测到异常登录时发送告警' },
                      { key: 'systemMaintenance', title: '系统维护', desc: '系统维护前发送通知' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/10 last:border-0">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">{item.title}</p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={((settings?.notification || {})[item.key as keyof typeof settings.notification] || false)}
                            onChange={(e) => handleInputChange('notification', item.key, e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/10">
                    <button 
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={saveSettings}
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saving ? '保存中...' : '保存设置'}
                    </button>
                  </div>
                </GlassCard>
              )}

              {/* API配置 */}
              {activeSection === 'api' && (
                <GlassCard className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">API配置</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        API密钥
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={(settings?.api?.apiKey || 'sk_live_xxxxxxxxxxxxx')}
                          readOnly
                          className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-transparent font-mono"
                        />
                        <button 
                          onClick={handleRegenerateApiKey}
                          disabled={regeneratingKey}
                          className="px-4 py-3 bg-gray-100 dark:bg-white/5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                          {regeneratingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                          重新生成
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        API限额
                      </label>
                      <select 
                        className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-pink-500 outline-none transition-all"
                        value={(settings?.api?.rateLimit || '1000次/分钟')}
                        onChange={(e) => handleInputChange('api', 'rateLimit', e.target.value)}
                      >
                        <option>1000次/分钟</option>
                        <option>500次/分钟</option>
                        <option>100次/分钟</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/10">
                    <button 
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={saveSettings}
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saving ? '保存中...' : '保存配置'}
                    </button>
                  </div>
                </GlassCard>
              )}

              {/* 外观设置 */}
              {activeSection === 'appearance' && (
                <GlassCard className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">外观设置</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-white/10">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">深色模式</p>
                        <p className="text-sm text-gray-500">启用深色主题</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={(settings?.appearance?.darkMode || false)}
                          onChange={(e) => handleInputChange('appearance', 'darkMode', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        主色调
                      </label>
                      <div className="flex gap-3">
                        {['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'].map((color) => (
                          <button
                            key={color}
                            className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${
                              (settings?.appearance?.primaryColor || '#ec4899') === color ? 'border-gray-800 dark:border-white' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => handleInputChange('appearance', 'primaryColor', color)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/10">
                    <button 
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={saveSettings}
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saving ? '保存中...' : '保存设置'}
                    </button>
                  </div>
                </GlassCard>
              )}

              {/* 数据管理 */}
              {activeSection === 'database' && (
                <GlassCard className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">数据管理</h3>
                  <div className="space-y-6">
                    {/* 创建备份 */}
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">数据备份</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {backups.length > 0 
                              ? `已有 ${backups.length} 个备份，最新备份：${formatDate(backups[0].createdAt)}`
                              : '暂无备份，建议定期备份数据'
                            }
                          </p>
                        </div>
                        <button 
                          onClick={handleCreateBackup}
                          disabled={creatingBackup}
                          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                          {creatingBackup ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          立即备份
                        </button>
                      </div>
                    </div>

                    {/* 备份列表 */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">备份列表</h4>
                      {backupsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
                        </div>
                      ) : backups.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">暂无备份</p>
                      ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                          {backups.map((backup) => (
                            <div key={backup.id} className="p-3 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                  {backup.notes || '手动备份'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(backup.createdAt)} · {formatFileSize(backup.size)}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  包含: {Object.entries(backup.tables || {}).map(([k, v]) => `${k}(${v})`).join(', ')}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <button
                                  onClick={() => handleRestoreBackup(backup.id)}
                                  className="p-2 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                                  title="恢复备份"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBackup(backup.id)}
                                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="删除备份"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 危险操作 */}
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
                      <p className="font-medium text-red-600 dark:text-red-400 mb-2">危险操作</p>
                      <p className="text-sm text-red-500/80 mb-4">以下操作不可逆，请谨慎操作</p>
                      <div className="flex gap-3">
                        <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/20">
                          清空访问日志
                        </button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                          清空所有数据
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
