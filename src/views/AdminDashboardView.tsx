import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../AppContext";
import { db } from "../firebase";
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  addDoc
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
  Settings,
  Download,
  Plus,
  Save,
  Edit2,
  Check,
  X,
  UserX,
  UserCheck,
  Shield,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  AlertCircle,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { Toast } from "../components/Toast";
import { PortfolioItem } from "../types";

interface UserRecord {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
  tier: 'Essential' | 'Premium' | 'Enterprise';
  status: 'Active' | 'Suspended';
  memo: string;
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

interface ConsultationItem {
  id: string;
  userId: string;
  userEmail: string;
  name: string;
  contact: string;
  pageSections: number;
  addCopywriting: boolean;
  add3DMockup: boolean;
  fastDelivery: boolean;
  finalEstimate: number;
  message: string;
  status: string;
  createdAt: string;
}

export function AdminDashboardView() {
  const { authSession, setCurrentView } = useAppContext();
  
  // Tab control inside admin panel
  const [activeTab, setActiveTab] = useState<"users_sheet" | "requests_list" | "consultations_list" | "portfolios_board">("users_sheet");
  
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [consultationsLoading, setConsultationsLoading] = useState(true);

  // Portfolio board manager state
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [portfoliosLoading, setPortfoliosLoading] = useState(true);

  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [editingPortfolioId, setEditingPortfolioId] = useState<string | number | null>(null);
  const [portTitle, setPortTitle] = useState("");
  const [portCategory, setPortCategory] = useState("테크");
  const [portClient, setPortClient] = useState("");
  const [portBeforeRate, setPortBeforeRate] = useState("");
  const [portAfterRate, setPortAfterRate] = useState("");
  const [portIncrease, setPortIncrease] = useState("");
  const [portImageUrl, setPortImageUrl] = useState("");
  const [portTags, setPortTags] = useState("");
  const [portSummary, setPortSummary] = useState("");
  const [portDescription, setPortDescription] = useState("");
  const [portPrice, setPortPrice] = useState<number>(350000);
  const [portOriginalPrice, setPortOriginalPrice] = useState<number>(590000);
  const [portBenefit1, setPortBenefit1] = useState("");
  const [portBenefit2, setPortBenefit2] = useState("");
  const [portBenefit3, setPortBenefit3] = useState("");

  const [dragOver, setDragOver] = useState(false);

  const handleImageFileProcess = (file: File) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      triggerToast("PNG, JPG 이미지 파일만 업로드할 수 있습니다.", "error");
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      triggerToast("이미지 파일 크기는 30MB 이하여야 합니다.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPortImageUrl(reader.result);
        triggerToast("이미지가 업로드되었습니다.", "success");
      }
    };
    reader.onerror = () => {
      triggerToast("이미지 인코딩 도중 에러가 생겼습니다.", "error");
    };
    reader.readAsDataURL(file);
  };
  
  // Shared search & filters
  const [searchQuery, setSearchQuery] = useState("");
  const [userTabFilter, setUserTabFilter] = useState<"all" | "admin" | "user" | "active" | "suspended">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Member sheet sorting state
  const [sortColumn, setSortColumn] = useState<keyof UserRecord>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Checked rows for batch operations
  const [selectedUserUids, setSelectedUserUids] = useState<string[]>([]);
  
  // Inline editing cell pointer
  const [editingCell, setEditingCell] = useState<{ uid: string; field: keyof UserRecord } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Manual register modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>("user");
  const [newUserTier, setNewUserTier] = useState<'Essential' | 'Premium' | 'Enterprise'>("Essential");
  const [newUserStatus, setNewUserStatus] = useState<'Active' | 'Suspended'>("Active");
  const [newUserMemo, setNewUserMemo] = useState("");

  // Toast UI setup
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Guard safety
  useEffect(() => {
    if (authSession.user?.role !== 'admin') {
      setCurrentView('home');
    }
  }, [authSession.user?.role]);

  // Sync real-time streams from Firestore
  useEffect(() => {
    if (authSession.user?.role !== 'admin') return;

    setUsersLoading(true);
    setRequestsLoading(true);
    setConsultationsLoading(true);

    // 1. Live stream of Users collection
    const usersQuery = query(collection(db, "users"));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersList: UserRecord[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        let safeCreatedAt = new Date().toISOString().substring(0, 10);
        if (typeof data.createdAt === 'string') {
          safeCreatedAt = data.createdAt.replace('T', ' ').substring(0, 10);
        } else if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          safeCreatedAt = data.createdAt.toDate().toISOString().replace('T', ' ').substring(0, 10);
        }

        usersList.push({
          uid: doc.id,
          email: data.email || "",
          name: data.name || "",
          role: data.role || "user",
          createdAt: safeCreatedAt,
          tier: data.tier || "Essential",
          status: data.status || "Active",
          memo: data.memo || ""
        });
      });
      setUsers(usersList);
      setUsersLoading(false);
    }, (error) => {
      console.error("Firestore loading error:", error);
      triggerToast("사용자 데이터를 불러오는 중 오류가 발생했습니다.", "error");
      setUsersLoading(false);
    });

    // 2. Live stream of Requests collection
    const requestsQuery = query(collection(db, "requests"));
    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      const requestsList: RequestItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        let safeCreatedAt = "";
        if (typeof data.createdAt === 'string') safeCreatedAt = data.createdAt;
        else if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          safeCreatedAt = data.createdAt.toDate().toISOString();
        }

        requestsList.push({
          id: doc.id,
          userId: data.userId || "",
          text: data.text || "",
          status: data.status || "검토중",
          createdAt: safeCreatedAt
        });
      });
      requestsList.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setRequests(requestsList);
      setRequestsLoading(false);
    }, (error) => {
      console.error("Firestore requests loading error:", error);
      triggerToast("고객 요청대장 로딩에 실패했습니다.", "error");
      setRequestsLoading(false);
    });

    // 3. Live stream of Consultations collection
    const consultationsQuery = query(collection(db, "consultations"));
    const unsubscribeConsultations = onSnapshot(consultationsQuery, (snapshot) => {
      const consList: ConsultationItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        let safeCreatedAt = "";
        if (typeof data.createdAt === 'string') safeCreatedAt = data.createdAt;
        else if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          safeCreatedAt = data.createdAt.toDate().toISOString();
        }

        consList.push({
          id: doc.id,
          userId: data.userId || "",
          userEmail: data.userEmail || "",
          name: data.name || "",
          contact: data.contact || "",
          pageSections: Number(data.pageSections ?? 5),
          addCopywriting: !!data.addCopywriting,
          add3DMockup: !!data.add3DMockup,
          fastDelivery: !!data.fastDelivery,
          finalEstimate: Number(data.finalEstimate ?? 0),
          message: data.message || "",
          status: data.status || "대기중",
          createdAt: safeCreatedAt
        });
      });
      consList.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setConsultations(consList);
      setConsultationsLoading(false);
    }, (error) => {
      console.error("Firestore consultations loading error:", error);
      triggerToast("상담 신청 양식 대장 로딩에 실패했습니다.", "error");
      setConsultationsLoading(false);
    });

    // 4. Live stream of Portfolios collection
    setPortfoliosLoading(true);
    const portfoliosQuery = query(collection(db, "portfolios"));
    const unsubscribePortfolios = onSnapshot(portfoliosQuery, (snapshot) => {
      const portsList: PortfolioItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        let safeCreatedAt = "";
        if (typeof data.createdAt === 'string') safeCreatedAt = data.createdAt;
        else if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          safeCreatedAt = data.createdAt.toDate().toISOString();
        }

        portsList.push({
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
          createdAt: safeCreatedAt
        });
      });
      portsList.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setPortfolios(portsList);
      setPortfoliosLoading(false);
    }, (error) => {
      console.error("Firestore portfolios loading error:", error);
      triggerToast("포트폴리오 대장 로딩에 실패했습니다.", "error");
      setPortfoliosLoading(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeRequests();
      unsubscribeConsultations();
      unsubscribePortfolios();
    };
  }, [authSession.user?.role]);

  // Combine requests with user name/email
  const enrichedRequests: RequestItem[] = requests.map(req => {
    const matched = users.find(u => u.uid === req.userId);
    return {
      ...req,
      userEmail: matched?.email || "알 수 없는 이메일",
      userName: matched?.name || "알 수 없는 가입자"
    };
  });

  // Filter and sort requests list
  const filteredRequests = enrichedRequests.filter(req => {
    const textSearch = searchQuery.toLowerCase();
    const matchSearch = 
      req.text.toLowerCase().includes(textSearch) ||
      (req.userName || "").toLowerCase().includes(textSearch) ||
      (req.userEmail || "").toLowerCase().includes(textSearch);
    const matchStatus = statusFilter === "all" || req.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Filter consultations list
  const filteredConsultations = consultations.filter(con => {
    const textSearch = searchQuery.toLowerCase();
    const matchSearch =
      con.name.toLowerCase().includes(textSearch) ||
      con.contact.toLowerCase().includes(textSearch) ||
      con.userEmail.toLowerCase().includes(textSearch) ||
      con.message.toLowerCase().includes(textSearch);
    const matchStatus = statusFilter === "all" || con.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Sorter logic for Users collection
  const handleSort = (column: keyof UserRecord) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const valA = (a[sortColumn] || "").toString().toLowerCase();
    const valB = (b[sortColumn] || "").toString().toLowerCase();
    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Filters for spreadsheet rows
  const filteredUsers = sortedUsers.filter(user => {
    if (userTabFilter === "admin" && user.role !== "admin") return false;
    if (userTabFilter === "user" && user.role !== "user") return false;
    if (userTabFilter === "active" && user.status !== "Active") return false;
    if (userTabFilter === "suspended" && user.status !== "Suspended") return false;

    if (searchQuery.trim() !== "") {
      const searchLower = searchQuery.toLowerCase();
      return (
        (user.name || "").toLowerCase().includes(searchLower) ||
        (user.email || "").toLowerCase().includes(searchLower) ||
        (user.memo || "").toLowerCase().includes(searchLower) ||
        (user.tier || "").toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Grid/Cell editing methods
  const startEditing = (uid: string, field: keyof UserRecord, currentVal: string) => {
    setEditingCell({ uid, field });
    setEditValue(currentVal);
  };

  const saveInlineEdit = async (uid: string, field: keyof UserRecord) => {
    if (editValue.trim() === "") {
      triggerToast("빈 값으로 설정할 수 없습니다.", "error");
      return;
    }
    try {
      const uRef = doc(db, "users", uid);
      await updateDoc(uRef, {
        [field]: editValue
      });
      triggerToast("수정 정보가 실시간 반영 완료되었습니다.", "success");
      setEditingCell(null);
    } catch (e) {
      console.error(e);
      triggerToast("데이터 실시간 업데이트에 실패했습니다.", "error");
    }
  };

  // Direct fast toggles for selectors
  const updateFieldDirectly = async (uid: string, field: keyof UserRecord, val: string) => {
    try {
      const uRef = doc(db, "users", uid);
      await updateDoc(uRef, {
        [field]: val
      });
      triggerToast("권한/구독/계정 등급 변경 성공", "success");
    } catch (e) {
      console.error("Direct update failure:", e);
      triggerToast("실시간 필드 업데이트 도중 오류 발생", "error");
    }
  };

  // Individual user delete row
  const handleDeleteUser = async (uid: string, userName: string) => {
    if (!window.confirm(`정말 ${userName} 회원정보를 명부에서 영구 삭제하시겠습니까? 관련 데이터가 복구 불가능합니다.`)) return;
    try {
      await deleteDoc(doc(db, "users", uid));
      triggerToast("회원이 데이터계통상에서 완전히 영구 삭제되었습니다.", "success");
    } catch (err) {
      console.error(err);
      triggerToast("회원정보 삭제 처리 도중 오류가 발생했습니다.", "error");
    }
  };

  // Batch actions on spreadsheet rows
  const handleToggleSelectUser = (uid: string) => {
    setSelectedUserUids(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const handleToggleSelectAll = () => {
    const pageUids = filteredUsers.map(u => u.uid);
    const allSelected = pageUids.every(uid => selectedUserUids.includes(uid));

    if (allSelected) {
      setSelectedUserUids(prev => prev.filter(uid => !pageUids.includes(uid)));
    } else {
      setSelectedUserUids(prev => {
        const joined = new Set([...prev, ...pageUids]);
        return Array.from(joined);
      });
    }
  };

  const handleBatchUpdate = async (field: 'status' | 'tier' | 'role', value: string) => {
    if (selectedUserUids.length === 0) return;
    try {
      const promises = selectedUserUids.map(uid => {
        const uRef = doc(db, "users", uid);
        return updateDoc(uRef, { [field]: value });
      });
      await Promise.all(promises);
      triggerToast(`선택된 ${selectedUserUids.length}명 회원들의 ${field} 정보가 일괄 수정되었습니다.`, "success");
      setSelectedUserUids([]);
    } catch (e) {
      console.error("Batch update fail", e);
      triggerToast("일괄 변경 도중 통신 지연이 발생했습니다.", "error");
    }
  };

  const handleBatchDelete = async () => {
    if (selectedUserUids.length === 0) return;
    if (!window.confirm(`선택한 ${selectedUserUids.length}명 회원 전원을 데이터에서 영구 말소하겠습니까?`)) return;
    try {
      const promises = selectedUserUids.map(uid => deleteDoc(doc(db, "users", uid)));
      await Promise.all(promises);
      triggerToast(`${selectedUserUids.length}명 회원에 대한 말소를 완수하였습니다.`, "success");
      setSelectedUserUids([]);
    } catch (err) {
      console.error(err);
      triggerToast("일괄 말소 조치 처리 과정 중 착오가 발견되었습니다.", "error");
    }
  };

  // Manual creation form submit
  const handleAddNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) {
      triggerToast("이름과 이메일은 필수 입력 사항입니다.", "error");
      return;
    }

    try {
      const manualId = "user_manual_" + Math.random().toString(36).substring(2, 10);
      await setDoc(doc(db, "users", manualId), {
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        tier: newUserTier,
        status: newUserStatus,
        memo: newUserMemo,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 10)
      });

      triggerToast("새로운 회원이 명부에 등재 완료되었습니다.", "success");
      setShowAddModal(false);
      
      // Cleanup inputs
      setNewUserName("");
      setNewUserEmail("");
      setNewUserRole("user");
      setNewUserTier("Essential");
      setNewUserStatus("Active");
      setNewUserMemo("");
    } catch (e) {
      console.error("New user manual write failed:", e);
      triggerToast("신규 회원 수동 기재중 실패했습니다.", "error");
    }
  };

  // CSV Exporter method
  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      triggerToast("출력 대상 행이 존재하지 않습니다.", "error");
      return;
    }

    try {
      const BOM = "\uFEFF";
      const headers = ["ID", "이름", "이메일", "권한", "정기구독등급", "계정상태", "관리자메모", "명부등록일시"];
      const rows = filteredUsers.map(user => [
        user.uid,
        user.name,
        user.email,
        user.role === 'admin' ? '관리자' : '일반회원',
        user.tier,
        user.status === 'Active' ? '정상활성화' : '가입제한정지',
        `"${(user.memo || '').replace(/"/g, '""')}"`,
        user.createdAt
      ]);

      const csvJoined = BOM + [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
      const blob = new Blob([csvJoined], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const tempLink = document.createElement("a");
      const fileDate = new Date().toISOString().split('T')[0];
      
      tempLink.setAttribute("href", url);
      tempLink.setAttribute("download", `혁신페이지_통합회원장_스프레드시트_${fileDate}.csv`);
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      
      triggerToast(`${filteredUsers.length}개 회원 레코드가 CSV 파일로 전송되었습니다.`, "success");
    } catch (err) {
      console.error(err);
      triggerToast("다운로드 파일 스트림 인코딩 중 비정상 종료되었습니다.", "error");
    }
  };

  // Requests state transition helper
  const handleUpdateStatus = async (requestId: string, currentStatus: string) => {
    let nextStatus = "검토중";
    if (currentStatus === "검토중") nextStatus = "진행중";
    else if (currentStatus === "진행중") nextStatus = "처리완료";

    try {
      const queryRef = doc(db, "requests", requestId);
      await updateDoc(queryRef, {
        status: nextStatus
      });
      triggerToast(`진행 단계를 '${nextStatus}'(으)로 갱신 완료했습니다.`, "success");
    } catch (err) {
      console.error(err);
      triggerToast("서버 통신 지연으로 단계 갱신에 실패했습니다.", "error");
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!window.confirm("이 구독 신청 및 수정 요청건을 대장에서 제거하겠습니까?")) return;
    try {
      await deleteDoc(doc(db, "requests", requestId));
      triggerToast("요청건이 목록에서 제거되었습니다.", "success");
    } catch (err) {
      console.error(err);
      triggerToast("삭제 도중 예외가 발생했습니다.", "error");
    }
  };

  const handleUpdateConsultationStatus = async (consultationId: string, currentStatus: string) => {
    let nextStatus = "대기중";
    if (currentStatus === "대기중") nextStatus = "진행중";
    else if (currentStatus === "진행중") nextStatus = "상담완료";
    else if (currentStatus === "상담완료") nextStatus = "대기중";

    try {
      const qRef = doc(db, "consultations", consultationId);
      await updateDoc(qRef, {
        status: nextStatus
      });
      triggerToast(`상담 진행 상황을 '${nextStatus}'(으)로 갱신 완료했습니다.`, "success");
    } catch (err) {
      console.error("Update consultation status failure:", err);
      triggerToast("상담 상황 단계 전환 과정 중 오류 발견.", "error");
    }
  };

  const handleDeleteConsultation = async (consultationId: string) => {
    if (!window.confirm("이 견적 상담 신청서를 대장에서 영구 말소하겠습니까?")) return;
    try {
      await deleteDoc(doc(db, "consultations", consultationId));
      triggerToast("상담 신청서 폐기가 정상 조치되었습니다.", "success");
    } catch (err) {
      console.error("Delete consultation failure:", err);
      triggerToast("서류 파쇄 작업 도중 에러가 있었습니다.", "error");
    }
  };

  // Portfolio CRUD Handlers
  const resetPortfolioForm = () => {
    setEditingPortfolioId(null);
    setPortTitle("");
    setPortCategory("테크");
    setPortClient("");
    setPortBeforeRate("");
    setPortAfterRate("");
    setPortIncrease("");
    setPortImageUrl("");
    setPortTags("");
    setPortSummary("");
    setPortDescription("");
    setPortPrice(350000);
    setPortOriginalPrice(590000);
    setPortBenefit1("");
    setPortBenefit2("");
    setPortBenefit3("");
  };

  const handleOpenEditPortfolio = (port: PortfolioItem) => {
    setEditingPortfolioId(port.id);
    setPortTitle(port.title);
    setPortCategory(port.category);
    setPortClient(port.client);
    setPortBeforeRate(port.beforeRate);
    setPortAfterRate(port.afterRate);
    setPortIncrease(port.increase);
    setPortImageUrl(port.imageUrl);
    setPortTags(port.tags.join(", "));
    setPortSummary(port.summary || "");
    setPortDescription(port.description || "");
    setPortPrice(port.price ?? 350000);
    setPortOriginalPrice(port.originalPrice ?? 590005);
    setPortBenefit1(port.benefit1 || "");
    setPortBenefit2(port.benefit2 || "");
    setPortBenefit3(port.benefit3 || "");
    setShowPortfolioModal(true);
  };

  const handleSavePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portTitle || !portClient) {
      triggerToast("제목과 고객명은 필수 입력 사항입니다.", "error");
      return;
    }

    const tagsArray = portTags.split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const payload: any = {
      title: portTitle,
      category: portCategory,
      client: portClient,
      beforeRate: portBeforeRate,
      afterRate: portAfterRate,
      increase: portIncrease,
      imageUrl: portImageUrl || "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=600&q=80",
      tags: tagsArray,
      summary: portSummary,
      description: portDescription,
      price: Number(portPrice || 350000),
      originalPrice: Number(portOriginalPrice || 590000),
      benefit1: portBenefit1,
      benefit2: portBenefit2,
      benefit3: portBenefit3,
    };

    if (!editingPortfolioId) {
      payload.createdAt = new Date().toISOString();
    }

    try {
      if (editingPortfolioId) {
        const docRef = doc(db, "portfolios", editingPortfolioId.toString());
        await updateDoc(docRef, payload);
        triggerToast("포트폴리오 정보가 성공적으로 반영되었습니다.", "success");
      } else {
        const collectionRef = collection(db, "portfolios");
        await addDoc(collectionRef, payload);
        triggerToast("새로운 포트폴리오 기획 게시글이 등록되었습니다.", "success");
      }
      setShowPortfolioModal(false);
      resetPortfolioForm();
    } catch (err) {
      console.error("Failed to save portfolio:", err);
      triggerToast("파이어스토어 저장 연동 중 오류가 발생했습니다.", "error");
    }
  };

  const handleDeletePortfolio = async (id: string | number) => {
    if (!window.confirm("이 상세페이지 포트폴리오 게시글을 파이어스토어 대장에서 영구 삭제하시겠습니까?")) return;
    try {
      await deleteDoc(doc(db, "portfolios", id.toString()));
      triggerToast("포트폴리오 게시글이 말소 제거되었습니다.", "success");
    } catch (err) {
      console.error("Failed to delete portfolio:", err);
      triggerToast("포트폴리오 말소 도중 에러가 발견되었습니다.", "error");
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
      className="flex flex-col w-full px-6 py-12 bg-zinc-50 min-h-[calc(100vh-80px-100px)] text-left"
    >
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Big Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200 pb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[#0052FF] font-semibold text-sm">
              <Settings className="w-4 h-4 animate-spin-slow text-[#0052FF]" />
              <span>최고 원격 통제 관리국</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#0A192F] tracking-tight mb-2">통합 관리자 대시보드</h1>
            <p className="text-zinc-500">
              최고 관리자 계정(<span className="font-semibold text-zinc-900">{authSession.user?.name}님</span>)의 지휘하에 가입한 모든 구독 회원들의 세부 권한, 등급 상태를 수정하고 실시간 건의 대장을 다차원 조율합니다.
            </p>
          </div>
          <button 
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0A192F] hover:bg-[#0052FF] text-white text-sm font-bold rounded-xl transition-all shadow-md self-start md:self-auto hover:shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" /> 나의 구독 대시보드 이동
          </button>
        </div>

        {/* Dynamic Metric Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-[#0052FF] rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">누적 총회원수</p>
              <h3 className="text-2xl font-black text-[#0A192F] font-mono mt-0.5">{users.length} 명</h3>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">처리검토 필요</p>
              <h3 className="text-2xl font-black text-amber-600 font-mono mt-0.5">{countInReview} 건</h3>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
              <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">가동 진행안</p>
              <h3 className="text-2xl font-black text-indigo-600 font-mono mt-0.5">{countInProgress} 건</h3>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">완수 피드백</p>
              <h3 className="text-2xl font-black text-emerald-600 font-mono mt-0.5">{countCompleted} 건</h3>
            </div>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex border-b border-zinc-200">
          <button
            onClick={() => { setActiveTab("users_sheet"); setSearchQuery(""); }}
            className={`px-6 py-3.5 font-bold text-sm tracking-tight flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "users_sheet"
                ? "border-[#0052FF] text-[#0052FF]"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            회원 명부 관리 (체계적 스프레드시트)
          </button>
          
          <button
            onClick={() => { setActiveTab("requests_list"); setSearchQuery(""); }}
            className={`px-6 py-3.5 font-bold text-sm tracking-tight flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "requests_list"
                ? "border-[#0052FF] text-[#0052FF]"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            구독자 실시간 요청 접수 대장
          </button>

          <button
            onClick={() => { setActiveTab("consultations_list"); setSearchQuery(""); }}
            className={`px-6 py-3.5 font-bold text-sm tracking-tight flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "consultations_list"
                ? "border-[#0052FF] text-[#0052FF]"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#0052FF]" />
            실시간 간이 견적 상담 신청 대장
          </button>

          <button
            onClick={() => { setActiveTab("portfolios_board"); setSearchQuery(""); }}
            className={`px-6 py-3.5 font-bold text-sm tracking-tight flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "portfolios_board"
                ? "border-[#0052FF] text-[#0052FF]"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Plus className="w-4 h-4 text-[#0052FF]" />
            포트폴리오 게시판 관리 ({portfolios.length})
          </button>
        </div>

        {/* SPREADSHEET TOOL CONTAINER */}
        {activeTab === "users_sheet" && (
          <div className="space-y-6">
            {/* Filter Tools & Actions header block */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
              
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                
                {/* Horizontal Category Pill buttons */}
                <div className="flex flex-wrap items-center gap-1.5 bg-zinc-100 p-1.5 rounded-2xl w-fit">
                  <button
                    onClick={() => setUserTabFilter("all")}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                      userTabFilter === "all" 
                        ? "bg-white text-zinc-900 shadow-sm" 
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    전체 ({users.length})
                  </button>
                  <button
                    onClick={() => setUserTabFilter("admin")}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                      userTabFilter === "admin" 
                        ? "bg-[#0052FF] text-white shadow-sm" 
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    관리자만 ({users.filter(u => u.role === 'admin').length})
                  </button>
                  <button
                    onClick={() => setUserTabFilter("user")}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                      userTabFilter === "user" 
                        ? "bg-white text-zinc-900 shadow-sm" 
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    일반 유저 ({users.filter(u => u.role === 'user').length})
                  </button>
                  <button
                    onClick={() => setUserTabFilter("active")}
                    className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all text-emerald-600 ${
                      userTabFilter === "active" 
                        ? "bg-emerald-50 border border-emerald-200 shadow-sm" 
                        : "text-zinc-500 hover:text-emerald-600"
                    }`}
                  >
                    활성 ({users.filter(u => u.status === 'Active').length})
                  </button>
                  <button
                    onClick={() => setUserTabFilter("suspended")}
                    className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all text-red-600 ${
                      userTabFilter === "suspended" 
                        ? "bg-red-50 border border-red-200 shadow-sm" 
                        : "text-zinc-500 hover:text-red-600"
                    }`}
                  >
                    정지 ({users.filter(u => u.status === 'Suspended').length})
                  </button>
                </div>

                {/* Control Action Tools: Search, Manual Create, Export CSV */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                    <input 
                      type="text"
                      placeholder="이름, 이메일, 메모 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2.5 w-full sm:w-[240px] rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/10 transition-all outline-none bg-zinc-50/50 hover:bg-zinc-50"
                    />
                  </div>

                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2.5 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                    title="명단을 CSV 파일 상태로 다운로드"
                  >
                    <Download className="w-4 h-4" />
                    엑셀 다운로드
                  </button>

                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2.5 bg-[#0052FF] hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10"
                  >
                    <Plus className="w-4 h-4" />
                    신규 회원 등록
                  </button>
                </div>

              </div>

              {/* Floating Batch Control action bar - activated on checkbox select */}
              <AnimatePresence>
                {selectedUserUids.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-4 bg-zinc-900 text-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-zinc-800"
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-[#0052FF] text-white p-1 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-extrabold">
                        선택 행: <span className="text-[#5BA4FF] font-mono">{selectedUserUids.length}행</span> 일괄 관리 도구 활성화
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Batch status */}
                      <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                        <span className="text-[10px] text-zinc-400 px-2 font-bold">계정</span>
                        <button 
                          onClick={() => handleBatchUpdate('status', 'Active')}
                          className="px-2.5 py-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg transition-colors"
                        >
                          활성변경
                        </button>
                        <button 
                          onClick={() => handleBatchUpdate('status', 'Suspended')}
                          className="px-2.5 py-1 text-[11px] font-bold bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg transition-colors"
                        >
                          정지변경
                        </button>
                      </div>

                      {/* Batch premium subscription */}
                      <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                        <span className="text-[10px] text-zinc-400 px-2 font-bold">구독등급</span>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleBatchUpdate('tier', e.target.value);
                              e.target.value = "";
                            }
                          }}
                          className="bg-transparent text-white text-[10px] font-bold outline-none border-none cursor-pointer py-1 px-1.5 focus:ring-0"
                        >
                          <option value="" className="text-black">등급 선택...</option>
                          <option value="Essential" className="text-black">Essential 기본</option>
                          <option value="Premium" className="text-black">Premium 프리미엄</option>
                          <option value="Enterprise" className="text-black">Enterprise 비즈니스</option>
                        </select>
                      </div>

                      {/* Batch role */}
                      <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                        <span className="text-[10px] text-zinc-400 px-2 font-bold">권한</span>
                        <button 
                          onClick={() => handleBatchUpdate('role', 'user')}
                          className="px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded"
                        >
                          User
                        </button>
                        <button 
                          onClick={() => handleBatchUpdate('role', 'admin')}
                          className="px-2 py-0.5 text-[10px] bg-red-950 text-red-300 border border-red-800 hover:bg-red-900 rounded"
                        >
                          Admin
                        </button>
                      </div>

                      {/* Batch clear */}
                      <button 
                        onClick={handleBatchDelete}
                        className="p-1 px-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-transform hover:scale-105 active:scale-95 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> 영구 삭제
                      </button>

                      <button 
                        onClick={() => setSelectedUserUids([])}
                        className="text-zinc-400 hover:text-white text-xs font-bold px-2 py-1"
                      >
                        선택 취소
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SPREADSHEET GRID LAYOUT */}
              {usersLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <div className="w-8 h-8 border-3 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-zinc-500 font-bold">실시간 파이어베이스 스트림 연결 중...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-20 border border-zinc-200/50 rounded-2xl bg-zinc-50 border-dashed text-zinc-400 text-sm">
                  검색 쿼리 또는 필터에 부합하는 가입 자원이 조회되지 않습니다.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-zinc-200/80">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 uppercase font-black font-mono select-none">
                        {/* Checkbox block header */}
                        <th className="py-4 pl-4 w-10 text-center">
                          <input 
                            type="checkbox"
                            checked={filteredUsers.length > 0 && filteredUsers.every(u => selectedUserUids.includes(u.uid))}
                            onChange={handleToggleSelectAll}
                            className="rounded border-zinc-300 text-[#0052FF] focus:ring-[#0052FF] cursor-pointer w-4 h-4"
                          />
                        </th>
                        
                        {/* Interactive column headers */}
                        <th 
                          onClick={() => handleSort("name")}
                          className="py-4 px-3 cursor-pointer hover:bg-zinc-100 transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>가입자 이름</span>
                            {sortColumn === "name" ? (sortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-[#0052FF]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#0052FF]" />) : null}
                          </div>
                        </th>

                        <th 
                          onClick={() => handleSort("email")}
                          className="py-4 px-3 cursor-pointer hover:bg-zinc-100 transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>이메일 주소</span>
                            {sortColumn === "email" ? (sortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-[#0052FF]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#0052FF]" />) : null}
                          </div>
                        </th>

                        <th 
                          onClick={() => handleSort("role")}
                          className="py-4 px-3 cursor-pointer hover:bg-zinc-100 transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>보안 권한</span>
                            {sortColumn === "role" ? (sortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-[#0052FF]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#0052FF]" />) : null}
                          </div>
                        </th>

                        <th 
                          onClick={() => handleSort("tier")}
                          className="py-4 px-3 cursor-pointer hover:bg-zinc-100 transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>정기 구독 등급</span>
                            {sortColumn === "tier" ? (sortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-[#0052FF]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#0052FF]" />) : null}
                          </div>
                        </th>

                        <th 
                          onClick={() => handleSort("status")}
                          className="py-4 px-3 cursor-pointer hover:bg-zinc-100 transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>계정 활성도</span>
                            {sortColumn === "status" ? (sortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-[#0052FF]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#0052FF]" />) : null}
                          </div>
                        </th>

                        <th 
                          onClick={() => handleSort("memo")}
                          className="py-4 px-3 cursor-pointer hover:bg-zinc-100 transition-colors w-48"
                        >
                          <div className="flex items-center gap-1">
                            <span>내부 관리자 메모 (더블클릭 편집)</span>
                            {sortColumn === "memo" ? (sortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-[#0052FF]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#0052FF]" />) : null}
                          </div>
                        </th>

                        <th 
                          onClick={() => handleSort("createdAt")}
                          className="py-4 px-3 cursor-pointer hover:bg-zinc-100 transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>창설 일자</span>
                            {sortColumn === "createdAt" ? (sortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-[#0052FF]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#0052FF]" />) : null}
                          </div>
                        </th>

                        <th className="py-4 pr-4 text-right">계정 삭제</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 text-zinc-700 bg-white">
                      {filteredUsers.map((user) => {
                        const isSelected = selectedUserUids.includes(user.uid);
                        return (
                          <tr 
                            key={user.uid} 
                            className={`hover:bg-blue-50/25 transition-colors group ${
                              isSelected ? 'bg-blue-50/15' : ''
                            }`}
                          >
                            {/* Checkbox cell */}
                            <td className="py-3 px-0 justify-center text-center">
                              <input 
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectUser(user.uid)}
                                className="rounded border-zinc-300 text-[#0052FF] focus:ring-[#0052FF] cursor-pointer w-4 h-4"
                              />
                            </td>

                            {/* USER NAME - text with double click inline editor */}
                            <td className="py-3 px-3 font-bold text-zinc-900 group-hover:text-[#0052FF] transition-colors">
                              {editingCell?.uid === user.uid && editingCell?.field === "name" ? (
                                <div className="flex items-center gap-1">
                                  <input 
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveInlineEdit(user.uid, "name");
                                      if (e.key === 'Escape') setEditingCell(null);
                                    }}
                                    className="p-1 text-xs border border-[#0052FF] rounded outline-none focus:ring-1 focus:ring-[#0052FF] font-bold text-zinc-950 w-full"
                                    autoFocus
                                  />
                                  <button onClick={() => saveInlineEdit(user.uid, "name")} className="text-green-600 hover:bg-green-50 p-1 rounded">
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => setEditingCell(null)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div 
                                  onDoubleClick={() => startEditing(user.uid, "name", user.name)}
                                  className="flex items-center gap-1.5 cursor-pointer"
                                  title="더블클릭하여 수정 가능"
                                >
                                  <span>{user.name}</span>
                                  <Edit2 className="w-3 h-3 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              )}
                            </td>

                            {/* USER EMAIL - with double click inline editor */}
                            <td className="py-3 px-3 font-mono">
                              {editingCell?.uid === user.uid && editingCell?.field === "email" ? (
                                <div className="flex items-center gap-1">
                                  <input 
                                    type="email"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveInlineEdit(user.uid, "email");
                                      if (e.key === 'Escape') setEditingCell(null);
                                    }}
                                    className="p-1 text-xs border border-[#0052FF] rounded outline-none font-mono text-zinc-950 w-full"
                                    autoFocus
                                  />
                                  <button onClick={() => saveInlineEdit(user.uid, "email")} className="text-green-600 p-1 hover:bg-green-50 rounded">
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => setEditingCell(null)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div 
                                  onDoubleClick={() => startEditing(user.uid, "email", user.email)}
                                  className="flex items-center gap-1.5 cursor-pointer text-zinc-500"
                                  title="더블클릭하여 수정 가능"
                                >
                                  <span>{user.email}</span>
                                  <Edit2 className="w-3 h-3 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              )}
                            </td>

                            {/* SECURITY ROLE - dropdown selector inline */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              <select
                                value={user.role}
                                onChange={(e) => updateFieldDirectly(user.uid, "role", e.target.value as any)}
                                className={`px-2 py-1.5 font-bold rounded-lg border-transparent focus:ring-1 cursor-pointer transition-all ${
                                  user.role === 'admin' 
                                    ? "bg-red-50 text-red-700 border-red-200 border" 
                                    : "bg-zinc-100 text-[#0A192F] hover:bg-zinc-200"
                                }`}
                              >
                                <option value="user">User 일반회원</option>
                                <option value="admin">🔐 Admin 관리자</option>
                              </select>
                            </td>

                            {/* SUBSCRIPTION TIER - styled dropdown selector */}
                            <td className="py-3 px-3 min-w-[130px]">
                              <select
                                value={user.tier || "Essential"}
                                onChange={(e) => updateFieldDirectly(user.uid, "tier", e.target.value as any)}
                                className={`px-2.5 py-1.5 font-black rounded-lg border-transparent focus:ring-1 cursor-pointer text-[11px] uppercase transition-all ${
                                  user.tier === 'Enterprise'
                                    ? 'bg-purple-100 text-purple-700 font-extrabold border border-purple-200'
                                    : user.tier === 'Premium'
                                    ? 'bg-indigo-100 text-indigo-700 font-extrabold border border-indigo-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}
                              >
                                <option value="Essential">Essential 기본</option>
                                <option value="Premium">Premium 프리미엄</option>
                                <option value="Enterprise">Enterprise 엔터프라이즈</option>
                              </select>
                            </td>

                            {/* ACCOUNT STATUS - active/suspended toggle selector */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              <select
                                value={user.status || "Active"}
                                onChange={(e) => updateFieldDirectly(user.uid, "status", e.target.value as any)}
                                className={`px-2 py-1.5 font-black text-[11px] rounded-lg border-transparent focus:ring-1 cursor-pointer transition-all ${
                                  user.status === 'Active'
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-amber-50 text-amber-600 border border-amber-200"
                                }`}
                              >
                                <option value="Active">🟢 활성가동 (Active)</option>
                                <option value="Suspended">🔴 정지보류 (Suspended)</option>
                              </select>
                            </td>

                            {/* ADMIN MEMO - edit window */}
                            <td className="py-3 px-3">
                              {editingCell?.uid === user.uid && editingCell?.field === "memo" ? (
                                <div className="flex items-center gap-1">
                                  <textarea 
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="p-1 text-[11px] border border-[#0052FF] rounded outline-none font-sans text-zinc-950 w-full resize-y h-10"
                                    autoFocus
                                  />
                                  <div className="flex flex-col gap-1">
                                    <button onClick={() => saveInlineEdit(user.uid, "memo")} className="text-green-600 p-1 hover:bg-green-50 rounded bg-white border border-green-150">
                                      <Check className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => setEditingCell(null)} className="text-red-500 p-1 hover:bg-red-50 rounded bg-white border border-red-150">
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div 
                                  onDoubleClick={() => startEditing(user.uid, "memo", user.memo || "")}
                                  className="group-hover:bg-zinc-100 p-1.5 rounded-lg max-w-xs break-words font-medium cursor-pointer text-zinc-500 hover:text-zinc-800 text-[11px] flex justify-between items-center"
                                  title="더블클릭하여 메모 기재"
                                >
                                  <span className="truncate max-w-[150px]">
                                    {user.memo ? user.memo : <span className="text-zinc-300 italic">기록 사항 없음</span>}
                                  </span>
                                  <Edit2 className="w-2.5 h-2.5 text-zinc-300 opacity-0 group-hover:opacity-100 inline-block ml-1 flex-shrink-0" />
                                </div>
                              )}
                            </td>

                            {/* CREATED AT */}
                            <td className="py-3 px-3 font-mono text-zinc-400 select-none">
                              {user.createdAt}
                            </td>

                            {/* ROW EXTERMINATOR ACTION BUTTON */}
                            <td className="py-3 pr-4 text-right">
                              <button
                                onClick={() => handleDeleteUser(user.uid, user.name)}
                                className="p-1 px-2.5 text-red-500 hover:bg-red-50 hover:text-red-700 bg-transparent rounded-lg border border-transparent hover:border-red-100 transition-all font-bold inline-flex items-center gap-1 text-[11px]"
                                title="이 회원 영구 삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> 삭제
                              </button>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Grid bottom summary counter info */}
              <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-400 pt-3">
                <span>* 각 행의 <b>가입자 이름, 이메일, 메모 영역</b>을 <b>더블클릭</b>하여 직접 내용을 스프레드시트처럼 실시간 타이핑 편집할 수 있습니다.</span>
                <span className="font-semibold text-zinc-700">전체 {filteredUsers.length}개 행 출력 완료</span>
              </div>

            </div>
          </div>
        )}

        {/* REQUEST TRACKER TAB */}
        {activeTab === "requests_list" && (
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#0A192F]">구독자 실시간 요청 접수 대장</h2>
                <span className="px-3 py-0.5 text-xs font-bold rounded-full bg-zinc-100 text-zinc-500">
                  {filteredRequests.length}건 검색됨
                </span>
              </div>

              {/* Inline query search tools */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                  <input 
                    type="text"
                    placeholder="작성자, 이메일, 내용 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2.5 w-full sm:w-[240px] rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/10 transition-all bg-zinc-50/50 hover:bg-zinc-50 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-2 text-sm bg-zinc-50">
                  <Filter className="w-4 h-4 text-zinc-400" />
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent border-none outline-none text-zinc-600 text-sm font-medium cursor-pointer"
                  >
                    <option value="all">모든 상태 필드</option>
                    <option value="검토중">검토중</option>
                    <option value="진행중">진행중</option>
                    <option value="처리완료">처리완료</option>
                  </select>
                </div>
              </div>
            </div>

            {requestsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 border-3 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
                <p className="text-zinc-500 text-xs">접수 대장 갱신 스트림 연동 채널 활성화 중...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-16 text-zinc-400 text-sm border border-dashed border-zinc-200/60 bg-zinc-50/50 rounded-2xl">
                필터 조건에 수령된 접수 내역이 비어 있습니다.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-200/80">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-500 font-bold bg-zinc-50">
                      <th className="py-3.5 pl-4 w-[20%]">요청 날짜 ｜ 작성자</th>
                      <th className="py-3.5 px-3 w-[55%]">요청 세부 건의 사항</th>
                      <th className="py-3.5 text-center w-[15%]">실시간 진행도</th>
                      <th className="py-3.5 text-right pr-4 w-[10%]">작업 관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 bg-white">
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-blue-50/15 transition-colors group">
                        <td className="py-4 pl-4 font-medium">
                          <div className="flex flex-col">
                            <span className="text-zinc-900 font-bold text-sm">{req.userName}</span>
                            <span className="text-[11px] text-zinc-450 font-mono mt-0.5">{req.userEmail}</span>
                            <span className="text-[10px] text-zinc-400 font-mono mt-1">{req.createdAt}</span>
                          </div>
                        </td>
                        <td className="py-4 px-3 pr-6">
                          <p className="text-zinc-700 font-medium leading-relaxed break-all text-[13px]">
                            {req.text}
                          </p>
                        </td>
                        <td className="py-4 text-center">
                          <button
                            onClick={() => handleUpdateStatus(req.id, req.status)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-transform hover:scale-105 active:scale-95 inline-flex items-center gap-1.5 shadow-sm ${
                              req.status === "처리완료"
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                : req.status === "진행중"
                                ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                                : "bg-amber-50 text-amber-750 hover:bg-amber-100 border border-amber-200"
                            }`}
                            title="클릭하여 상태 단계 순환 (검토중 -> 진행중 -> 처리완료)"
                          >
                            {req.status === "처리완료" && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {req.status === "진행중" && <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />}
                            {req.status === "검토중" && <Clock className="w-3.5 h-3.5" />}
                            <span>{req.status}</span>
                          </button>
                        </td>
                        <td className="py-4 text-right pr-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleUpdateStatus(req.id, req.status)}
                              className="p-1 px-2.5 text-zinc-600 bg-zinc-100 hover:bg-[#0052FF] hover:text-white rounded-lg transition-all text-[11px] font-bold"
                              title="다음 추진 단계 순위 변환"
                            >
                              진행변경
                            </button>
                            <button
                              onClick={() => handleDeleteRequest(req.id)}
                              className="p-1.5 text-zinc-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-all"
                              title="접수 내역 파쇄"
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
        )}

        {/* CONSULTATION LIST TAB CONTAINER */}
        {activeTab === "consultations_list" && (
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#0A192F]">간이 견적 상담 신청 대장</h2>
                <span className="px-3 py-0.5 text-xs font-bold rounded-full bg-zinc-100 text-zinc-500">
                  {filteredConsultations.length}건 신청됨
                </span>
              </div>

              {/* Filtering & Search tools */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                  <input 
                    type="text"
                    placeholder="신청자명, 연락처, 내용 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2.5 w-full sm:w-[240px] rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/10 transition-all bg-zinc-50/50 hover:bg-zinc-50 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-2 text-sm bg-zinc-50">
                  <Filter className="w-4 h-4 text-zinc-400" />
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent border-none outline-none text-zinc-600 text-sm font-medium cursor-pointer"
                  >
                    <option value="all">모든 상담 단계</option>
                    <option value="대기중">대기중</option>
                    <option value="진행중">진행중</option>
                    <option value="상담완료">상담완료</option>
                  </select>
                </div>
              </div>
            </div>

            {consultationsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 border-3 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
                <p className="text-zinc-500 text-xs">상담 신청 목록 동기화 채널 가동 중...</p>
              </div>
            ) : filteredConsultations.length === 0 ? (
              <div className="text-center py-16 text-zinc-400 text-sm border border-dashed border-zinc-200/60 bg-zinc-50/50 rounded-2xl">
                접수된 실시간 간이 견적 상담 신청 내역이 없습니다.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-200/80">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-500 font-bold bg-zinc-50">
                      <th className="py-3.5 pl-4 w-[25%]">상담 신청자 정보</th>
                      <th className="py-3.5 px-3 w-[25%] font-mono">요구 견적 스펙</th>
                      <th className="py-3.5 px-3 w-[15%]">산출 견적 금액</th>
                      <th className="py-3.5 px-3 w-[20%]">추가 건의 사항 및 의견</th>
                      <th className="py-3.5 text-center w-[10%]">상담 진행 상황</th>
                      <th className="py-3.5 text-right pr-4 w-[5%]">관리 작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 bg-white">
                    {filteredConsultations.map((con) => (
                      <tr key={con.id} className="hover:bg-blue-50/15 transition-colors group">
                        <td className="py-4 pl-4 font-medium">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-zinc-900 font-bold text-sm">{con.name}</span>
                              <span className="text-[10px] bg-blue-50 text-[#0052FF] px-1.5 py-0.5 rounded font-extrabold">의뢰신청</span>
                            </div>
                            <span className="text-xs text-zinc-700 font-semibold">📞 {con.contact}</span>
                            <span className="text-[11px] text-zinc-400 font-mono">{con.userEmail || "비로그인 유저"}</span>
                            <span className="text-[10px] text-zinc-405 font-mono">{con.createdAt}</span>
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1">
                              <span className="text-zinc-400">구성 크기:</span>
                              <span className="text-[#0A192F] font-bold">{con.pageSections}개 섹션 구성</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {con.addCopywriting && (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">
                                  전문 가이드 카피
                                </span>
                              )}
                              {con.add3DMockup && (
                                <span className="bg-blue-50 text-blue-700 border border-blue-105 px-2 py-0.5 rounded text-[10px] font-bold">
                                  3D 고화질 Mockup
                                </span>
                              )}
                              {con.fastDelivery && (
                                <span className="bg-amber-50 text-amber-700 border border-amber-105 px-2 py-0.5 rounded text-[10px] font-bold">
                                  ⚡ 긴급 제작 (3일내)
                                </span>
                              )}
                              {!con.addCopywriting && !con.add3DMockup && !con.fastDelivery && (
                                <span className="text-zinc-400 text-[10px]">추가 선택 옵션 없음</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-3 font-semibold">
                          <div className="text-sm font-black text-[#0052FF] font-mono">
                            {con.finalEstimate.toLocaleString()}원
                          </div>
                          <span className="text-[10px] text-zinc-400 font-normal">부가세 별도</span>
                        </td>
                        <td className="py-4 px-3">
                          <div className="max-h-[85px] overflow-y-auto pr-2 scrollbar-thin text-zinc-650 leading-relaxed text-[12px] whitespace-pre-wrap">
                            {con.message || <span className="text-zinc-400 text-xs italic">추가 기재 건의 사항 없음</span>}
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <button
                            onClick={() => handleUpdateConsultationStatus(con.id, con.status)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-transform hover:scale-105 active:scale-95 inline-flex items-center gap-1.5 shadow-sm ${
                              con.status === "상담완료"
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                : con.status === "진행중"
                                ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                                : "bg-amber-50 text-amber-750 hover:bg-amber-100 border border-amber-200"
                            }`}
                            title="클릭하여 상담 단계 순환 (대기중 -> 진행중 -> 상담완료)"
                          >
                            {con.status === "상담완료" && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {con.status === "진행중" && <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />}
                            {con.status === "대기중" && <Clock className="w-3.5 h-3.5" />}
                            <span>{con.status || "대기중"}</span>
                          </button>
                        </td>
                        <td className="py-4 text-right pr-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleUpdateConsultationStatus(con.id, con.status)}
                              className="p-1 px-2.5 text-zinc-600 bg-zinc-100 hover:bg-[#0052FF] hover:text-white rounded-lg transition-all text-[11px] font-bold whitespace-nowrap"
                              title="다음 추진 단계 순위 변환"
                            >
                              진행변경
                            </button>
                            <button
                              onClick={() => handleDeleteConsultation(con.id)}
                              className="p-1.5 text-zinc-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-all"
                              title="견적 상담 서류 영구 파쇄"
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
        )}

        {/* PORTFOLIOS BOARD MANAGER TAB */}
        {activeTab === "portfolios_board" && (
          <div className="space-y-6">
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#0A192F]">포트폴리오 게시판 관리</h2>
                <p className="text-zinc-500 text-xs mt-1">
                  고객들의 제작/구매 욕구를 증진시키는 프리미엄 상세페이지 포트폴리오를 작성하고 실시간 게재합니다.
                </p>
              </div>
              <button
                onClick={() => { resetPortfolioForm(); setShowPortfolioModal(true); }}
                className="px-5 py-2.5 bg-[#0052FF] hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 self-start md:self-auto"
              >
                <Plus className="w-4 h-4" />
                신규 포트폴리오 등록
              </button>
            </div>

            {portfoliosLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-zinc-200 rounded-3xl gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-[#0052FF]" />
                <p className="text-xs text-zinc-500 font-bold">포트폴리오 목록을 불러오는 중...</p>
              </div>
            ) : portfolios.length === 0 ? (
              <div className="text-center py-20 border border-zinc-200/50 rounded-3xl bg-white text-zinc-400 text-sm flex flex-col items-center justify-center gap-4 border-dashed">
                <p className="font-semibold text-zinc-500">게시판에 등록된 포트폴리오가 아직 존재하지 않습니다.</p>
                <p className="text-zinc-400 text-xs max-w-sm -mt-2">
                  관리자 전용 벌크 기능으로 파이어스토어 데이터베이스에 데모용 4종 고효율 견본 상세페이지 데이터를 즉시 런칭할 수 있습니다.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm("기본 내장된 4개의 고효율 포트폴리오 견본 데이터를 데이터베이스에 즉시 생성하고 게재하시겠습니까?")) {
                      try {
                        const { PORTFOLIO_DATA } = await import("../data");
                        for (const item of PORTFOLIO_DATA) {
                          const payload = {
                            title: item.title,
                            category: item.category,
                            client: item.client,
                            beforeRate: item.beforeRate,
                            afterRate: item.afterRate,
                            increase: item.increase,
                            imageUrl: item.imageUrl,
                            tags: item.tags,
                            summary: `${item.title.replace(" 상세페이지", "")}의 핵심 설득 레이아웃 분석 기획 및 최적화 디자인`,
                            description: `본 기획안은 ${item.client}의 프리미엄 상품 소구점을 최대로 끌어올리기 위한 맞춤형 상세페이지 솔루션입니다.\n\n[주요 설계 전략]\n1. 직관적인 소구 포인트 배치와 명확한 카피라이팅 설계\n2. 모바일 퍼스트 반응형 레이아웃 구현\n3. 경쟁 업체 10개 오디트를 통해 우위를 점하는 시각적 인포그래픽 구성\n\n결과적으로 전환율이 기존 ${item.beforeRate}에서 혁신적인 ${item.afterRate}로 크게 도약하였습니다. 본 레이아웃 기획 원본을 즉시 구매 및 소장하셔서 귀사의 매출 시너지로 연동해 보시기 바랍니다.`,
                            price: 350000,
                            originalPrice: 590000,
                            benefit1: "전체 설득 논리 레이아웃 원본 Figma 파일 100% 양도 제공",
                            benefit2: "동업계 기준 고효율 카피라이팅 가이드라인 수록",
                            benefit3: "상업적 수정 및 활용 완전 자유 라이선스 보정 이미지 팩",
                            createdAt: new Date().toISOString()
                          };
                          await addDoc(collection(db, "portfolios"), payload);
                        }
                        triggerToast("샘플 포트폴리오 4건이 완전 탑재 완료되었습니다!", "success");
                      } catch (err) {
                        console.error(err);
                        triggerToast("견본 데이터 생성 도중 데이터베이스 통신 지연 오류 발생.", "error");
                      }
                    }
                  }}
                  className="px-4 py-2.5 bg-[#0A192F] hover:bg-[#0052FF] text-white text-xs font-bold rounded-xl transition-all shadow-md"
                >
                  기본 샘플 데이터 벌크 생성하기
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolios.map((port) => (
                  <div key={port.id} className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="relative h-48 bg-zinc-100 overflow-hidden">
                      <img
                        src={port.imageUrl}
                        alt={port.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-4 left-4 bg-[#0A192F] text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                        {port.category}
                      </span>
                      <span className="absolute bottom-4 right-4 bg-emerald-500 text-white font-black text-xs px-3 py-1.5 rounded-full shadow-md">
                        {port.increase}
                      </span>
                    </div>

                    <div className="p-6 space-y-4 text-left">
                      <div>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{port.client}</p>
                        <h3 className="text-base font-extrabold text-[#0A192F] mt-1 line-clamp-1">{port.title}</h3>
                        <p className="text-zinc-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                          {port.summary || "설정된 소구점 한줄 요약이 없습니다."}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {port.tags.map((tag, i) => (
                          <span key={i} className="text-[10px] font-semibold bg-zinc-50 text-zinc-650 border border-zinc-200 px-2 py-0.5 rounded-md">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                        <div>
                          <p className="text-[10px] text-zinc-400">판매 기획가</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-sm font-black text-[#0052FF]">{port.price?.toLocaleString()}원</span>
                            {port.originalPrice && (
                              <span className="text-[10px] text-zinc-400 line-through">{(port.originalPrice).toLocaleString()}원</span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] text-zinc-400">전환율 증감</p>
                          <p className="text-xs font-black mt-0.5">
                            <span className="text-red-500 text-xs">{port.beforeRate}</span>
                            <span className="text-zinc-400 mx-1">→</span>
                            <span className="text-blue-600 text-sm">{port.afterRate}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-50/50 border-t border-zinc-100 px-6 py-4 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditPortfolio(port)}
                        className="px-3.5 py-2 hover:bg-[#0052FF] hover:text-white text-zinc-700 bg-white border border-zinc-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> 수정
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePortfolio(port.id)}
                        className="px-3.5 py-2 hover:bg-red-50 hover:text-red-650 text-[#0A192F]/60 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> 삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* PORTFOLIO MANAGEMENT CREATION/EDITION MODAL */}
      {showPortfolioModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl border border-zinc-105 relative text-left my-8"
          >
            <div className="bg-[#0A192F] text-white p-6 relative">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <span>{editingPortfolioId ? "포트폴리오 정보 편집" : "새 포트폴리오 등록"}</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                상세페이지 제작 솔루션을 매거진 에디토리얼 형식으로 게시하여 상세페이지의 가치와 구매 전환 의사를 극대화합니다.
              </p>
              <button
                type="button"
                onClick={() => { setShowPortfolioModal(false); resetPortfolioForm(); }}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePortfolio} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">포트폴리오 제목 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 프리미엄 비건 화장품 '아워그린' 런칭 상세페이지"
                    value={portTitle}
                    onChange={(e) => setPortTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-[#0052FF] bg-zinc-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">고객 브랜드명 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 그린코스메틱"
                    value={portClient}
                    onChange={(e) => setPortClient(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-[#0052FF] bg-zinc-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">포트폴리오 카테고리 *</label>
                  <select
                    value={portCategory}
                    onChange={(e) => {
                      setPortCategory(e.target.value);
                      if (!portImageUrl) {
                        if (e.target.value === "푸드") setPortImageUrl("https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80");
                        else if (e.target.value === "뷰티") setPortImageUrl("https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=600&q=80");
                        else if (e.target.value === "테크") setPortImageUrl("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80");
                        else if (e.target.value === "패션") setPortImageUrl("https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=600&q=80");
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-[#0052FF] bg-zinc-50/50"
                  >
                    <option value="테크">테크</option>
                    <option value="뷰티">뷰티</option>
                    <option value="푸드">푸드</option>
                    <option value="패션">패션</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    대표 소구 이미지 (PNG, JPG 파일 업로드 또는 URL) *
                  </label>
                  <div className="space-y-3">
                    {/* File Attachment / Drag-and-Drop Area */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleImageFileProcess(file);
                      }}
                      className={`border-2 border-dashed rounded-2xl p-4 text-center flex flex-col items-center justify-center transition-all ${
                        dragOver
                          ? "border-[#0052FF] bg-blue-50/40"
                          : "border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 hover:bg-zinc-50"
                      }`}
                    >
                      <input
                        type="file"
                        id="portfolio-img-file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageFileProcess(file);
                        }}
                        className="hidden"
                      />
                      
                      {portImageUrl ? (
                        <div className="relative w-full max-w-[180px] h-24 rounded-lg overflow-hidden border border-zinc-200 shadow-sm mx-auto group">
                          <img
                            src={portImageUrl}
                            alt="소구 이미지 프리뷰"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => setPortImageUrl("")}
                            className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity rounded-lg gap-1"
                          >
                            <span className="bg-red-650 px-2.5 py-1 rounded font-bold">이미지 초기화</span>
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="portfolio-img-file"
                          className="cursor-pointer flex flex-col items-center gap-1.5 w-full h-full py-2"
                        >
                          <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0052FF] flex items-center justify-center border border-blue-100">
                            <Upload className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#0052FF]">파일 디자인 업로드</span>
                            <span className="text-zinc-500 text-xs font-normal"> 또는 드래그 앤 드롭</span>
                          </div>
                          <p className="text-[10px] text-zinc-400">PNG, JPG 포맷 지원 (최대 30MB)</p>
                        </label>
                      )}
                    </div>

                    {/* URL Fallback Text Field */}
                    <input
                      type="text"
                      placeholder="또는 이미지의 웹 주소(URL)를 기재해 주세요"
                      value={portImageUrl}
                      onChange={(e) => setPortImageUrl(e.target.value)}
                      className="w-full px-4 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-[#0052FF] bg-zinc-50/50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">개선 전 기존 전환율</label>
                  <input
                    type="text"
                    placeholder="예: 1.1%"
                    value={portBeforeRate}
                    onChange={(e) => setPortBeforeRate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-[#0052FF] bg-zinc-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">개선 후 현재 전환율</label>
                  <input
                    type="text"
                    placeholder="예: 4.5%"
                    value={portAfterRate}
                    onChange={(e) => setPortAfterRate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-[#0052FF] bg-zinc-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">전환율 상승폭 문구</label>
                  <input
                    type="text"
                    placeholder="예: 309% 상승"
                    value={portIncrease}
                    onChange={(e) => setPortIncrease(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-[#0052FF] bg-zinc-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">제시 가격 (판매기획가) *</label>
                  <input
                    type="number"
                    required
                    placeholder="예: 350000"
                    value={portPrice || ""}
                    onChange={(e) => setPortPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-[#0052FF] bg-zinc-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">이전 준거가 (정상정가) *</label>
                  <input
                    type="number"
                    required
                    placeholder="예: 590000"
                    value={portOriginalPrice || ""}
                    onChange={(e) => setPortOriginalPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-[#0052FF] bg-zinc-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">태그 목록 (쉼표로 구분) *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 기획 리뉴얼, 소프트 비주얼, 구매심리 자극"
                  value={portTags}
                  onChange={(e) => setPortTags(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-[#0052FF] bg-zinc-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">소구 요약문 (한줄 리드 카피) *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 단 1개월만에 전환율 300%를 올린 기적의 레이아웃 기획 솔루션 패키지"
                  value={portSummary}
                  onChange={(e) => setPortSummary(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-[#0052FF] bg-zinc-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">설득 스토리텔링 콘텐츠 설계안 (줄바꿈 지원) *</label>
                <textarea
                  required
                  placeholder="소비자가 왜 이 구조에서 사고 싶어졌는지, 어떤 심리학적 기법이 도입되었는지 흥미롭고 상세하게 설명해 주세요."
                  value={portDescription}
                  onChange={(e) => setPortDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#0052FF] resize-none h-32"
                />
              </div>

              <div className="space-y-2.5 border-t border-zinc-100 pt-4">
                <span className="block text-xs font-bold text-zinc-650">이 포트폴리오 런칭 혜택 (구매 유도 3대 요인)</span>
                
                <div>
                  <input
                    type="text"
                    placeholder="혜택 1 예: 기획안의 Figma 원본 100% 영구 양도"
                    value={portBenefit1}
                    onChange={(e) => setPortBenefit1(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="혜택 2 예: 동종업 경쟁 구도 가치가 들어간 카피라이팅 치트시트 동봉"
                    value={portBenefit2}
                    onChange={(e) => setPortBenefit2(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="혜택 3 예: 상업적 마크업과 완전히 보증된 이미지 라이선스 무료 제공"
                    value={portBenefit3}
                    onChange={(e) => setPortBenefit3(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => { setShowPortfolioModal(false); resetPortfolioForm(); }}
                  className="px-4 py-2 text-zinc-550 hover:text-zinc-800 text-xs font-bold"
                >
                  취소하기
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0052FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10"
                >
                  {editingPortfolioId ? "최종 반영 및 갱신하기" : "실시간 게시판 게재 및 게시하기"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* NEW MEMBER SYSTEMATIC REGISTRATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl border border-zinc-100 relative text-left"
          >
            <div className="bg-[#0A192F] text-white p-6 relative">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span>체계적 가입자 신규 등재</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                구독 승인 혹은 오프라인 계약 완료 회원을 명부에 수동 등재합니다.
              </p>
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">가입자 이름 *</label>
                <input 
                  type="text" 
                  required
                  placeholder="예: 홍길동"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#0052FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">인증 이메일 *</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#0052FF] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">보안 역할 등급</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none"
                  >
                    <option value="user">User (일반)</option>
                    <option value="admin">Admin (관리자)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 font-mono">구독 요금제 유형</label>
                  <select
                    value={newUserTier}
                    onChange={(e) => setNewUserTier(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none"
                  >
                    <option value="Essential">Essential 기본</option>
                    <option value="Premium">Premium 프리미엄</option>
                    <option value="Enterprise">Enterprise 기업용</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">활성 등록 등급</label>
                <select
                  value={newUserStatus}
                  onChange={(e) => setNewUserStatus(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none text-emerald-700 bg-emerald-50/50"
                >
                  <option value="Active">🟢 정상 가동 (Active)</option>
                  <option value="Suspended">🔴 제한 보류 (Suspended)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">내부 전용 메모</label>
                <textarea 
                  placeholder="특이사항, 연락처 등 관리용 주석 기록..."
                  value={newUserMemo}
                  onChange={(e) => setNewUserMemo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#0052FF] resize-none h-20"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-zinc-500 hover:text-zinc-800 text-xs font-bold"
                >
                  취소하기
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0052FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10"
                >
                  등재 저장하기
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Floating Toast Notification system */}
      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />
      )}
    </motion.div>
  );
}
