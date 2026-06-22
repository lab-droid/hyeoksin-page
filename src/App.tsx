/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAppContext, AppProvider } from "./AppContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomeView } from "./views/HomeView";
import { ServiceEstimateView } from "./views/ServiceEstimateView";
import { PortfolioView } from "./views/PortfolioView";
import { AuthView } from "./views/AuthView";
import { DashboardView } from "./views/DashboardView";
import { AdminDashboardView } from "./views/AdminDashboardView";

function MainContent() {
  const { currentView } = useAppContext();

  return (
    <main className="flex-grow flex flex-col items-center">
      {currentView === 'home' && <HomeView />}
      {currentView === 'estimate' && <ServiceEstimateView />}
      {currentView === 'portfolio' && <PortfolioView />}
      {currentView === 'auth' && <AuthView />}
      {currentView === 'dashboard' && <DashboardView />}
      {currentView === 'admin_dashboard' && <AdminDashboardView />}
    </main>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div className="w-full min-h-screen bg-[#F8F9FA] text-[#0A192F] font-sans flex flex-col justify-between selection:bg-[#0052FF] selection:text-white">
        <Header />
        <MainContent />
        <Footer />
      </div>
    </AppProvider>
  );
}
