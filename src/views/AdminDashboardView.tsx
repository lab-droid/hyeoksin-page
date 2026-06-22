import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useAppContext } from "../AppContext";
import { db } from "../firebase";
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc
} from "firebase/firestore";
import { 
  Users, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Trash2, 
  Sparkles, 
  RefreshCw, 
  ArrowLeft,
  Settings
} from "lucide-react";
import { Toast } from "../components/Toast";

interface UserRecord {
  uid: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface RequestItem {
  id: string;
  userId: string;
  text: string;
  status: string;
  createdAt: string;
  userEmail?: string;
  userName?: string;
}

export function AdminDashboardView() {
  const { authSession, setCurrentView } = useAppContext();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Guard: If not admin, redirect or block view
  useEffect(() => {
    if (authSession.user?.role !== 'admin') {
      setCurrentView('home');
    }
  }, [authSession.user?.role]);

  // Read all users and requests from Firestore in real-time
  useEffect(() => {
    if (authSession.user?.role !== 'admin') return;

    setLoading(true);

    // 1. Listen to users
    const usersQuery = query(collection(db, "users"));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersList: UserRecord[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        usersList.push({
          uid: doc.id,
          email: data.email || "",
          name: data.name || "",
          role: data.role || "user",
          createdAt: data.createdAt || ""
        });
      });
      setUsers(usersList);
    }, (error) => {
      console.error("Firestore users loading error:", error);
      triggerToast("사용자 목록을 불러오는 중 오류가 발생했습니다.", "error");
    });

    // 2. Listen to requests
    const requestsQuery = query(collection(db, "requests"));
    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      const requestsList: RequestItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        requestsList.push({
          id: doc.id,
          userId: data.userId || "",
          text: data.text || "",
          status: data.status || "검토중",
          createdAt: data.createdAt || ""
        });
      });
      // Sort newest requests first
      requestsList.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setRequests(requestsList);
      setLoading(false);
    }, (error) => {
      console.error("Firestore requests loading error:", error);
      triggerToast("수정 요청 사역 목록 로딩에 실패했습니다.", "error");
      setLoading(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeRequests();
    };
  }, [authSession.user?.role]);

  // Combine requests with user info
  const enrichedRequests: RequestItem[] = requests.map(req => {
    const userMatch = users.find(u => u.uid === req.userId);
    return {
      ...req,
      userEmail: userMatch?.email || "알 수 없는 이메일",
      userName: userMatch?.name || "알 수 없는 사용자"
    };
  });

  // Filter & Search
  const filteredRequests = enrichedRequests.filter(req => {
    const matchSearch = 
      req.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.userEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchStatus = statusFilter === "all" || req.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // Update status in Firestore
  const handleUpdateStatus = async (requestId: string, currentStatus: string) => {
    // Cycles request status: 검토중 -> 진행중 -> 처리완료 -> 검토중
    let nextStatus = "검토중";
    if (currentStatus === "검토중") nextStatus = "진행중";
    else if (currentStatus === "진행중") nextStatus = "처리완료";

    try {
      const reqRef = doc(db, "requests", requestId);
      await updateDoc(reqRef, {
        status: nextStatus
      });
      triggerToast(`요청의 진척 상태가 '${nextStatus}'(으)로 변경되었습니다.`, "success");
    } catch (err) {
      console.error("Error updating status:", err);
      triggerToast("상태 변경 저장 중 오류가 발생했습니다.", "error");
    }
  };

  // Delete requests
  const handleDeleteRequest = async (requestId: string) => {
    if (!window.confirm("이 수정 요청을 영구적으로 삭제하시겠습니까?")) return;
    try {
      await deleteDoc(doc(db, "requests", requestId));
      triggerToast("수정 요청이 안전하게 영구 삭제되었습니다.", "success");
    } catch (err) {
      console.error("Error deleting request:", err);
      triggerToast("수정 삭제 처리 중 요류가 발생했습니다.", "error");
    }
  };

  // Counters
  const countInReview = requests.filter(r => r.status === "검토중").length;
  const countInProgress = requests.filter(r => r.status === "진행중").length;
  const countCompleted = requests.filter(r => r.status === "처리완료").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col w-full px-6 py-12 bg-zinc-50 min-h-[calc(100vh-80px-100px)]"
    >
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200 pb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[#0052FF] font-semibold text-sm">
              <Settings className="w-4 h-4 animate-spin-slow" />
              <span>최고 관리자 전용 영역</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#0A192F] tracking-tight mb-2">통합 관리자 대시보드</h1>
            <p className="text-zinc-500">
              첫 가입 관리자 혜택으로 지정된 <span className="font-semibold text-zinc-900">{authSession.user?.name}</span>님. 등록된 모든 구독자 정보와 실시간 요청 진행 과정을 원격 관리합니다.
            </p>
          </div>
          <button 
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0A192F] hover:bg-[#0052FF] text-white text-sm font-bold rounded-xl transition-colors self-start md:self-auto shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> 나의 구독 대시보드로 이동
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-[#0052FF] rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">누적 회원수</p>
              <h3 className="text-2xl font-bold text-[#0A192F] font-mono mt-0.5">{users.length}명</h3>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">검토 대기중</p>
              <h3 className="text-2xl font-bold text-orange-600 font-mono mt-0.5">{countInReview}건</h3>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">진행중인 작업</p>
              <h3 className="text-2xl font-bold text-indigo-600 font-mono mt-0.5">{countInProgress}건</h3>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">처리 완료본</p>
              <h3 className="text-2xl font-bold text-emerald-600 font-mono mt-0.5">{countCompleted}건</h3>
            </div>
          </div>
        </div>

        {/* Filters and List */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#0A192F]">구독자 실시간 요청 대장</h2>
              <span className="px-3 py-0.5 text-xs font-bold rounded-full bg-zinc-100 text-zinc-500">
                {filteredRequests.length}건 검색됨
              </span>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                <input 
                  type="text"
                  placeholder="작성자명, 이메일, 요청 내용 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2.5 w-full sm:w-[260px] rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/10 transition-all outline-none"
                />
              </div>

              <div className="flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-2 text-sm bg-zinc-50">
                <Filter className="w-4 h-4 text-zinc-400" />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent border-none outline-none text-zinc-600 text-sm font-medium cursor-pointer"
                >
                  <option value="all">모든 진행 상태</option>
                  <option value="검토중">검토중</option>
                  <option value="진행중">진행중</option>
                  <option value="처리완료">처리완료</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <svg className="animate-spin h-8 w-8 text-[#0052FF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-zinc-500 text-sm font-medium">Firestore 데이터베이스 실시간 스트림 연결 중...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 text-sm border-2 border-dashed border-zinc-100 rounded-2xl">
              검색 필터에 부합하는 구독자의 수정 요청 내역이 존재하지 않습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">날짜/작성자</th>
                    <th className="pb-3">요청 본문</th>
                    <th className="pb-3 text-center">진행 상태</th>
                    <th className="pb-3 text-right pr-2">작업 관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-sm">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="py-4 pl-2 font-medium">
                        <div className="flex flex-col">
                          <span className="text-zinc-900 font-bold">{req.userName}</span>
                          <span className="text-xs text-zinc-400">{req.userEmail}</span>
                          <span className="text-[11px] text-zinc-400 font-mono mt-1">{req.createdAt}</span>
                        </div>
                      </td>
                      <td className="py-4 max-w-md pr-4">
                        <p className="text-zinc-700 leading-relaxed font-medium break-words">
                          {req.text}
                        </p>
                      </td>
                      <td className="py-4 text-center">
                        <button
                          onClick={() => handleUpdateStatus(req.id, req.status)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-transform hover:scale-105 active:scale-95 inline-flex items-center gap-1.5 group-hover:shadow-sm ${
                            req.status === "처리완료"
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : req.status === "진행중"
                              ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                              : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                          }`}
                          title="클릭하여 상태 순환 (검토중 -> 진행중 -> 처리완료)"
                        >
                          {req.status === "처리완료" && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {req.status === "진행중" && <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />}
                          {req.status === "검토중" && <Clock className="w-3.5 h-3.5" />}
                          <span>{req.status}</span>
                        </button>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleUpdateStatus(req.id, req.status)}
                            className="p-2 text-zinc-400 hover:text-[#0052FF] hover:bg-blue-50 rounded-lg transition-all"
                            title="다음 진행 등급 변경"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(req.id)}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="요청 영구제거"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />
      )}
    </motion.div>
  );
}
