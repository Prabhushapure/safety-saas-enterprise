import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import InternalNavigation from './components/InternalNavigation';
import Home from './pages/Home';
import About from './pages/About';
import Store from './pages/Store';
import Play from './pages/Play';

import PortalManagement from './pages/internal/PortalManagement';
import CatalogManagement from "./pages/internal/CatalogManagement";
import PartnerManagement from "./pages/internal/PartnerManagement";
import GameManagement from './pages/internal/GameManagement';
import ListManagement from './pages/internal/ListManagement';
import CompanyListManagement from './pages/internal/CompanyListManagement';
import CompanyManagement from './pages/internal/CompanyManagement';
import AntizDashboard from "./pages/internal/AntizDashboard";
import Partners from "./pages/internal/Partners";

import PartnerLogin from './pages/partner/PartnerLogin';
import PartnerSignup from './pages/partner/PartnerSignup';
import PartnerForgotPassword from './pages/partner/PartnerForgotPassword';
import PartnerConfirmPasswordReset from './pages/partner/PartnerConfirmPasswordReset';
import PartnerHome from './pages/partner/PartnerHome';
import PartnerDistribute from './pages/partner/PartnerDistribute';
import PartnerLicense from './pages/partner/PartnerLicense';
import PartnerTransactions from './pages/partner/PartnerTransactions';
import PartnerDashboard from './pages/partner/PartnerDashboard';
import PartnerUserList from './pages/partner/PartnerUserList';
import PartnerTansactions from './pages/partner/PartnerTransactions';
import PartnerHelp from './pages/partner/PartnerHelp';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isPlayPage = location.pathname === '/play';
  const isInternalRoute = location.pathname.startsWith('/internal');
  const isHomePage = location.pathname === '/home';

  return (
    <div className="app">
      {!isPlayPage && (isInternalRoute ? <InternalNavigation /> : <Navigation />)}
      {/* HOME → FULL WIDTH */}
      {isHomePage ? (
        <Home />
      ) : (
        <main className={isPlayPage ? "play-main" : "main-content"}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/store" element={<Store />} />
            <Route path="/play" element={<Play />} />

            <Route path="/partner/login" element={<PartnerLogin />} />
            <Route path="/partner/signup" element={<PartnerSignup />} />
            <Route path="/partner/forgot-password" element={<PartnerForgotPassword />} />
            <Route path="/partner/confirm-password-reset" element={<PartnerConfirmPasswordReset />} />
            <Route path="/partner/home" element={<PartnerHome />} />
            <Route path="/partner/manage-users" element={<PartnerDistribute />} />
            <Route path="/partner/license" element={<PartnerLicense />} />
            <Route path="/partner/transactions" element={<PartnerTransactions />} />
            <Route path="/partner/dashboard" element={<PartnerDashboard />} />
            <Route path="/partner/help" element={<PartnerHelp />} />
            <Route path="/partner/user-lists" element={<PartnerUserList />} />
            <Route path="/partner/transaction-reports" element={<PartnerTransactions />} />

            {/* Internal-only module */}
            <Route path="/internal/home" element={<PortalManagement />} />
            <Route path="/internal/game-management" element={<GameManagement />} />
            <Route path="/internal/list-management" element={<ListManagement />} />
            <Route path="/internal/company-list-management" element={<CompanyListManagement />} />
            <Route path="/internal/company-management" element={<CompanyManagement />} />
            <Route path="/internal/catalog-management" element={<CatalogManagement />} />
            <Route path="/internal/partner-management" element={<PartnerManagement />} />
            <Route path="/internal/partners" element={<Partners />} />
            <Route path="/internal/antiz-dashboard" element={<AntizDashboard />} />
          </Routes>
        </main>
      )}
    </div>
  );
}

function App() {
  return (
    <Router basename="/GamifiedLearning">
      <AppContent />
    </Router>
  );
}

export default App
