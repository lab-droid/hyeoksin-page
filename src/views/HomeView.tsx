import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";
import { useAppContext } from "../AppContext";

export function HomeView() {
  const { setCurrentView } = useAppContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col w-full"
    >
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 flex flex-col items-start z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#0052FF] text-sm font-semibold mb-6">
              <Sparkles className="h-4 w-4" />
              <span>상위 1% 기업을 위한 독점적 디자인</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-[#0A192F] to-[#0052FF] mb-6">
              끌리는 디자인이<br className="hidden md:block"/> 매출을 결정합니다.
            </h1>
            <p className="text-lg md:text-xl text-zinc-600 mb-10 leading-relaxed font-medium max-w-2xl">
              단순히 예쁜 디자인을 넘어서, 고객의 심리를 자극하고 전환율을 폭발적으로 상승시키는 상용 수준의 기업 다중 페이지 홈페이지를 구축하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView('estimate')}
                className="bg-[#0052FF] text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:bg-blue-600 transition-colors"
              >
                무료 견적 조회하기 <ArrowRight className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView('portfolio')}
                className="bg-white text-[#0A192F] border border-zinc-200 px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-zinc-50 transition-colors"
              >
                포트폴리오 보기
              </motion.button>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-[#F8F9FA] rounded-3xl transform rotate-3 scale-105" />
            <img 
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" 
              alt="Dashboard Preview" 
              className="relative rounded-3xl shadow-2xl border border-zinc-200/50 object-cover w-full h-[400px]"
            />
          </div>
        </div>
      </section>

      {/* Before & After Section */}
      <section className="py-24 bg-white px-6">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0A192F] mb-4">
              기획의 차이가 전환율의 차이
            </h2>
            <p className="text-zinc-600 text-lg">혁신페이지 도입 전후의 명확한 성과 차이를 확인하세요.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center bg-[#F8F9FA] p-8 md:p-12 rounded-3xl border border-zinc-100">
            <div className="flex-1 w-full space-y-8">
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-zinc-500">일반 상세페이지</span>
                  <span className="text-zinc-500">전환율 1.2%</span>
                </div>
                <div className="w-full h-8 bg-zinc-200 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: '12%' }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-zinc-400 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-[#0052FF]">혁신페이지 기획 상세페이지</span>
                  <span className="text-[#0052FF]">전환율 4.8%</span>
                </div>
                <div className="w-full h-8 bg-zinc-200 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: '48%' }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-[#0052FF] rounded-full relative overflow-hidden">
                     <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
                </div>
              </div>
            </div>
            <div className="w-px h-32 bg-zinc-200 hidden md:block" />
            <div className="flex-1 text-center md:text-left flex flex-col justify-center">
              <h3 className="text-5xl font-extrabold text-[#0052FF] mb-2 font-mono tabular-nums">300% ⇧</h3>
              <p className="text-xl font-bold text-[#0A192F] mb-4">평균 매출 상승률</p>
              <p className="text-zinc-600 leading-relaxed">
                시각적 화려함만 추구하지 않습니다.<br/>고객 여정을 분석하고 구매 버튼을 누르게 만드는 논리적 흐름을 구축합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Values Grid */}
      <section className="py-24 px-6 bg-[#0A192F] text-white">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              성공을 부르는 3대 핵심 가치
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div whileHover={{ y: -5 }} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
              <div className="w-14 h-14 bg-[#0052FF] rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">심리 분석 기반 기획</h3>
              <p className="text-zinc-400 leading-relaxed">
                타겟 고객의 니즈와 결핍을 정확하게 파고들어 거부할 수 없는 구매 명분을 설계합니다.
              </p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
              <div className="w-14 h-14 bg-[#0052FF] rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">압도적 비주얼 디자인</h3>
              <p className="text-zinc-400 leading-relaxed">
                초고해상도 3D 에셋과 최신 트렌드를 반영한 타이포그래피로 브랜드의 격을 한 단계 높입니다.
              </p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
              <div className="w-14 h-14 bg-[#0052FF] rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">주기적 전환율 피드백</h3>
              <p className="text-zinc-400 leading-relaxed">
                제작하고 끝내지 않습니다. 데이터에 기반한 A/B 테스트와 최적화 리포트를 정기적으로 제공합니다.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-white text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#0A192F] mb-8">
          압도적인 차이를 경험해 보세요.
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentView('estimate')}
          className="bg-[#0052FF] text-white px-10 py-5 rounded-full font-bold text-xl flex items-center justify-center gap-2 mx-auto shadow-xl shadow-blue-500/25 hover:bg-blue-600 transition-colors"
        >
          무료 견적 조회하기 <ArrowRight className="h-6 w-6" />
        </motion.button>
      </section>
    </motion.div>
  );
}
