import { motion } from "motion/react";
import { useState } from "react";
import { ArrowRight, CheckCircle2, TrendingUp, Sparkles, Shield, Compass, ChevronRight, Award, Zap } from "lucide-react";
import { useAppContext } from "../AppContext";

// Safe Image Component that catches load failures and displays a luxury stylized geometric dashboard fallback
function SafeImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1528] to-[#122D5A] shadow-2xl border border-zinc-200/25 ${className || ""}`}>
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
          <div className="w-10 h-10 border-4 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {!error ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onLoad={() => setLoading(false)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-700 ${loading ? "opacity-0" : "opacity-100"}`}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white bg-gradient-to-tr from-[#020617] via-[#0A192F] to-[#1B365D]">
          {/* Radiant auroral circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#0052FF]/25 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-6 w-full max-w-sm">
            <div className="w-16 h-16 mx-auto bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl">
              <Sparkles className="h-8 w-8 text-blue-400 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-2xl font-black tracking-tight text-white">혁신페이지 프리미엄 플랜</h4>
              <p className="text-sm text-zinc-300">귀사의 비즈니스에 맞춤 최적화된 고전환율 스키마 탑재</p>
            </div>
            
            {/* Elegant telemetry mockup replacing standard broken images */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md text-left space-y-3 shadow-inner">
              <div className="flex justify-between items-center text-xs text-zinc-300 font-mono">
                <span className="flex items-center gap-1.5 font-semibold text-zinc-200">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  DESIGN CONVERSION ENGINE
                </span>
                <span className="text-green-400 font-extrabold">+300% Boost</span>
              </div>
              <div className="w-full bg-zinc-800/80 h-2 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "88%" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="bg-gradient-to-r from-blue-500 to-[#0052FF] h-full rounded-full"
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono pt-1">
                <span>UI/UX Optimization</span>
                <span>88% Conversion Potential</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function HomeView() {
  const { setCurrentView } = useAppContext();
  
  // States for Interactive Conversion Calculator
  const [traffic, setTraffic] = useState(10000);
  const [currentConv, setCurrentConv] = useState(1.2);
  const [targetConv, setTargetConv] = useState(4.8);
  const [avgPrice, setAvgPrice] = useState(50000);

  // ROI calculations
  const currentSales = Math.round(traffic * (currentConv / 100) * avgPrice);
  const targetSales = Math.round(traffic * (targetConv / 100) * avgPrice);
  const addedRevenue = targetSales - currentSales;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col w-full overflow-hidden"
    >
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden bg-gradient-to-b from-blue-50/40 via-white to-white">
        {/* Abstract glowing visual background spheres */}
        <div className="absolute top-1/4 -right-24 w-[500px] h-[500px] bg-gradient-to-tr from-blue-200/30 to-indigo-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-32 top-10 w-[350px] h-[350px] bg-gradient-to-br from-blue-100/20 to-[#0052FF]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative">
          <div className="flex-1 flex flex-col items-start z-10 text-left">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#0052FF] text-sm font-semibold mb-6"
            >
              <Sparkles className="h-4 w-4 animate-pulse text-blue-600" />
              <span>독보적 성과 중심 ｜ 하이엔드 웹 에이전시</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.12] text-[#0A192F] mb-6">
              끌리는 디자인이<br className="hidden md:block"/> <span className="text-[#0052FF] relative inline-block">매출<span className="absolute -bottom-2 left-0 w-full h-[6px] bg-blue-200 -z-10 rounded-full" /></span>을 결정합니다.
            </h1>
            
            <p className="text-zinc-600 text-lg md:text-xl mb-10 leading-relaxed font-normal max-w-2xl">
              단순히 예쁜 레이아웃을 넘어섭니다. 철저한 심리 분석 기반 문맥과 압도적인 비주얼을 설계하여 전환율을 폭발적으로 상승시키는 상용 파이프라인을 구축하세요.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView('estimate')}
                className="bg-[#0052FF] text-white px-8 py-4.5 rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 hover:bg-blue-600 transition-all duration-300"
              >
                무료 견적 조회하기 <ArrowRight className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, bg: "#f4f6fa" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView('portfolio')}
                className="bg-white text-[#0A192F] border border-zinc-200/80 px-8 py-4.5 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-zinc-50 transition-all duration-300 shadow-sm"
              >
                포트폴리오 보기
              </motion.button>
            </div>

            {/* Micro stats banner for credibility */}
            <div className="flex items-center gap-6 mt-12 border-t border-zinc-200/70 pt-8 w-full max-w-lg">
              <div>
                <p className="text-3xl font-black text-[#0A192F]">300%</p>
                <p className="text-xs text-zinc-500 font-medium">평균 전환율 향상</p>
              </div>
              <div className="w-px h-8 bg-zinc-200" />
              <div>
                <p className="text-3xl font-black text-[#0A192F]">24시간</p>
                <p className="text-xs text-zinc-500 font-medium">실시간 견적 산출</p>
              </div>
              <div className="w-px h-8 bg-zinc-200" />
              <div>
                <p className="text-3xl font-black text-[#0A192F]">100%</p>
                <p className="text-xs text-zinc-500 font-medium">자유로운 사후 관리</p>
              </div>
            </div>
          </div>
          
          {/* Main Visual Side (Image or premium fallback) */}
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-300/30 to-indigo-200/20 rounded-3xl transform rotate-3 scale-102 blur-lg pointer-events-none" />
            
            <SafeImage 
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" 
              alt="Dashboard Preview" 
              className="relative rounded-3xl border border-zinc-200/40 object-cover w-full h-[450px] z-10"
            />
            
            {/* Interactive Float Ribbon 1 */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 bg-white p-4.5 rounded-2xl shadow-2xl border border-zinc-100 z-20 flex items-center gap-3.5 hidden sm:flex"
            >
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">실시간 성과 반영</p>
                <p className="text-sm font-extrabold text-zinc-900">전환율 평균 4배 상승</p>
              </div>
            </motion.div>

            {/* Interactive Float Ribbon 2 */}
            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 bg-[#0052FF] text-white p-4 rounded-2xl shadow-2xl z-20 flex items-center gap-3 hidden sm:flex"
            >
              <Award className="h-5 w-5 text-blue-200" />
              <span className="font-extrabold text-xs tracking-tight">KOREA DESIGN AWARD 1위</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Before & After Section */}
      <section className="py-24 bg-white px-6 border-t border-zinc-100 relative">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0A192F] mb-4">
              기획의 차이가 전환율의 차이
            </h2>
            <p className="text-zinc-600 text-lg max-w-2xl mx-auto">
              정밀 기획 없이 껍데기만 화려한 상세페이지는 비용 낭비입니다. 혁신페이지 디자인이 이룩한 초격차 성능을 눈으로 직접 설계해 보세요.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-gradient-to-br from-[#F8F9FA] to-[#EDF2F7] p-8 md:p-12 rounded-3xl border border-zinc-200/50">
            {/* Progress Bars */}
            <div className="lg:col-span-7 w-full space-y-8">
              <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
                <div className="flex justify-between items-center text-sm font-semibold mb-3">
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-zinc-400" /> 일반 상세페이지
                  </span>
                  <span className="text-zinc-500 font-mono tracking-tight text-right">전환율 <b className="text-zinc-700">1.2%</b></span>
                </div>
                <div className="w-full h-8 bg-zinc-100 rounded-lg overflow-hidden relative">
                  <motion.div 
                    initial={{ width: 0 }} 
                    whileInView={{ width: '12%' }} 
                    viewport={{ once: true }} 
                    transition={{ duration: 1.2, delay: 0.1 }} 
                    className="h-full bg-zinc-300 rounded-lg" 
                  />
                  <span className="absolute inset-y-0 left-3 flex items-center text-zinc-600 text-xs font-bold font-mono">기존 성과</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-md relative overflow-hidden ring-2 ring-blue-500/10">
                <div className="absolute top-0 right-0 bg-[#0052FF] text-white px-3 py-1 rounded-bl-xl text-[10px] font-black tracking-wider uppercase">
                  Best Value
                </div>
                <div className="flex justify-between items-center text-sm font-semibold mb-3">
                  <span className="text-[#0052FF] flex items-center gap-1.5 font-bold">
                    <Zap className="w-4 h-4 text-[#0052FF] fill-[#0052FF]/20 animate-bounce" /> 혁신페이지 기획 레이아웃
                  </span>
                  <span className="text-[#0052FF] font-black tracking-tight text-right">전환율 <b className="text-lg">4.8%</b></span>
                </div>
                <div className="w-full h-10 bg-zinc-100 rounded-lg overflow-hidden relative">
                  <motion.div 
                    initial={{ width: 0 }} 
                    whileInView={{ width: '48%' }} 
                    viewport={{ once: true }} 
                    transition={{ duration: 1.2, delay: 0.3 }} 
                    className="h-full bg-gradient-to-r from-blue-500 to-[#0052FF] rounded-lg relative overflow-hidden"
                  >
                     <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
                  <span className="absolute inset-y-0 left-3 flex items-center text-white text-xs font-black font-mono">성공 공식 스키마 적용 </span>
                </div>
              </div>
            </div>

            {/* Vertical separating rail */}
            <div className="hidden lg:block lg:col-span-1 h-32 w-px bg-zinc-300 mx-auto" />

            {/* Large stats block */}
            <div className="lg:col-span-4 text-center lg:text-left flex flex-col justify-center py-4">
              <h3 className="text-6xl font-black text-[#0052FF] mb-2 font-mono tabular-nums tracking-tighter">300% ⇧</h3>
              <p className="text-xl font-extrabold text-[#0A192F] mb-3">평균 전환 매출 상승지수</p>
              <p className="text-zinc-600 leading-relaxed text-sm md:text-base">
                정밀 시각화와 설득력 높은 심리적 장치 배치를 결합하여 단지 몇 주 만에 상향 곡선을 즉각적으로 창출합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Conversion ROI Calculator (Added visual element for highly impressive UX) */}
      <section className="py-24 bg-zinc-50 px-6 border-y border-zinc-100">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-200/50 rounded-full text-zinc-600 text-xs font-bold mb-4">
              <Compass className="w-3.5 h-3.5" />
              <span>실시간 전환율 성과 시뮬레이터</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0A192F] mb-4">
              혁신페이지 도입 시 늘어날 매출을 계산해 보세요
            </h2>
            <p className="text-zinc-600 text-base max-w-2xl mx-auto">
              현재의 평균 방문자수와 상품 가격을 조절하시면, 일반 페이지 대비 혁신페이지 도입 후 추가로 증가할 예상 월 매출액(ROI)이 산출됩니다.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Input sliders */}
            <div className="lg:col-span-6 bg-white p-8 rounded-3xl border border-zinc-200/80 shadow-sm flex flex-col justify-between gap-6">
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <label className="text-sm font-extrabold text-zinc-700">월 방문자수 (Traffic)</label>
                  <span className="text-sm font-bold text-[#0052FF]">{traffic.toLocaleString()} 명</span>
                </div>
                <input 
                  type="range" 
                  min="1000" 
                  max="100000" 
                  step="1000"
                  value={traffic} 
                  onChange={(e) => setTraffic(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-[#0052FF]"
                />
                <div className="flex justify-between text-[11px] text-zinc-400 mt-1 font-mono">
                  <span>1,000 명</span>
                  <span>100,000 명</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <label className="text-sm font-extrabold text-zinc-700">기존 전환율 (Before Conv.)</label>
                  <span className="text-sm font-bold text-zinc-500">{currentConv} %</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="3.0" 
                  step="0.1"
                  value={currentConv} 
                  onChange={(e) => setCurrentConv(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-500"
                />
                <div className="flex justify-between text-[11px] text-zinc-400 mt-1 font-mono">
                  <span>0.1%</span>
                  <span>3.0%</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <label className="text-sm font-extrabold text-[#0052FF]">목표 전환율 (After Conv.)</label>
                  <span className="text-sm font-bold text-[#0052FF]">{targetConv} %</span>
                </div>
                <input 
                  type="range" 
                  min="3.0" 
                  max="10.0" 
                  step="0.2"
                  value={targetConv} 
                  onChange={(e) => setTargetConv(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-[#0052FF]"
                />
                <div className="flex justify-between text-[11px] text-zinc-400 mt-1 font-mono">
                  <span>3.0%</span>
                  <span>10.0%</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <label className="text-sm font-extrabold text-zinc-700">상품 평균 단가 (Price)</label>
                  <span className="text-sm font-bold text-zinc-800">₩{avgPrice.toLocaleString()}원</span>
                </div>
                <input 
                  type="range" 
                  min="10000" 
                  max="500000" 
                  step="5000"
                  value={avgPrice} 
                  onChange={(e) => setAvgPrice(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-800"
                />
                <div className="flex justify-between text-[11px] text-zinc-400 mt-1 font-mono">
                  <span>1만원</span>
                  <span>50만원</span>
                </div>
              </div>
            </div>

            {/* Simulated ROI Results display with super luxury gradient */}
            <div className="lg:col-span-6 bg-gradient-to-tr from-[#0A192F] via-[#0E2954] to-[#143F8A] p-8 md:p-10 rounded-3xl text-white flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start border-b border-white/10 pb-5 mb-6">
                  <div>
                    <h3 className="text-xl font-bold">월 누적 매출 증가 분석</h3>
                    <p className="text-xs text-blue-200 mt-1">혁신페이지 도입 후 추가 수입 전망</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-semibold flex items-center gap-1.5 text-blue-200">
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    <span>추산 성과</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">일반 페이지 매출 :</span>
                    <span className="font-mono text-zinc-200">₩{currentSales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-300">혁신기획 페이지 매출 :</span>
                    <span className="font-mono text-zinc-100">₩{targetSales.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-12 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
                <p className="text-xs text-blue-200 font-bold uppercase tracking-wider mb-1">매월 추가적으로 확보 가능한 순 증가 매출액</p>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-black text-[#5BA4FF] font-mono tracking-tight leading-none">
                    + ₩{addedRevenue.toLocaleString()}
                  </span>
                  <span className="text-lg font-bold text-white">원</span>
                </div>
              </div>

              <div className="relative z-10 mt-6 flex justify-between items-center text-xs text-zinc-400">
                <span>* 본 데이터는 수집된 통계를 기반으로 한 예상값입니다.</span>
                <button 
                  onClick={() => setCurrentView('estimate')}
                  className="text-white hover:text-blue-300 transition-colors font-bold flex items-center gap-1 group py-1"
                >
                  상세 컨설팅 받기 <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Values Grid with glowing borders */}
      <section className="py-24 px-6 bg-[#0A192F] text-white relative">
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full text-blue-300 text-xs font-bold mb-4">
              <Award className="w-3.5 h-3.5" />
              <span>핵심 기둥</span>
            </div>
             <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              성공을 부르는 3대 핵심 가치
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              트렌디한 비주얼을 넘어서, 매출 지표로 입증하는 에이전시의 노하우입니다.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -8, bg: "rgba(255, 255, 255, 0.08)" }} 
              className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md transition-all duration-300"
            >
              <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-[#0052FF] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">심리 분석 기반 기획</h3>
              <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                단순 텍스트 나열을 배제합니다. 타겟 소비군의 결핍과 불편을 고도로 파고들어 정밀하게 설계된 거부할 수 없는 해결책을 연출합니다.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -8, bg: "rgba(255, 255, 255, 0.08)" }} 
              className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md transition-all duration-300"
            >
              <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-[#0052FF] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">압도적 비주얼 디자인</h3>
              <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                그 어떤 경쟁사보다도 완벽하고 디테일한 고해상도 그래픽, 인터랙티브 큐레이션, 엄격히 매칭된 타이포그래피로 브랜드 신뢰도를 최고조로 높입니다.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -8, bg: "rgba(255, 255, 255, 0.08)" }} 
              className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md transition-all duration-300"
            >
              <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-[#0052FF] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">주기적 전환율 피드백</h3>
              <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                홈페이지가 완성된 후 방치하지 않습니다. 고객 유입 데이터를 깊이 있게 분석하고, 마케팅 효율을 한단계 더 격발하는 튜닝을 이어갑니다.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 px-6 bg-white text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#0A192F]">
            최고의 비즈니스 도구를 손에 쥐어 보세요.
          </h2>
          <p className="text-zinc-500 text-lg leading-relaxed max-w-2xl mx-auto">
            단 3분의 소요 시간만으로 예상 견적과 구성 제안을 신속히 발송해 드립니다. 지금 바로 귀사의 가치를 혁신하세요.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView('estimate')}
            className="bg-[#0052FF] text-white px-10 py-5 rounded-full font-bold text-xl flex items-center justify-center gap-2.5 mx-auto shadow-2xl shadow-blue-500/30 hover:bg-blue-600 transition-all duration-300"
          >
            무료 견적 조회하기 <ArrowRight className="h-6 w-6" />
          </motion.button>
        </div>
      </section>
    </motion.div>
  );
}

