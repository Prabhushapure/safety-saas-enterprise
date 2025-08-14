import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PartnerLicense.css';

const PartnerLicense = () => {
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

  if (!userData) {
    return (
      <div className="partner-license-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="partner-license-page">
      <div className="partner-license-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <Link to="/partner/home" className="back-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5"/>
                <path d="M12 19l-7-7 7-7"/>
              </svg>
              Back to Home
            </Link>
            <h1>License & Distribution</h1>
          </div>
        </div>

        {/* License Overview */}
        <div className="license-overview">
          <div className="overview-card">
            <h3>Active Licenses</h3>
            <span className="overview-number">0</span>
            <p>Currently active</p>
          </div>
          <div className="overview-card">
            <h3>Expiring Soon</h3>
            <span className="overview-number warning">0</span>
            <p>Within 30 days</p>
          </div>
          <div className="overview-card">
            <h3>Total Spent</h3>
            <span className="overview-number">$0</span>
            <p>This year</p>
          </div>
        </div>

        {/* License Management */}
        <div className="license-content">
          <div className="content-header">
            <h2>Your Licenses</h2>
            <button className="primary-button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              Purchase License
            </button>
          </div>

          <div className="license-list">
            <div className="empty-state">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="M21 15.5c-.3-1.4-1.4-2.5-2.8-2.8"/>
                  <path d="M15 12c-1.1 0-2.1.4-2.8 1.2"/>
                </svg>
              </div>
              <h3>No licenses yet</h3>
              <p>Purchase your first game license to get started with distributing safety games to your team.</p>
              <button className="secondary-button">Browse Available Games</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerLicense;
