import { Zap, User, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { useAppContext } from "../AppContext";
import { ViewState } from "../types";

export function Header() {
  const { currentView, setCurrentView, authSession, logout } = useAppContext();

  const navItems: { label: string; view: ViewState }[] = [
    { label: '메인 홈', view: 'home' },
    { label: '서비스 안내/견적', view: 'estimate' },
    { label: '포트폴리오', view: 'portfolio' },
  ];

  if (authSession.isLoggedIn) {
    navItems.push({ label: '구독 대시보드', view: 'dashboard' });
    if (authSession.user?.role === 'admin') {
      navItems.push({ label: '관리자 대시보드', view: 'admin_dashboard' });
    }
  }

  return (
    <header className="backdrop-blur-md bg-white/80 sticky top-0 z-50 border-b border-zinc-100/80">
      <div className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
          <Zap className="h-6 w-6 text-[#0052FF]" strokeWidth={2.5} />
          <span className="font-extrabold text-xl tracking-tight text-[#0A192F]">혁신페이지</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`relative text-sm font-medium transition-colors hover:text-[#0052FF] ${
                currentView === item.view ? 'text-[#0052FF]' : 'text-[#0A192F]'
              }`}
            >
              {item.label}
              {currentView === item.view && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#0052FF]"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {!authSession.isLoggedIn ? (
            <button
              onClick={() => setCurrentView('auth')}
              className="text-sm font-semibold bg-[#0A192F] text-white px-5 py-2.5 rounded-full hover:bg-[#0052FF] transition-colors"
            >
              로그인 / 회원가입
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-[#0A192F] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
                  <User className="h-4 w-4 text-[#0A192F]" />
                </div>
                <span className="hidden sm:inline">{authSession.user?.name}님</span>
              </button>
              <button
                onClick={logout}
                className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                title="로그아웃"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
