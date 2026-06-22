import { motion } from "motion/react";
import { useState, useMemo } from "react";
import { CheckCircle2, Calculator } from "lucide-react";

export function ServiceEstimateView() {
  const [pageSections, setPageSections] = useState(5);
  const [addCopywriting, setAddCopywriting] = useState(false);
  const [add3DMockup, setAdd3DMockup] = useState(false);
  const [fastDelivery, setFastDelivery] = useState(false);

  const calculateEstimate = useMemo(() => {
    let base = pageSections * 150000;
    if (addCopywriting) base += 200000;
    if (add3DMockup) base += 150000;
    if (fastDelivery) base = base * 1.2;
    return base;
  }, [pageSections, addCopywriting, add3DMockup, fastDelivery]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col w-full px-6 py-12 pb-24"
    >
      <div className="w-full max-w-7xl mx-auto space-y-24">
        {/* Pricing Notice */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#0A192F] mb-6">
            투명하고 합리적인 비용 구조
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            원하시는 서비스 범위와 목적에 맞춰 가장 적합한 패키지를 선택하실 수 있습니다. 숨겨진 추가금 없이 모든 내역을 투명하게 공개합니다.
          </p>
        </div>

        {/* 3 Step Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Light */}
          <div className="bg-white border border-zinc-200 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-bold text-[#0A192F] mb-2">라이트</h3>
            <p className="text-zinc-500 mb-6 text-sm">일회성 베이직 페이지 제작</p>
            <div className="text-3xl font-extrabold text-[#0052FF] mb-6">₩750,000<span className="text-lg text-zinc-400 font-medium tracking-normal"> / 시작</span></div>
            <ul className="space-y-4 mb-8">
              {['기본 5단락 반응형 페이지', '스탠다드 컴포넌트 활용', '단순 수정 1회 포함', '원본 소스 미제공'].map((item, i) => (
                <li key={i} className="flex gap-3 text-zinc-600 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-zinc-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button className="w-full py-3 rounded-full border border-zinc-300 font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors">자세히 보기</button>
          </div>

          {/* Professional */}
          <div className="bg-[#0052FF] border border-[#0052FF] p-8 rounded-3xl shadow-xl shadow-blue-500/20 transform md:-translate-y-4 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#0A192F] text-white text-xs font-bold rounded-full tracking-widest">MOST POPULAR</div>
            <h3 className="text-2xl font-bold text-white mb-2">프로페셔널</h3>
            <p className="text-blue-100 mb-6 text-sm">고급 기획 및 맞춤형 3D 디자인</p>
            <div className="text-3xl font-extrabold text-white mb-6">₩1,800,000<span className="text-lg text-blue-200 font-medium tracking-normal"> / 시작</span></div>
            <ul className="space-y-4 mb-8">
              {['심리 분석 기반 카피라이팅 기획', '맞춤형 3D 비주얼 에셋 제작', '전환율 최적화 A/B 테스트 세팅', '무제한 수정 (기간 내)', '원본 소스 제공'].map((item, i) => (
                <li key={i} className="flex gap-3 text-blue-50 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button className="w-full py-3 rounded-full bg-white font-bold text-[#0052FF] hover:bg-blue-50 transition-colors shadow-lg">이 패키지로 문의하기</button>
          </div>

          {/* Premium */}
          <div className="bg-white border border-zinc-200 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-bold text-[#0A192F] mb-2">프리미엄 멤버십</h3>
            <p className="text-zinc-500 mb-6 text-sm">컨설팅 및 정기 유지보수 구독형</p>
            <div className="text-3xl font-extrabold text-[#0052FF] mb-6">₩900,000<span className="text-lg text-zinc-400 font-medium tracking-normal"> / 월</span></div>
            <ul className="space-y-4 mb-8">
              {['프로페셔널 혜택 모두 포함', '주기적 전환율 리포트 제공', '매월 디자인 부분 리뉴얼', '전담 매니저 배정', '우선 처리권 부여'].map((item, i) => (
                <li key={i} className="flex gap-3 text-zinc-600 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-[#0A192F] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
             <button className="w-full py-3 rounded-full bg-[#0A192F] font-bold text-white hover:bg-zinc-800 transition-colors shadow-lg">멤버십 가입 문의</button>
          </div>
        </div>

        {/* Interactive Calculator */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 md:p-12 shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-zinc-100">
            <div className="p-3 bg-blue-50 rounded-xl text-[#0052FF]">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#0A192F]">간이 견적 계산기</h2>
              <p className="text-zinc-500 text-sm">직접 옵션을 조합하여 예상 비용을 확인해보세요.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-12">
            <div className="flex-1 space-y-8">
              {/* Slider Option */}
              <div>
                <label className="flex justify-between font-semibold text-[#0A192F] mb-4">
                  <span>페이지 길이 (단락 수)</span>
                  <span className="text-[#0052FF]">{pageSections} 단락</span>
                </label>
                <input 
                  type="range" 
                  min="5" 
                  max="15" 
                  step="1"
                  value={pageSections} 
                  onChange={(e) => setPageSections(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#0052FF]"
                />
                <div className="flex justify-between text-xs text-zinc-400 mt-2">
                  <span>기본 (5개)</span>
                  <span>최대 (15개)</span>
                </div>
              </div>

              {/* Checkbox Options */}
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border border-zinc-200 rounded-2xl cursor-pointer hover:border-[#0052FF] transition-colors">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-[#0052FF] rounded border-zinc-300 focus:ring-[#0052FF]" 
                      checked={addCopywriting}
                      onChange={(e) => setAddCopywriting(e.target.checked)}
                    />
                    <span className="font-medium text-[#0A192F]">전문 카피라이팅 추가</span>
                  </div>
                  <span className="text-zinc-500 text-sm">+200,000원</span>
                </label>

                <label className="flex items-center justify-between p-4 border border-zinc-200 rounded-2xl cursor-pointer hover:border-[#0052FF] transition-colors">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-[#0052FF] rounded border-zinc-300 focus:ring-[#0052FF]" 
                      checked={add3DMockup}
                      onChange={(e) => setAdd3DMockup(e.target.checked)}
                    />
                    <span className="font-medium text-[#0A192F]">3D 기획 목업 추가</span>
                  </div>
                  <span className="text-zinc-500 text-sm">+150,000원</span>
                </label>

                <label className="flex items-center justify-between p-4 border border-zinc-200 rounded-2xl cursor-pointer hover:border-[#0052FF] transition-colors">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-[#0052FF] rounded border-zinc-300 focus:ring-[#0052FF]" 
                      checked={fastDelivery}
                      onChange={(e) => setFastDelivery(e.target.checked)}
                    />
                    <span className="font-medium text-[#0A192F]">납기 단축 옵션 (Express)</span>
                  </div>
                  <span className="text-zinc-500 text-sm">+총액의 20% 가산</span>
                </label>
              </div>
            </div>

            <div className="flex-1 bg-[#F8F9FA] rounded-2xl p-8 flex flex-col justify-center items-center text-center border border-zinc-100">
              <span className="text-zinc-500 font-medium mb-2">실시간 예상 견적액</span>
              <div className="text-4xl md:text-5xl font-extrabold text-[#0052FF] font-mono tabular-nums mb-6">
                 ₩{calculateEstimate.toLocaleString()}
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xs mb-8">
                * 위 금액은 단순 참고용 견적이며, 실제 요구사항에 따라 변동될 수 있습니다.
              </p>
              <button className="w-full sm:w-auto bg-[#0A192F] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-zinc-800 transition-colors">
                이 견적으로 상담 신청하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
