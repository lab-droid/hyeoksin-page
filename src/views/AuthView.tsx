import React, { useState } from "react";
import { motion } from "motion/react";
import { useAppContext } from "../AppContext";
import { Zap } from "lucide-react";
import { Toast } from "../components/Toast";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase";

export function AuthView() {
  const { signInWithEmail, signUpWithEmail, setAuthSession, setCurrentView } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
        showToast("성공적으로 로그인되었습니다.", "success");
      } else {
        await signUpWithEmail(email, password, name);
        showToast("회원가입이 완료되었습니다. 환영합니다!", "success");
      }
    } catch (error: any) {
      console.error(error);
      let errorMsg = "인증 중 오류가 발생했습니다.";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        errorMsg = "이메일 또는 비밀번호가 일치하지 않습니다.";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMsg = "이미 존재하는 이메일 주소입니다.";
      } else if (error.code === 'auth/weak-password') {
        errorMsg = "비밀번호는 6자리 이상이어야 합니다.";
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = "올바른 이메일 형식이 아닙니다.";
      }
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (providerName: string) => {
    if (providerName !== "Google") return;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showToast("Google 계정으로 성공적으로 로그인되었습니다.", "success");
    } catch (error: any) {
      console.error("Google login error:", error);
      if (error.code === 'auth/popup-blocked') {
        showToast("팝업 창이 차단되었습니다. 브라우저 설정을 확인해주세요.", "error");
      } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        showToast("iframe 미리보기 환경에서는 팝업 로그인이 차단될 수 있습니다. 우측 상단 '새 탭에서 열기'를 클릭한 뒤 다시 시도하거나, 이메일로 가입해주세요.", "error");
      } else {
        showToast(`Google 로그인 오류: ${error.message} (코드: ${error.code}). 미리보기 환경 문제일 경우 '새 탭에서 열기'를 이용해주세요.`, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col w-full px-6 py-12 md:py-24 min-h-[calc(100vh-80px-100px)] items-center justify-center bg-zinc-50"
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-zinc-100 p-8 md:p-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-[#0052FF]" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0A192F] mb-2 tracking-tight">
            {isLogin ? '혁신페이지 로그인' : '혁신 멤버십 가입'}
          </h1>
          <p className="text-zinc-500 text-sm/relaxed text-center">
            {isLogin ? '구독 대시보드 접근을 위해 로그인해주세요.' : '회원가입 후 구독 매니저를 할당받으세요.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">이름</label>
              <input 
                type="text" 
                required 
                value={name}
                disabled={loading}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all bg-zinc-50 focus:bg-white disabled:opacity-50"
                placeholder="홍길동"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">이메일 주소</label>
            <input 
              type="email" 
              required 
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all bg-zinc-50 focus:bg-white disabled:opacity-50"
              placeholder="name@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">비밀번호</label>
            <input 
              type="password" 
              required 
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all bg-zinc-50 focus:bg-white disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#0A192F] hover:bg-[#0052FF] text-white font-bold py-3.5 rounded-xl transition-colors mt-2 disabled:opacity-75 flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                처리 중...
              </span>
            ) : (
              isLogin ? '로그인' : '계정 생성하기'
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center mt-8 mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200"></div>
          </div>
          <span className="bg-white px-4 text-xs font-medium text-zinc-400 relative">소셜 계정으로 계속하기</span>
        </div>

        <div className="space-y-3">
          <button 
            type="button" 
            disabled={loading}
            onClick={() => handleSocialLogin("Google")} 
            className="w-full bg-white hover:bg-zinc-50 text-zinc-700 font-bold py-3.5 rounded-xl border border-zinc-200 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 shadow-sm"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Google로 {isLogin ? '로그인' : '시작하기'}
          </button>
        </div>

        <div className="mt-8 text-center text-sm">
          <span className="text-zinc-500">{isLogin ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}</span>
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="ml-2 font-bold text-[#0052FF] hover:underline"
          >
            {isLogin ? '무료로 가입하기' : '로그인하기'}
          </button>
        </div>
      </div>
      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />
      )}
    </motion.div>
  );
}
