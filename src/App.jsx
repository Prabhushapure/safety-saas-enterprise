import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import About from './pages/About';
import Store from './pages/Store';
import Partner from './pages/partner/Partner';
import PartnerLogin from './pages/partner/PartnerLogin';
import PartnerSignup from './pages/partner/PartnerSignup';
import PartnerHome from './pages/partner/PartnerHome';
import PartnerDistribute from './pages/partner/PartnerDistribute';
import PartnerLicense from './pages/partner/PartnerLicense';
import PartnerTransactions from './pages/partner/PartnerTransactions';
import PartnerDashboard from './pages/partner/PartnerDashboard';
import PartnerHelp from './pages/partner/PartnerHelp';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/store" element={<Store />} />
            <Route path="/partner" element={<Partner />} />
            <Route path="/partner/login" element={<PartnerLogin />} />
            <Route path="/partner/signup" element={<PartnerSignup />} />
            <Route path="/partner/home" element={<PartnerHome />} />
            <Route path="/partner/manage-users" element={<PartnerDistribute />} />
            <Route path="/partner/license" element={<PartnerLicense />} />
            <Route path="/partner/transactions" element={<PartnerTransactions />} />
            <Route path="/partner/dashboard" element={<PartnerDashboard />} />
            <Route path="/partner/help" element={<PartnerHelp />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App
