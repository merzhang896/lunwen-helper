import { useState, useEffect } from 'react';
import { FileText, Edit, Eye, ToggleLeft, ToggleRight, Plus, Trash2, Loader2 } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { adminApi } from '../../services/api';

export function AdminContent() {
  const [activeTab, setActiveTab] = useState<'faq' | 'testimonial'>('faq');
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [faqs, setFaqs] = useState([
    {
      id: 1,
      question: '如何使用论文助手？',
      answer: '上传您的论文文件，选择改写模式，点击开始改写即可。',
      category: '使用指南',
      status: 'active',
      sort: 1
    }
  ]);

  // 加载内容数据
  useEffect(() => {
    loadContent();
  }, [activeTab]);

  const loadContent = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'testimonial') {
        // 加载用户评价
        const response = await adminApi.getTestimonials();
        setTestimonials(response.testimonials);
      }
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
      setError(err.message || '加载内容失败');
    } finally {
      setLoading(false);
    }
  };

  // 添加内容
  const handleAddContent = () => {
    setCurrentItem(null);
    setShowAddForm(true);
  };

  // 编辑内容
  const handleEditContent = (item: any) => {
    setCurrentItem(item);
    setShowEditForm(true);
  };

  // 删除内容
  const handleDeleteContent = (id: any) => {
    if (window.confirm('确定要删除这条内容吗？')) {
      if (activeTab === 'faq') {
        setFaqs(faqs.filter(faq => faq.id !== id));
      } else if (activeTab === 'testimonial') {
        // 调用API删除评价
        setTestimonials(testimonials.filter(testimonial => testimonial.id !== id));
      }
    }
  };

  // 切换显示状态
  const toggleStatus = (id: any) => {
    if (activeTab === 'faq') {
      setFaqs(faqs.map(faq => 
        faq.id === id ? { ...faq, status: faq.status === 'active' ? 'inactive' : 'active' } : faq
      ));
    } else if (activeTab === 'testimonial') {
      // 调用API切换状态
      setTestimonials(testimonials.map(testimonial => 
        testimonial.id === id ? { ...testimonial, status: testimonial.status === 'active' ? 'inactive' : 'active' } : testimonial
      ));
    }
  };

  // 预览内容
  const previewContent = (item: any) => {
    alert(`预览内容：\n${item.question || item.content}`);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">内容管理</h1>
          <p className="text-gray-500 mt-1">管理FAQ、用户评价等网站内容</p>
        </div>
        <button 
          onClick={handleAddContent}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-pink-500/30"
        >
          <Plus className="w-4 h-4" />
          添加内容
        </button>
      </div>

      {/* Tab切换 */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('faq')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'faq'
              ? 'bg-white dark:bg-gray-700 text-pink-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          常见问题
        </button>
        <button
          onClick={() => setActiveTab('testimonial')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'testimonial'
              ? 'bg-white dark:bg-gray-700 text-pink-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-white'
          }`}
        >
          用户评价
        </button>
      </div>

      {/* 加载状态 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      ) : error ? (
        <div className="p-6 text-center text-red-500">
          {error}
        </div>
      ) : (
        <>
          {/* FAQ管理 */}
          {activeTab === 'faq' && (
            <GlassCard className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 bg-gray-50 dark:bg-white/5">
                      <th className="px-6 py-4 font-medium">排序</th>
                      <th className="px-6 py-4 font-medium">问题</th>
                      <th className="px-6 py-4 font-medium">分类</th>
                      <th className="px-6 py-4 font-medium">状态</th>
                      <th className="px-6 py-4 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                    {faqs.map((faq) => (
                      <tr key={faq.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-pink-100 text-pink-600 font-bold text-sm dark:bg-pink-900/30 dark:text-pink-400">
                            {faq.sort}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-800 dark:text-white">{faq.question}</p>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{faq.answer}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400">
                            {faq.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => toggleStatus(faq.id)}
                            className="flex items-center gap-1 text-sm"
                          >
                            {faq.status === 'active' ? (
                              <>
                                <ToggleRight className="w-5 h-5 text-green-500" />
                                <span className="text-green-500">显示</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-400">隐藏</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEditContent(faq)}
                              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteContent(faq.id)}
                              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          {/* 用户评价管理 */}
          {activeTab === 'testimonial' && (
            <GlassCard className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 bg-gray-50 dark:bg-white/5">
                      <th className="px-6 py-4 font-medium">平台</th>
                      <th className="px-6 py-4 font-medium">评价内容</th>
                      <th className="px-6 py-4 font-medium">作者</th>
                      <th className="px-6 py-4 font-medium">状态</th>
                      <th className="px-6 py-4 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                    {testimonials.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                          暂无用户评价数据
                        </td>
                      </tr>
                    ) : (
                      testimonials.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 dark:from-pink-900/30 dark:to-purple-900/30 dark:text-pink-400">
                              {item.platform}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-800 dark:text-white line-clamp-2">{item.content}</p>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{item.author}</td>
                          <td className="px-6 py-4">
                            <button 
                            onClick={() => toggleStatus(item.id)}
                            className="flex items-center gap-1 text-sm"
                          >
                              {item.status === 'active' ? (
                                <>
                                  <ToggleRight className="w-5 h-5 text-green-500" />
                                  <span className="text-green-500">显示</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                                  <span className="text-gray-400">隐藏</span>
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => previewContent(item)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleEditContent(item)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteContent(item.id)}
                                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}
        </>
      )}
    </div>
  );
}
