import type { Feature, PricingPlan, FAQ, Testimonial, ProcessStep } from '@/types'

export const features: Feature[] = [
  {
    id: 'rewrite',
    title: '学术写作（改写/降重）',
    description: '支持文本改写、缩写、扩写，适配中英文，含LaTeX公式、表格处理。基础模式免费，高级/强力模式需会员。',
    icon: 'Pencil',
    highlight: '降重效果立竿见影',
    modes: ['基础模式', '高级模式', '强力模式']
  },
  {
    id: 'humanize',
    title: '拟人改写（降AI率）',
    description: '降低文本被识别为AI生成的风险，适配知网、维普、Turnitin等检测系统，支持中英文。',
    icon: 'Bot',
    highlight: '通过所有主流检测'
  },
  {
    id: 'magic',
    title: '超级写作（文献综述）',
    description: '基于真实文献自动生成文献综述，支持引用导出至Zotero/Endnote，平均引用100+篇文献。',
    icon: 'BookOpen',
    highlight: '海量文献支撑'
  },
  {
    id: 'translate',
    title: '超级翻译',
    description: '多语言翻译，强调地道表达，适用于学术文本翻译，保留专业术语和格式。',
    icon: 'Languages',
    highlight: '学术级精准翻译'
  }
]

export const pricingPlans: PricingPlan[] = [
  {
    name: '标准会员',
    price: '¥99/月',
    features: [
      '每日5000字额度',
      '学术改写（基础/高级模式）',
      '降AI率（普通模式）',
      '超级翻译',
      '技术支持'
    ],
    buttonText: '立即开通'
  },
  {
    name: '专业会员',
    price: '¥199/月',
    originalPrice: '¥299',
    features: [
      '每日20000字额度',
      '学术改写（全模式）',
      '降AI率（强力模式）',
      '超级写作（文献综述）',
      '优先客服支持',
      '批量处理'
    ],
    highlight: true,
    buttonText: '开通专业版'
  }
]

export const faqs: FAQ[] = [
  {
    question: '降重效果能保证多少？',
    answer: '根据用户反馈，平均可将重复率降低50%以上。效果取决于原文质量和选择的模式，强力模式效果最佳。'
  },
  {
    question: '标准会员和专业会员有什么区别？',
    answer: '专业会员拥有更高的每日额度，并支持强力降重模式和超级写作功能，适合有大量写作需求的用户。'
  },
  {
    question: '我的内容会被保存吗？',
    answer: '不会。所有内容仅在实时处理时使用，不会上传、不存储，处理完成后立即删除。您的隐私安全有保障。'
  },
  {
    question: '支持哪些语言？',
    answer: '目前支持中英文，并针对学术场景进行了优化。后续将支持更多语言。'
  },
  {
    question: '如何导出引用文献？',
    answer: '超级写作功能支持导出BibTeX、RIS等格式，可直接导入Zotero、Endnote等文献管理工具。'
  }
]

export const testimonials: Testimonial[] = [
  {
    name: '张同学',
    platform: '小红书',
    content: '真的太香了！我的论文重复率从35%降到了8%，而且语句通顺，完全看不出改写的痕迹。推荐给所有写论文的姐妹！',
    rating: 5
  },
  {
    name: '李编辑',
    platform: '知乎',
    content: '用了三个月了，降重效果非常稳定。特别喜欢强力模式，出来的文字质量很高，基本不需要再手动润色。',
    rating: 5
  },
  {
    name: '王研究生',
    platform: '豆瓣',
    content: '研三狗的救命稻草！降AI率功能太强了，之前被导师怀疑是AI写的，用了这个之后顺利过了检测。',
    rating: 5
  },
  {
    name: '陈学者',
    platform: '微博',
    content: '超级写作功能绝了！输入关键词就能生成文献综述，引用都是真实文献，省了我好多查资料的时间。',
    rating: 5
  }
]

export const processSteps: ProcessStep[] = [
  {
    step: 1,
    title: '粘贴文本',
    description: '将需要处理的文本粘贴到输入框，支持中英文、公式和表格'
  },
  {
    step: 2,
    title: '选择模式',
    description: '根据需求选择改写模式、降重强度或翻译语言'
  },
  {
    step: 3,
    title: '一键处理',
    description: '点击开始，系统将在几秒内完成处理，直接获取结果'
  },
  {
    step: 4,
    title: '下载使用',
    description: '处理结果可一键复制或下载，立即用于你的文档'
  }
]
