import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { PORTFOLIO_DATA } from "../data";
import { TrendingUp } from "lucide-react";

const CATEGORIES = ["전체", "푸드", "뷰티", "테크", "패션"];

export function PortfolioView() {
  const [activeCategory, setActiveCategory] = useState("전체");

  const filteredPortfolio = activeCategory === "전체" 
    ? PORTFOLIO_DATA 
    : PORTFOLIO_DATA.filter(item => item.category === activeCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col w-full px-6 py-12 pb-24"
    >
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#0A192F] mb-6">
            숫자로 증명하는 포트폴리오
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            디자인의 진정한 가치는 비즈니스 성과로 나타납니다. 혁신페이지가 이룩한 전환율 극대화 사례를 확인하세요.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                activeCategory === cat 
                  ? 'bg-[#0A192F] text-white shadow-lg shadow-black/10' 
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <AnimatePresence>
            {filteredPortfolio.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.025, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="group relative overflow-hidden rounded-3xl bg-zinc-100 border border-zinc-200 aspect-video md:aspect-[4/3] cursor-pointer"
              >
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Overlay Component */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/90 via-[#0A192F]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-8 flex flex-col justify-end">
                   <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                     <div className="flex items-center gap-3 mb-3">
                       <span className="px-3 py-1 bg-[#0052FF] text-white text-xs font-bold rounded-full">
                         {item.category}
                       </span>
                       <span className="text-zinc-300 text-sm font-medium">{item.client}</span>
                     </div>
                     <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                       {item.title}
                     </h3>
                     
                     <div className="flex items-end gap-6 border-t border-white/20 pt-4 mt-auto">
                       <div>
                         <p className="text-xs text-zinc-400 mb-1">기존 전환율</p>
                         <p className="text-sm text-zinc-300 font-medium">{item.beforeRate}</p>
                       </div>
                       <div className="h-8 w-px bg-white/20" />
                       <div>
                         <p className="text-xs text-blue-300 mb-1">달성 전환율</p>
                         <p className="text-lg text-white font-bold">{item.afterRate}</p>
                       </div>
                       <div className="h-8 w-px bg-white/20" />
                       <div className="flex items-center gap-2 text-[#0052FF] bg-white px-3 py-1.5 rounded-xl ml-auto">
                         <TrendingUp className="h-4 w-4" />
                         <span className="font-extrabold text-sm">{item.increase}</span>
                       </div>
                     </div>
                   </div>
                </div>

                {/* Always-on badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                   {item.tags.map((tag, idx) => (
                     <span key={idx} className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-xs font-semibold text-[#0A192F] rounded-full shadow-sm">
                       {tag}
                     </span>
                   ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
