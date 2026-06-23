import { testimonials } from '@/data/content'
import { Star, Quote } from 'lucide-react'

export default function Testimonials() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            用户真实反馈
          </h2>
          <p className="text-gray-500">来自小红书、知乎、豆瓣、微博等平台用户的真实评价</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-6 border border-gray-100 hover:border-pink-200 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-100/50 group"
            >
              {/* Quote Icon */}
              <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center mb-4 group-hover:bg-pink-500 transition-colors">
                <Quote className="w-5 h-5 text-pink-500 group-hover:text-white transition-colors" />
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-4 leading-relaxed">{item.content}</p>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                  {item.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.platform}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
