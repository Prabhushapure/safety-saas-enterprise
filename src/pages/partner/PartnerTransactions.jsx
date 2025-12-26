import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PartnerTransactions.css';

const PartnerTransactions = () => {
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
      <div className="partner-transactions-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="partner-transactions-page">
      <div className="partner-transactions-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <Link to="/partner/home" className="back-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5"/>
                <path d="M12 19l-7-7 7-7"/>
              </svg>
              Back 
            </Link>
            <h1>Transactions</h1>
          </div>
        </div>

        {/* Transaction Overview */}
        <div className="transactions-overview">
          <div className="overview-card">
            <h3>Total Transactions</h3>
            <span className="overview-number">0</span>
            <p>All time</p>
          </div>
          <div className="overview-card">
            <h3>This Month</h3>
            <span className="overview-number">$0</span>
            <p>Total spent</p>
          </div>
          <div className="overview-card">
            <h3>Pending</h3>
            <span className="overview-number warning">0</span>
            <p>Awaiting processing</p>
          </div>
        </div>

        {/* Transaction Management */}
        <div className="transactions-content">
          <div className="content-header">
            <h2>Transaction History</h2>
            <div className="header-actions">
              <select className="filter-select">
                <option>All Transactions</option>
                <option>Completed</option>
                <option>Pending</option>
                <option>Failed</option>
              </select>
              <button className="primary-button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export
              </button>
            </div>
          </div>

          <div className="transactions-list">
            <div className="empty-state">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h3>No transactions yet</h3>
              <p>Your transaction history will appear here once you start purchasing licenses and making payments.</p>
              <Link to="/partner/license" className="secondary-button">Browse Licenses</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerTransactions;
