import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import About from './pages/About';
import Store from './pages/Store';
import Partner from './pages/Partner';
import PartnerLogin from './pages/PartnerLogin';
import PartnerSignup from './pages/PartnerSignup';
import PartnerHome from './pages/PartnerHome';
import PartnerDistribute from './pages/PartnerDistribute';
import PartnerLicense from './pages/PartnerLicense';
import PartnerDashboard from './pages/PartnerDashboard';
import PartnerHelp from './pages/PartnerHelp';
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
            <Route path="/partner/distribute" element={<PartnerDistribute />} />
            <Route path="/partner/license" element={<PartnerLicense />} />
            <Route path="/partner/dashboard" element={<PartnerDashboard />} />
            <Route path="/partner/help" element={<PartnerHelp />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App
