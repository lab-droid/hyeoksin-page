import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useAppContext } from "../AppContext";
import { DASHBOARD_CHART_DATA } from "../data";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Upload, Download, FileText, Send, Clock, Sparkles } from "lucide-react";
import { Toast } from "../components/Toast";
import { db } from "../firebase";
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore";

interface RequestItem {
  id: string;
  text: string;
  status: string;
  date: string;
}

export function DashboardView() {
  const { authSession } = useAppContext();
  const [requestText, setRequestText] = useState("");
  const [requestsList, setRequestsList] = useState<RequestItem[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch requests from Firestore in real-time
  useEffect(() => {
    if (!authSession.user?.uid) return;

    const q = query(
      collection(db, "requests"),
      where("userId", "==", authSession.user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: RequestItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          text: data.text || "",
          status: data.status || "검토중",
          date: data.createdAt || "",
        });
      });
      
      // Sort client-side by date or id to avoid complex composite index requirement
      items.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
      setRequestsList(items);
    }, (error) => {
      console.error("Firestore loading error:", error);
    });

    return () => unsubscribe();
  }, [authSession.user?.uid]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestText.trim() || !authSession.user?.uid) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, "requests"), {
        userId: authSession.user.uid,
        text: requestText.trim(),
        status: "검토중",
        createdAt: new Date().toISOString().split('T')[0],
      });

      setRequestText("");
      setToastMessage("디자인 수정 요청이 Firestore에 실시간 등록되었습니다.");
    } catch (error) {
      console.error("Error creating request:", error);
      setToastMessage("요청 등록 중 에러가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col w-full px-6 py-12"
    >
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200 pb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0A192F] tracking-tight mb-2">구독자 전용 대시보드</h1>
            <p className="text-zinc-500">
              환영합니다, <span className="font-semibold text-[#0052FF]">{authSession.user?.name}</span>님. 실시간 Firebase DB에 연동되어 안전하게 보관되는 수정 이력과 트렌드를 가꾸어보세요.
            </p>
          </div>
          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors">
               <Download className="h-4 w-4" /> 리포트 다운로드
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart Area */}
          <div className="lg:col-span-2 space-y-8">
             <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
               <div className="mb-6 flex justify-between items-center">
                 <h2 className="text-xl font-bold text-[#0A192F]">주차별 전환율 상승 트렌드</h2>
                 <select className="text-sm border-zinc-200 rounded-lg px-3 py-1 bg-zinc-50 text-zinc-600 font-medium cursor-pointer outline-none focus:ring-2 focus:ring-[#0052FF]/20">
                   <option>최근 1개월</option>
                   <option>최근 3개월</option>
                 </select>
               </div>
               <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={DASHBOARD_CHART_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dx={-10} unit="%" />
                     <Tooltip 
                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                     />
                     <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 500 }} />
                     <Line type="monotone" dataKey="일반상세" stroke="#a1a1aa" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="일반 상세페이지" />
                     <Line type="monotone" dataKey="혁신상세" stroke="#0052FF" strokeWidth={4} dot={{ r: 5 }} activeDot={{ r: 8 }} name="혁신페이지" />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
             </div>

             <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#0A192F]">정기 디자인 수정 요청</h2>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0052FF] text-xs font-semibold">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>실시간 Firestore 동기화 완료</span>
                  </div>
                </div>
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <textarea 
                    value={requestText}
                    disabled={submitting}
                    onChange={(e) => setRequestText(e.target.value)}
                    placeholder="수정이 필요한 섹션과 구체적인 요청 사항을 작성해주세요."
                    className="w-full min-h-[120px] p-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all bg-zinc-50 focus:bg-white resize-y disabled:opacity-50"
                  />
                  <div className="flex justify-between items-center">
                    <button type="button" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-[#0052FF] transition-colors font-medium">
                      <Upload className="h-4 w-4" /> 관련 파일 첨부 (.png, .zip)
                    </button>
                    <button 
                      type="submit" 
                      disabled={submitting || !requestText.trim()}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#0A192F] text-white rounded-xl font-bold hover:bg-[#0052FF] transition-colors disabled:opacity-50"
                    >
                       {submitting ? (
                         <>
                           <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           등록 중...
                         </>
                       ) : (
                         <>
                           <Send className="h-4 w-4" /> 요청 등록
                         </>
                       )}
                    </button>
                  </div>
                </form>

                <div className="mt-8 pt-8 border-t border-zinc-100">
                  <h3 className="text-sm font-bold text-zinc-400 mb-4 tracking-wider uppercase">최근 요청 내역 ({requestsList.length}건)</h3>
                  {requestsList.length === 0 ? (
                    <div className="text-center py-8 text-zinc-400 text-sm">
                      등록된 수정 요청 내역이 없습니다. 위의 양식을 통해 첫 번째 요청을 접수해보세요!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {requestsList.map((req) => (
                        <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100 gap-4">
                          <div className="flex items-start gap-3">
                             <div className="mt-0.5 min-w-[32px] w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center">
                                 {req.status === '검토중' ? <Clock className="h-4 w-4 text-orange-500" /> : <FileText className="h-4 w-4 text-emerald-500" />}
                             </div>
                             <div className="flex-1">
                               <p className="text-sm font-semibold text-[#0A192F] leading-tight mb-1">{req.text}</p>
                               <p className="text-xs text-zinc-500">{req.date}</p>
                             </div>
                          </div>
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg whitespace-nowrap self-start sm:self-center ${req.status === '처리완료' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                             {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
             </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 text-white shadow-xl">
               <h2 className="text-lg font-bold mb-2">프리미엄 멤버십 활성 상태</h2>
               <div className="mt-4 bg-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-sm text-zinc-400">남은 잔여 수정 횟수</span>
                  <span className="text-2xl font-bold text-white font-mono">무제한</span>
               </div>
               <div className="mt-4 pt-4 border-t border-zinc-800 text-sm">
                 <p className="text-zinc-400 flex justify-between mb-2"><span>다음 결제일</span> <span>2024. 12. 01</span></p>
                 <p className="text-zinc-400 flex justify-between"><span>전담 매니저</span> <span>김이혁 팀장</span></p>
               </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
               <h2 className="text-lg font-bold text-[#0A192F] mb-4">계약서 및 작업물 아카이브</h2>
               <div className="space-y-2">
                 {[
                   { name: '[혁신페이지] 서비스이용계약서_완본.pdf', size: '2.1 MB' },
                   { name: '[넥스트가전] 클린봇X_상세디자인소스.zip', size: '154 MB' },
                   { name: '10월_전환율성과리포트_최종.pdf', size: '4.5 MB' },
                 ].map((file, i) => (
                   <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer group border border-transparent hover:border-zinc-200">
                     <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-blue-50 text-[#0052FF] rounded-lg">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium text-[#0A192F] truncate">{file.name}</p>
                          <p className="text-xs text-zinc-500">{file.size}</p>
                        </div>
                     </div>
                     <Download className="h-4 w-4 text-zinc-400 group-hover:text-[#0052FF] opacity-0 group-hover:opacity-100 transition-all" />
                   </div>
                 ))}
               </div>
            </div>

          </div>

        </div>
      </div>
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}
    </motion.div>
  );
}
