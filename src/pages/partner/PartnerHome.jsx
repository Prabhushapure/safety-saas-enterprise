import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PartnerHome.css';

const PartnerHome = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('partnerUser');
    if (!storedUser) {
      navigate('/partner/login');
      return;
    }
    
    try {
      const user = JSON.parse(storedUser);
      setUserData(user);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/partner/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('partnerUser');
    navigate('/partner/login');
  };

  if (!userData) {
    return (
      <div className="partner-home-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="partner-home-page">
      <div className="partner-home-container">
        {/* Header */}
        <div className="partner-header">
          <div className="welcome-section">
            <h1>Welcome back, {userData.firstName}!</h1>
            <p className="company-info">
              {userData.companyName} • {userData.city}, {userData.country}
            </p>
          </div>
          <div className="header-actions">
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="navigation-grid">
          <Link to="/partner/license" className="nav-card licenses-card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="M21 15.5c-.3-1.4-1.4-2.5-2.8-2.8"/>
                <path d="M15 12c-1.1 0-2.1.4-2.8 1.2"/>
              </svg>
            </div>
            <div className="card-content">
              <h3>Licenses</h3>
              <p>Manage your game licenses and subscriptions</p>
            </div>
            <div className="card-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </Link>

          <Link to="/partner/distribute" className="nav-card distribute-card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <div className="card-content">
              <h3>Distribute</h3>
              <p>Distribute games to your users and teams</p>
            </div>
            <div className="card-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </Link>

          <Link to="/partner/dashboard" className="nav-card dashboard-card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <path d="M9 9h6v6H9z"/>
                <path d="M9 3v6"/>
                <path d="M15 3v6"/>
                <path d="M9 15v6"/>
                <path d="M15 15v6"/>
                <path d="M3 9h6"/>
                <path d="M15 9h6"/>
                <path d="M3 15h6"/>
                <path d="M15 15h6"/>
              </svg>
            </div>
            <div className="card-content">
              <h3>Metrics Dashboard</h3>
              <p>View analytics and performance metrics</p>
            </div>
            <div className="card-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </Link>

          <Link to="/partner/transactions" className="nav-card transactions-card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div className="card-content">
              <h3>Transactions</h3>
              <p>View your payment history and invoices</p>
            </div>
            <div className="card-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </Link>

          <Link to="/partner/help" className="nav-card help-card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div className="card-content">
              <h3>Help & Support</h3>
              <p>Get help and access support resources</p>
            </div>
            <div className="card-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-card">
            <h4>Active Licenses</h4>
            <span className="stat-number">-</span>
          </div>
          <div className="stat-card">
            <h4>Games Distributed</h4>
            <span className="stat-number">-</span>
          </div>
          <div className="stat-card">
            <h4>Total Users</h4>
            <span className="stat-number">-</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerHome;
