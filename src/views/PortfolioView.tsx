import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { PORTFOLIO_DATA } from "../data";
import { 
  TrendingUp, X, Sparkles, CheckCircle, ArrowUpRight, BarChart3, 
  Bookmark, RefreshCw, CreditCard, ArrowRight, Lock, 
  CheckCircle2, ShoppingCart, Percent, Award, ChevronRight, Check
} from "lucide-react";
import { PortfolioItem } from "../types";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAppContext } from "../AppContext";

const CATEGORIES = ["전체", "푸드", "뷰티", "테크", "패션"];

// Safe Image Component for Portfolio View
function SafeImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden w-full h-full bg-gradient-to-tr from-[#0F172A] to-[#1E3A8A] ${className || ""}`}>
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/40">
          <RefreshCw className="w-8 h-8 text-[#0052FF] animate-spin" />
        </div>
      )}
      {!error ? (
        <img
          src={src || "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=600&q=80"}
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
  const { authSession, setCurrentView } = useAppContext();
  const [activeCategory, setActiveCategory] = useState("전체");
  const [selectedProject, setSelectedProject] = useState<PortfolioItem | null>(null);
  
  // Real-time Firestore portfolios streaming state
  const [dbPortfolios, setDbPortfolios] = useState<PortfolioItem[]>([]);
  const [portfoliosLoading, setPortfoliosLoading] = useState(true);

  // local toast and modal states
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | null }>({ message: "", type: null });
  const [successReceipt, setSuccessReceipt] = useState<{
    paymentKey: string;
    orderId: string;
    amount: number;
    packageName: string;
  } | null>(null);
  const [paymentError, setPaymentError] = useState<{
    code: string;
    message: string;
  } | null>(null);

  // 1. Fetch live portfolios from Firestore
  useEffect(() => {
    const q = query(collection(db, "portfolios"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: PortfolioItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          title: data.title || "",
          category: data.category || "테크",
          client: data.client || "",
          beforeRate: data.beforeRate || "",
          afterRate: data.afterRate || "",
          increase: data.increase || "",
          imageUrl: data.imageUrl || "",
          tags: Array.isArray(data.tags) ? data.tags : [],
          summary: data.summary || "",
          description: data.description || "",
          price: Number(data.price ?? 350000),
          originalPrice: Number(data.originalPrice ?? 590000),
          benefit1: data.benefit1 || "",
          benefit2: data.benefit2 || "",
          benefit3: data.benefit3 || "",
          createdAt: (data.createdAt && typeof data.createdAt.toDate === 'function') 
                       ? data.createdAt.toDate().toISOString() 
                       : (data.createdAt || "")
        });
      });
      items.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setDbPortfolios(items);
      setPortfoliosLoading(false);
    }, (error) => {
      console.error("Firestore loading on portfolios failed", error);
      setPortfoliosLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Scan URLs for payment result success/fail
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("paymentStatus");

    if (paymentStatus === "success") {
      const paymentKey = params.get("paymentKey") || "";
      const orderId = params.get("orderId") || "";
      const amount = Number(params.get("amount") || "0");
      const packageName = params.get("packageName") || "프리미엄 상세페이지 템플릿 설계도";

      setSuccessReceipt({
        paymentKey,
        orderId,
        amount,
        packageName,
      });

      // sweep query search params from adress bar
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } else if (paymentStatus === "fail") {
      const code = params.get("code") || "PAYMENT_CANCEL";
      const message = params.get("message") || "카드 인증 일시 지연 또는 결제 창이 종료되었습니다.";
      
      setPaymentError({ code, message });
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  // 3. Close toast automatically
  useEffect(() => {
    if (toast.type) {
      const timer = setTimeout(() => {
        setToast({ message: "", type: null });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Combine both database dynamic portfolios and default static assets smoothly (dedup by title)
  const combinedPortfolios = [
    ...dbPortfolios,
    ...PORTFOLIO_DATA.filter((staticItem) => !dbPortfolios.some((dbItem) => dbItem.title === staticItem.title))
  ];

  const filteredPortfolio = activeCategory === "전체" 
    ? combinedPortfolios 
    : combinedPortfolios.filter(item => item.category === activeCategory);

  // Toss Payments Blueprint 소장하기 Checkout API Trigger
  const handlePurchasePortfolio = async (port: PortfolioItem) => {
    try {
      setToast({ message: "토스페이먼츠 보안 간편결제 시스템을 실행하는 중입니다...", type: "success" });

      const TossPayments = await new Promise<any>((resolve, reject) => {
        if ((window as any).TossPayments) {
          resolve((window as any).TossPayments);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://js.tosspayments.com/v1";
        script.async = true;
        script.onload = () => {
          if ((window as any).TossPayments) {
            resolve((window as any).TossPayments);
          } else {
            reject(new Error("window.TossPayments missing"));
          }
        };
        script.onerror = () => reject(new Error("Fail to load Toss Script context"));
        document.body.appendChild(script);
      });

      // Sanitize key checks
      let clientKey = (import.meta as any).env?.VITE_TOSS_CLIENT_KEY || "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
      if (typeof clientKey === "string") {
        clientKey = clientKey.replace(/['"]/g, "").trim();
      }
      
      if (clientKey === "test_ck_OAL466Yjdoy14Ev7E7vM8qYqK6HJ") {
        clientKey = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
      }

      const toss = TossPayments(clientKey);

      const generatedOrderId = "next_buy_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
      const origin = window.location.origin + window.location.pathname;
      const successUrl = `${origin}?paymentStatus=success&packageName=${encodeURIComponent(port.title)}`;
      const failUrl = `${origin}?paymentStatus=fail`;

      await toss.requestPayment("카드", {
        amount: port.price || 350000,
        orderId: generatedOrderId,
        orderName: `[상세도 소장] ${port.title}`,
        customerName: authSession.user?.name || "고객",
        successUrl,
        failUrl,
      });
    } catch (err: any) {
      console.error("Toss Payment client error:", err);
      setToast({ message: "인증 보안 결제창 연동 실패: " + (err.message || "다시 시도"), type: "error" });
    }
  };

  // Prefill estimate layout from selected portfolio visual
  const handleTransitionToEstimate = (port: PortfolioItem) => {
    localStorage.setItem(
      "nextin_estimate_prefill",
      `저희 브랜드는 포트폴리오에 게시된 '${port.client} - ${port.title}' 기획 레이아웃 스타일을 기반으로 한 고전환율 맞춤형 상세페이지 신규 설계를 희망하여 제작 제안 및 상담을 요청드립니다.`
    );
    setSelectedProject(null);
    setCurrentView("estimate");
    setTimeout(() => {
      window.scrollTo({ top: 300, behavior: "smooth" });
    }, 150);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col w-full px-6 py-12 pb-24 bg-white"
    >
      <div className="w-full max-w-7xl mx-auto">
        
        {/* Floating Interactive Toast Alerts */}
        <AnimatePresence>
          {toast.type && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
            >
              <div className={`px-6 py-3.5 rounded-2xl shadow-2xl font-bold text-xs tracking-tight flex items-center gap-2 border ${
                toast.type === "success" 
                  ? "bg-[#0A192F] text-white border-blue-500/30" 
                  : "bg-red-50 text-red-650 border-red-100"
              }`}>
                {toast.type === "success" ? (
                  <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
                <span>{toast.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#0052FF] text-xs font-bold mb-4">
            <Bookmark className="w-3.5 h-3.5 fill-[#0052FF]/10" />
            <span>실제 비즈니스 승인 지표 연동</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#0A192F] mb-6">
            숫자로 증명하는 포트폴리오
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            단순히 보기에만 화려한 피상적 디자인은 배제합니다. 마케팅 타겟 분석과 행동심리학 설계를 통해 도합 300% 이상의 전환율 급상승 성과를 입증했습니다.
          </p>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
                activeCategory === cat 
                  ? 'bg-[#0052FF] text-white shadow-xl shadow-blue-500/20' 
                  : 'bg-zinc-100 text-zinc-600 border border-transparent hover:border-zinc-300 hover:bg-zinc-200/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Portfolio Dynamic Grid List */}
        {portfoliosLoading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-zinc-50 border border-zinc-200/70 rounded-3xl gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#0052FF]" />
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">초고해상도 실시간 포트폴리오 자원 렌더링 중...</p>
          </div>
        ) : filteredPortfolio.length === 0 ? (
          <div className="text-center py-16 text-zinc-400 text-sm border border-zinc-100 rounded-3xl">
            이 카테고리 기획안은 게재 대기 단계에 있습니다. 다른 탭을 먼저 확인해 주세요.
          </div>
        ) : (
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
                  className="group relative overflow-hidden rounded-3xl bg-zinc-100 border border-zinc-200/60 aspect-video md:aspect-[4/3] cursor-pointer shadow-sm hover:shadow-2xl hover:border-[#0052FF]/30 transition-all duration-300 text-left"
                >
                  <SafeImage 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Visual Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-[#0A192F]/40 to-transparent opacity-75 group-hover:opacity-90 transition-opacity duration-300" />
                  
                  {/* Content Overlay */}
                  <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end z-10">
                     <div className="space-y-3">
                       <div className="flex items-center gap-2.5">
                         <span className="px-3 py-1 bg-[#0052FF] text-white text-[10px] font-black rounded-lg uppercase tracking-wide">
                           {item.category}
                         </span>
                         <span className="text-zinc-300 text-xs font-semibold">{item.client}</span>
                       </div>
                       
                       <h3 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight drop-shadow-sm group-hover:text-blue-300 transition-colors">
                         {item.title}
                       </h3>
                       
                       <p className="text-zinc-300 text-xs line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 text-left">
                         {item.summary || "본 프로젝트 상세 내용 보기"}
                       </p>

                       <div className="flex items-end gap-6 border-t border-white/10 pt-4 mt-auto">
                         <div>
                           <p className="text-[10px] text-zinc-400 mb-0.5">기존 전환율</p>
                           <p className="text-xs text-zinc-300 font-bold font-mono tracking-tight">{item.beforeRate || "1.0%"}</p>
                         </div>
                         <div className="h-6 w-px bg-white/15" />
                         <div>
                           <p className="text-[10px] text-blue-300 mb-0.5">매출 전환율</p>
                           <p className="text-base text-white font-black font-mono tracking-tight">{item.afterRate || "4.2%"}</p>
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
                     {item.tags.slice(0, 3).map((tag, idx) => (
                       <span key={idx} className="px-2.5 py-1 bg-[#122A50]/90 backdrop-blur-md text-[10px] font-extrabold text-white rounded-lg shadow-sm border border-white/10">
                         #{tag}
                       </span>
                     ))}
                  </div>

                  {/* Visual Premium Card purchase trigger top right on hover */}
                  <div className="absolute top-4 right-4 bg-white text-[#0052FF] font-black py-1.5 px-3 rounded-xl border border-white/25 text-[10px] uppercase shadow-md flex items-center gap-1 opacity-90 transition-all duration-300">
                    <ShoppingCart className="w-3 h-3 text-[#0052FF]" />
                    <span>소장 가능</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Interactive Project Detail Magazine-Style Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl border border-zinc-150 relative text-left my-8"
            >
              {/* Image banner inside modal */}
              <div className="h-64 sm:h-80 w-full relative">
                <SafeImage src={selectedProject.imageUrl} alt={selectedProject.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/90 text-white p-2.5 rounded-full backdrop-blur-md transition-colors border border-white/20"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Tags over image banner inside modal */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-[#0052FF] text-white text-[10px] font-black rounded uppercase tracking-wider">
                      {selectedProject.category}
                    </span>
                    <span className="text-zinc-300 text-xs font-bold">{selectedProject.client}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                    {selectedProject.title}
                  </h2>
                </div>
              </div>

              {/* Detailed descriptive contents */}
              <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-thin">
                
                {/* Conversion Boost Metrics Shield Banner */}
                <div className="bg-gradient-to-br from-[#0A192F] to-[#122E58] p-5 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 justify-items-stretch">
                  <div className="space-y-1">
                    <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                      <Percent className="w-3 h-3 text-blue-400" />
                      실시간 트랙된 고소득 마케팅 최적화 지표
                    </span>
                    <p className="text-sm font-semibold text-zinc-300">설계 튜닝에 따른 전환 성과 변화율</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start gap-8 bg-black/25 px-5 py-2.5 rounded-xl border border-white/5 flex-grow sm:flex-grow-0">
                    <div className="text-center">
                      <p className="text-[9px] text-zinc-400 uppercase font-bold">기존</p>
                      <p className="text-sm font-bold font-mono text-zinc-300 line-through">{selectedProject.beforeRate || "1.0%"}</p>
                    </div>
                    <div className="text-blue-500/50 font-bold">→</div>
                    <div className="text-center">
                      <p className="text-[9px] text-blue-400 uppercase font-black">개선안</p>
                      <p className="text-lg font-black font-mono text-blue-400">{selectedProject.afterRate || "4.5%"}</p>
                    </div>
                    <div className="text-emerald-400 font-bold">→</div>
                    <div className="text-center bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      <p className="text-[9px] text-emerald-400 font-black">대폭향상</p>
                      <p className="text-xs font-black text-emerald-400">{selectedProject.increase}</p>
                    </div>
                  </div>
                </div>

                {/* Story Editorial narrative */}
                <div className="space-y-3">
                  <h3 className="text-lg font-extrabold text-[#0A192F] flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-500" />
                    <span>기획자의 비주얼 스토리텔링 설계안</span>
                  </h3>
                  <div className="text-sm text-zinc-650 leading-relaxed space-y-4 font-normal bg-zinc-50 border border-zinc-150 p-6 rounded-2xl whitespace-pre-line text-left">
                    {selectedProject.description || `본 프로젝트는 ${selectedProject.client} 브랜드의 매력적인 세부 상품을 타겟 유저 눈높이에 최적화 설계한 우수작입니다. 고객 행동 트렌드 분석 기획을 적용하여 거부감 없이 몰입과 구매 의사를 유인했습니다.\n\nFigma 상세 가이드와 검증된 스토리 구조를 바탕으로 자사 비즈니스 페이지 설계 시 폭풍 연동 효과를 직관적으로 체험하실 수 있습니다.`}
                  </div>
                </div>

                {/* Perks Checklist (What You Get in Blueprint) */}
                <div className="space-y-3">
                  <h3 className="text-base font-extrabold text-[#0A192F]">포함된 기획 설계 패키지 구성품 (즉시 획득 혜택)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    <div className="p-4 rounded-2xl border border-zinc-200/80 bg-white shadow-xs text-left relative flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <Check className="w-4 h-4 text-[#0052FF]" />
                        <h4 className="text-xs font-black text-[#0A192F]">설득 원본 피그마 파일</h4>
                        <p className="text-[10px] text-zinc-500 leading-relaxed">
                          {selectedProject.benefit1 || "전체 설득 논리 레이아웃 원본 Figma 파일 100% 양도 제공"}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-zinc-200/80 bg-white shadow-xs text-left relative flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <Check className="w-4 h-4 text-[#0052FF]" />
                        <h4 className="text-xs font-black text-[#0A192F]">카피라이팅 비결 가이드</h4>
                        <p className="text-[10px] text-zinc-500 leading-relaxed">
                          {selectedProject.benefit2 || "동업계 기준 최적화 기획 설계 카피 라이팅 치트 가이드 동봉"}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-zinc-200/80 bg-white shadow-xs text-left relative flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <Check className="w-4 h-4 text-[#0052FF]" />
                        <h4 className="text-xs font-black text-[#0A192F]">프리 라이선스 리소스</h4>
                        <p className="text-[10px] text-zinc-500 leading-relaxed">
                          {selectedProject.benefit3 || "상업적 이용이 비제한 보장된 고화질 이미지 무료 팩 라이선스"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Immediate Sales triggering box */}
                <div className="bg-[#0A192F] p-6 rounded-3xl text-white border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1 text-center md:text-left">
                    <span className="text-[10px] bg-red-500 text-white font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                      기간 한정 기획전 할인가
                    </span>
                    <div className="flex items-baseline justify-center md:justify-start gap-2.5 mt-1.5">
                      <span className="text-2xl font-black text-white">{(selectedProject.price || 350000).toLocaleString()}원</span>
                      {selectedProject.originalPrice && (
                        <span className="text-xs text-zinc-400 line-through">{(selectedProject.originalPrice).toLocaleString()}원</span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      구매 시 실시간 이메일 연동으로 Figma 설계도 원본 다운로드 및 라이선스 코드가 즉각 자동 릴리즈됩니다.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    <button
                      type="button"
                      onClick={() => handlePurchasePortfolio(selectedProject)}
                      className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black tracking-tight transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20"
                    >
                      <CreditCard className="w-4 h-4" />
                      이 상세 설계템플릿 즉시 소장하기
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTransitionToEstimate(selectedProject)}
                      className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-extrabold tracking-tight transition-all flex items-center justify-center gap-1 border border-white/10"
                    >
                      <span className="text-blue-400">이 소구기법으로 나도 맞춤 의뢰</span>
                      <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toss Payments Success Receipt Overlay modal */}
      <AnimatePresence>
        {successReceipt && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl border border-zinc-100 p-6 text-center text-left"
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-[#0A192F] mb-1">인증 결제 승인 완료</h2>
              <p className="text-xs text-zinc-500 mb-6 uppercase tracking-wider">포트폴리오 원본 릴리즈 명세서</p>

              <div className="bg-zinc-50 rounded-2xl p-4 text-xs space-y-2 text-left border border-zinc-200/50 mb-6">
                <div className="flex justify-between">
                  <span className="text-zinc-400">상세 상품명</span>
                  <span className="font-extrabold text-[#0A192F] text-right line-clamp-1">{successReceipt.packageName}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 pt-2">
                  <span className="text-zinc-400">결제 주문 ID</span>
                  <span className="font-mono text-zinc-700">{successReceipt.orderId}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 pt-2">
                  <span className="text-zinc-400">최종 카드 승인원가</span>
                  <span className="font-black text-blue-600">{(successReceipt.amount).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 pt-2">
                  <span className="text-zinc-400">보안 인증키</span>
                  <span className="font-mono text-[10px] text-zinc-500 line-clamp-1 max-w-[200px] text-right">{successReceipt.paymentKey}</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-left mb-6">
                <p className="text-[11px] text-[#0052FF] font-bold leading-relaxed">
                  📢 템플릿 Figma 설계도 다운로드 가이드라인이 가입하신 이메일 혹은 회원 주소록으로 실시간 즉각 전달되었습니다. 24시간 원스톱 지원을 보장합니다.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSuccessReceipt(null)}
                className="w-full py-3 bg-[#0052FF] hover:bg-blue-600 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-500/10 animate-pulse"
              >
                가이드 확인 및 구매 영수증 닫기
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toss Payments Error Receipt Overlay modal */}
      <AnimatePresence>
        {paymentError && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl border border-zinc-100 p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                <X className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-[#0A192F] mb-1">인증 실패 혹은 결제 취소</h2>
              <p className="text-xs text-zinc-500 mb-6 uppercase tracking-wider">Toss Payments 결제 반려 알림</p>

              <div className="bg-red-50/30 rounded-2xl p-4 text-xs space-y-2 text-left border border-red-100/50 mb-6">
                <div className="flex justify-between">
                  <span className="text-zinc-400">발견 에러 코드</span>
                  <span className="font-mono text-medium text-red-600">{paymentError.code}</span>
                </div>
                <div className="flex flex-col border-t border-zinc-200/30 pt-2 leading-relaxed">
                  <span className="text-zinc-500">실시간 카드 승인 거절 사유</span>
                  <span className="font-semibold text-zinc-800 mt-1">{paymentError.message}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPaymentError(null)}
                className="w-full py-3 bg-[#0A192F] hover:bg-[#0052FF] text-white font-bold rounded-xl text-xs transition-all"
              >
                오류 확인 및 닫기
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
