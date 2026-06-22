import { motion, AnimatePresence } from "motion/react";
import React, { useState, useMemo } from "react";
import { CheckCircle2, Calculator, X, Sparkles, Phone, Mail, User, Check, Send, AlertCircle } from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { Toast } from "../components/Toast";
import { useAppContext } from "../AppContext";

export function ServiceEstimateView() {
  const { authSession } = useAppContext();
  
  const [pageSections, setPageSections] = useState(5);
  const [addCopywriting, setAddCopywriting] = useState(false);
  const [add3DMockup, setAdd3DMockup] = useState(false);
  const [fastDelivery, setFastDelivery] = useState(false);

  // Modal open & form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Toast notifications
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const calculateEstimate = useMemo(() => {
    let base = pageSections * 150000;
    if (addCopywriting) base += 200000;
    if (add3DMockup) base += 150000;
    if (fastDelivery) base = base * 1.2;
    return base;
  }, [pageSections, addCopywriting, add3DMockup, fastDelivery]);

  const handleOpenModal = () => {
    if (authSession.isLoggedIn && authSession.user) {
      setName(authSession.user.name || "");
      setEmail(authSession.user.email || "");
    } else {
      setName("");
      setEmail("");
    }
    setContact("");
    setMessage("");
    setIsModalOpen(true);
  };

  const handleSubmitConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setToastMsg("신청자 명 또는 기업명을 적어주세요.");
      setToastType("error");
      return;
    }
    if (!contact.trim()) {
      setToastMsg("연락받으실 휴대폰 번호 또는 연락처를 적어주세요.");
      setToastType("error");
      return;
    }
    if (!email.trim()) {
      setToastMsg("연락받으실 이메일 연락처를 기재해 주세요.");
      setToastType("error");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "consultations"), {
        userId: authSession.user?.uid || "guest",
        userEmail: authSession.user?.email || email,
        name: name,
        contact: contact,
        pageSections: pageSections,
        addCopywriting: addCopywriting,
        add3DMockup: add3DMockup,
        fastDelivery: fastDelivery,
        finalEstimate: calculateEstimate,
        message: message,
        status: "대기중",
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });
      setToastMsg("간이 예상 견적을 기반으로 상담 신청서 접수가 왼료되었습니다!");
      setToastType("success");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Consultation submit fails:", err);
      setToastMsg("상담 접수 도중 오류가 발생했습니다. 다시 시도해 주세요.");
      setToastType("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col w-full px-6 py-12 pb-24 text-left"
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
            <button 
              onClick={handleOpenModal}
              className="w-full py-3 rounded-full border border-zinc-300 font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              자세히 보기 (간이 상담)
            </button>
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
            <button 
              onClick={handleOpenModal}
              className="w-full py-3 rounded-full bg-white font-bold text-[#0052FF] hover:bg-blue-50 transition-colors shadow-lg"
            >
              이 패키지로 문의하기
            </button>
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
             <button 
              onClick={handleOpenModal}
              className="w-full py-3 rounded-full bg-[#0A192F] font-bold text-white hover:bg-zinc-800 transition-colors shadow-lg"
             >
               멤버십 가입 문의
             </button>
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

          <div className="flex flex-col md:flex-row gap-12 text-left">
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
                <label className="flex items-center justify-between p-4 border border-zinc-200 rounded-2xl cursor-pointer hover:border-[#0052FF] transition-colors bg-white">
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

                <label className="flex items-center justify-between p-4 border border-zinc-200 rounded-2xl cursor-pointer hover:border-[#0052FF] transition-colors bg-white">
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

                <label className="flex items-center justify-between p-4 border border-zinc-200 rounded-2xl cursor-pointer hover:border-[#0052FF] transition-colors bg-white">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-[#0052FF] rounded border-zinc-300 focus:ring-[#0052FF]" 
                      checked={fastDelivery}
                      onChange={(e) => setAdd3DMockup(e.target.checked)}
                      onClick={() => setFastDelivery(prev => !prev)}
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
              <button 
                onClick={handleOpenModal}
                className="w-full sm:w-auto bg-[#0A192F] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-zinc-800 transition-all transform hover:scale-105 active:scale-95 shadow-md shadow-zinc-950/10"
              >
                이 견적으로 상담 신청하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Counseling Request Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden max-w-xl w-full shadow-2xl border border-zinc-100 relative text-left"
            >
              {/* Modal Head Banner */}
              <div className="bg-[#0A192F] p-6 text-white relative">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-5 right-5 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="bg-[#0052FF] text-white p-1 rounded-lg">
                    <Sparkles className="w-4 h-4 fill-white" />
                  </div>
                  <span className="text-xs font-black tracking-wider uppercase text-blue-300">정밀 상담 기획단</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight">이 견적으로 맞춤 정밀 상담 신청</h3>
                <p className="text-xs text-zinc-400 mt-1">작성하신 간이 계산서 사양이 컨설턴트 화면으로 즉각 실시간 전송됩니다.</p>
              </div>

              <form onSubmit={handleSubmitConsultation} className="p-6 space-y-6">
                
                {/* Embedded Selected Quote Checklist (Unmodifiable Display) */}
                <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-4 space-y-2">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide">신청하신 실시간 견적 조합</p>
                  
                  <div className="grid grid-cols-2 gap-y-1.5 text-xs text-zinc-700">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>페이지 크기:</span>
                    </div>
                    <span className="font-bold text-[#0A192F] text-right">{pageSections} 단락</span>

                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>전문 카피라이팅 기획:</span>
                    </div>
                    <span className={`font-bold text-right ${addCopywriting ? "text-blue-600" : "text-zinc-400"}`}>
                      {addCopywriting ? "적용 (+₩200,000)" : "미포함"}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>3D 기획 목업 아트:</span>
                    </div>
                    <span className={`font-bold text-right ${add3DMockup ? "text-blue-600" : "text-zinc-400"}`}>
                      {add3DMockup ? "적용 (+₩150,000)" : "미포함"}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>고속 납기단축 (Express):</span>
                    </div>
                    <span className={`font-bold text-right ${fastDelivery ? "text-blue-600" : "text-zinc-400"}`}>
                      {fastDelivery ? "적용 (+20% 가산)" : "미포함"}
                    </span>
                  </div>

                  <div className="border-t border-zinc-200 pt-2.5 mt-2 flex justify-between items-end">
                    <span className="text-zinc-500 font-medium text-xs">예상 설계 금액</span>
                    <span className="text-base font-black text-[#0052FF] font-mono">
                      ₩{calculateEstimate.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-4">
                  {/* Name or Company */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1 leading-none">신청인 또는 기업명 <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="예: 홍길동 / (주)혁신컴퍼니"
                        className="pl-9 pr-4 py-2.5 w-full bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/10 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1 leading-none">휴대폰 번호 또는 연락처 <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                      <input
                        type="tel"
                        required
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="예: 010-0000-0000"
                        className="pl-9 pr-4 py-2.5 w-full bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/10 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1 leading-none">이메일 주소 <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="info@yourcompany.com"
                        className="pl-9 pr-4 py-2.5 w-full bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/10 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1 leading-none">추가 문의 및 참고 요구 사항</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      placeholder="기타 비즈니스 목적 및 목표 전환율, 원하는 레퍼런스 주소 등을 간략히 기술해 주세요."
                      className="p-3 w-full bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/10 transition-all outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Consent notification info */}
                <div className="flex gap-2 p-3 bg-blue-50/40 border border-blue-100 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-[#0052FF] flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    본 신청서는 담당 전문 컨설턴트 외에 타인에 공유되지 않으며, 영업일 기준 24시간 이내 연락을 수립하는 용도로만 한정 사용됩니다.
                  </p>
                </div>

                {/* Submit button bar */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-zinc-100 font-bold text-zinc-600 hover:bg-zinc-200 rounded-xl text-xs transition-colors"
                  >
                    돌아가기
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-[#0052FF] hover:bg-blue-600 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/15 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>신청 등록 중...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>정형 상담 제출</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {toastMsg && (
        <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg("")} />
      )}
    </motion.div>
  );
}
