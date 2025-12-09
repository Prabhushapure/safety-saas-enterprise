import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import InternalNavigation from './components/InternalNavigation';
import Home from './pages/Home';
import About from './pages/About';
import Store from './pages/Store';
import Play from './pages/Play';

import InternalHome from './pages/internal/InternalHome';
import GameManagement from './pages/internal/GameManagement';

import PartnerLogin from './pages/partner/PartnerLogin';
import PartnerSignup from './pages/partner/PartnerSignup';
import PartnerForgotPassword from './pages/partner/PartnerForgotPassword';
import PartnerConfirmPasswordReset from './pages/partner/PartnerConfirmPasswordReset';
import PartnerHome from './pages/partner/PartnerHome';
import PartnerDistribute from './pages/partner/PartnerDistribute';
import PartnerLicense from './pages/partner/PartnerLicense';
import PartnerTransactions from './pages/partner/PartnerTransactions';
import PartnerDashboard from './pages/partner/PartnerDashboard';
import PartnerHelp from './pages/partner/PartnerHelp';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isPlayPage = location.pathname === '/play';
  const isInternalRoute = location.pathname.startsWith('/internal');

  return (
    <div className="app">
      {!isPlayPage && (isInternalRoute ? <InternalNavigation /> : <Navigation />)}
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

          {/* Internal-only module */}
          <Route path="/internal/home" element={<InternalHome />} />
          <Route path="/internal/game-management" element={<GameManagement />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router basename="/AWE-SaaS">
       <AppContent />
    </Router>
  );
}

export default App
