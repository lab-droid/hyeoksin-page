import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { PORTFOLIO_DATA } from "../data";
import { TrendingUp, X, Sparkles, CheckCircle, ArrowUpRight, BarChart3, Bookmark } from "lucide-react";
import { PortfolioItem } from "../types";

const CATEGORIES = ["전체", "푸드", "뷰티", "테크", "패션"];

// Safe Image Component for Portfolio View
function SafeImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden w-full h-full bg-gradient-to-tr from-[#0F172A] to-[#1E3A8A] ${className || ""}`}>
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
          <div className="w-8 h-8 border-3 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {!error ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onLoad={() => setLoading(false)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-transform duration-700 ${loading ? "opacity-0" : "opacity-100"}`}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-br from-[#02050E] via-[#0B1528] to-[#132A55]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="w-12 h-12 mx-auto bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10">
              <Sparkles className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">정밀 성과 포트폴리오</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">혁신 공식 설계 적용 완료</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PortfolioView() {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [selectedProject, setSelectedProject] = useState<PortfolioItem | null>(null);

  const filteredPortfolio = activeCategory === "전체" 
    ? PORTFOLIO_DATA 
    : PORTFOLIO_DATA.filter(item => item.category === activeCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col w-full px-6 py-12 pb-24 bg-white"
    >
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#0052FF] text-xs font-bold mb-4">
            <Bookmark className="w-3.5 h-3.5 fill-[#0052FF]/10" />
            <span>실제 비즈니스 상승 지표</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#0A192F] mb-6">
            숫자로 증명하는 포트폴리오
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            단순히 보기에만 좋은 디자인은 지양합니다. 혁신페이지가 기획한 각 프로젝트들은 타겟 분석과 심리 설계를 통해 브랜드 성장을 확실하게 앞당겼습니다.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
                activeCategory === cat 
                  ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-zinc-100 text-zinc-600 border border-transparent hover:border-zinc-300 hover:bg-zinc-200/50'
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                onClick={() => setSelectedProject(item)}
                className="group relative overflow-hidden rounded-3xl bg-zinc-50 border border-zinc-200/60 aspect-video md:aspect-[4/3] cursor-pointer shadow-sm hover:shadow-xl hover:border-zinc-300/85 transition-all duration-300"
              >
                <SafeImage 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Visual Glow Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-[#0A192F]/50 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
                
                {/* Content Overlay */}
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end z-10 text-left">
                   <div>
                     <div className="flex items-center gap-3 mb-2.5">
                       <span className="px-3 py-1 bg-[#0052FF] text-white text-[11px] font-black rounded-lg uppercase tracking-wide">
                         {item.category}
                       </span>
                       <span className="text-zinc-300 text-xs font-semibold">{item.client}</span>
                     </div>
                     
                     <h3 className="text-xl md:text-2xl font-black text-white mb-4 tracking-tight drop-shadow-sm group-hover:text-blue-200 transition-colors">
                       {item.title}
                     </h3>
                     
                     <div className="flex items-end gap-6 border-t border-white/10 pt-4 mt-auto">
                       <div>
                         <p className="text-[10px] text-zinc-400 mb-0.5">기존 전환율</p>
                         <p className="text-xs text-zinc-300 font-bold font-mono tracking-tight">{item.beforeRate}</p>
                       </div>
                       <div className="h-6 w-px bg-white/15" />
                       <div>
                         <p className="text-[10px] text-blue-300 mb-0.5">매출 전환율</p>
                         <p className="text-base text-white font-black font-mono tracking-tight">{item.afterRate}</p>
                       </div>
                       <div className="h-6 w-px bg-white/15" />
                       <div className="flex items-center gap-1.5 text-[#0052FF] bg-white px-3 py-1.5 rounded-xl ml-auto shadow-sm transform group-hover:scale-105 transition-transform duration-300">
                         <TrendingUp className="h-3.5 w-3.5" />
                         <span className="font-black text-xs tracking-tight">{item.increase}</span>
                       </div>
                     </div>
                   </div>
                </div>

                {/* Always-on Tag Badges top left */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10">
                   {item.tags.map((tag, idx) => (
                     <span key={idx} className="px-3 py-1 bg-white/95 backdrop-blur-md text-[10px] font-extrabold text-[#0A192F] rounded-lg shadow-sm border border-zinc-100">
                       {tag}
                     </span>
                   ))}
                </div>
                
                {/* Visual Arrow indicator on hover */}
                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Interactive Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-100 relative text-left"
            >
              {/* Image banner inside modal */}
              <div className="h-64 sm:h-80 w-full relative">
                <SafeImage src={selectedProject.imageUrl} alt={selectedProject.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-colors border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Tags over image banner inside modal */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-[#0052FF] text-white text-[10px] font-black rounded uppercase tracking-wider">
                      {selectedProject.category}
                    </span>
                    <span className="text-zinc-300 text-xs font-semibold">{selectedProject.client}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                    {selectedProject.title}
                  </h2>
                </div>
              </div>

              {/* Detailed descriptive contents */}
              <div className="p-6 sm:p-8 space-y-8">
                {/* Stats cards block */}
                <div className="grid grid-cols-3 gap-4 bg-zinc-50 p-5 rounded-2xl border border-zinc-200/60 divide-x divide-zinc-200">
                  <div className="text-center">
                    <p className="text-[10px] text-zinc-500 font-bold mb-1 uppercase">이전 전환율</p>
                    <p className="text-sm font-extrabold text-zinc-600 font-mono">{selectedProject.beforeRate}</p>
                  </div>
                  <div className="text-center px-2">
                    <p className="text-[10px] text-blue-500 font-bold mb-1 uppercase">기획 개선 후</p>
                    <p className="text-base font-black text-blue-600 font-mono">{selectedProject.afterRate}</p>
                  </div>
                  <div className="text-center px-1">
                    <p className="text-[10px] text-green-600 font-bold mb-1 uppercase">폭풍 상승 성과</p>
                    <div className="inline-flex items-center gap-1 text-green-700 font-black text-sm">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{selectedProject.increase.replace(" 상승", "")}</span>
                    </div>
                  </div>
                </div>

                {/* Core Psychological Points */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-[#0A192F] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500 fill-blue-500/15" />
                    <span>핵심 성과 기획 키포인트</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100/50 flex gap-3">
                      <div className="mt-0.5 bg-blue-100 text-[#0052FF] p-1 rounded-lg h-fit">
                        <CheckCircle className="w-4 h-4 fill-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-[#0A192F] mb-1">소비자 결핍 정밀 공략</h4>
                        <p className="text-xs text-zinc-600 leading-relaxed">
                          단순 기능 홍보에서 탈피하여 고객이 가진 가장 실질적인 페인포인트를 헤드카피 및 레이아웃 상단에 선제 배치해 몰입을 유도했습니다.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100/50 flex gap-3">
                      <div className="mt-0.5 bg-blue-100 text-[#0052FF] p-1 rounded-lg h-fit">
                        <CheckCircle className="w-4 h-4 fill-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-[#0A192F] mb-1">입체적 신뢰성 증명 위젯</h4>
                        <p className="text-xs text-zinc-600 leading-relaxed">
                          텍스트 후기를 마냥 보여주는 대신, 전후 비교 및 인증서 데이터를 초고해상 레이아웃 안에 정렬 배치하여 신뢰감을 굳혔습니다.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/50 flex gap-3">
                      <div className="mt-0.5 bg-zinc-200 text-zinc-600 p-1 rounded-lg h-fit">
                        <CheckCircle className="w-4 h-4 fill-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-[#0A192F] mb-1">모바일 0.1초 단독 패스</h4>
                        <p className="text-xs text-zinc-600 leading-relaxed">
                          그 어떤 단말기에서도 초고속 드로잉과 끊김 없는 프레임을 실현하기 위해 소스코드를 압축하고, 인터랙티브 큐레이션을 간결화했습니다.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/50 flex gap-3">
                      <div className="mt-0.5 bg-zinc-200 text-zinc-600 p-1 rounded-lg h-fit">
                        <CheckCircle className="w-4 h-4 fill-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-[#0A192F] mb-1">정밀 A/B 검토 튜닝</h4>
                        <p className="text-xs text-zinc-600 leading-relaxed">
                          런칭 후 2주 동안 최적의 CTA(구매 버튼) 위치를 실시간 분석 툴로 정밀 트래킹하여 전환 퍼포먼스를 극대화했습니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Apply tags and technical details */}
                <div className="pt-4 border-t border-zinc-150 flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex gap-2.5">
                    {selectedProject.tags.map((tag, idx) => (
                      <span key={idx} className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-lg text-xs font-semibold">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="text-[#0052FF] font-extrabold text-sm hover:underline flex items-center gap-1 self-end py-1"
                  >
                    <span>목록 돌아가기</span>
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

