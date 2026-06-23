import React from 'react';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
  category: string;
}

const testimonial: Testimonial = {
  id: 1,
  name: '学术探索者',
  role: '研究生',
  content: '使用论文助手后，我的论文质量显著提高，老师对我的写作风格给予了高度评价。系统的改写功能非常智能，能够保持原意的同时提升表达质量。',
  rating: 5,
  avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=asian%20male%20student%20portrait%20professional%20headshot&image_size=square',
  category: '学术论文'
};

const Testimonials: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white py-20">
      <div className="container mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
            用户评价
          </h1>
        </div>

        {/* 评价聊天框 */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
            {/* 聊天框头部 */}
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-purple-400"
              />
              <div>
                <h3 className="font-bold text-xl text-white">{testimonial.name}</h3>
                <p className="text-blue-200">{testimonial.role}</p>
              </div>
              <div className="ml-auto">
                <span className="text-sm text-purple-300 bg-purple-900/30 px-3 py-1 rounded-full">
                  {testimonial.category}
                </span>
              </div>
            </div>

            {/* 聊天内容 */}
            <div className="mb-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < testimonial.rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-400'
                      }`}
                  />
                ))}
              </div>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="text-2xl text-purple-300 mb-4">
                  <Quote />
                </div>
                <p className="text-lg text-blue-100 leading-relaxed">
                  {testimonial.content}
                </p>
              </div>
            </div>

            {/* 聊天框底部 */}
            <div className="border-t border-white/10 pt-6">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-white/5 rounded-full px-4 py-3 border border-white/10">
                  <input
                    type="text"
                    placeholder="写下你的评价..."
                    className="w-full bg-transparent outline-none text-white placeholder-blue-300"
                  />
                </div>
                <button className="bg-purple-600 hover:bg-purple-500 rounded-full w-10 h-10 flex items-center justify-center transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;