import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PartnerDashboard.css';

const PartnerDashboard = () => {
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
      <div className="partner-dashboard-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="partner-dashboard-page">
      <div className="partner-dashboard-container">
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
                         <h1>Metrics Dashboard</h1>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="metrics-overview">
          <div className="metric-card">
            <div className="metric-icon usage">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="metric-content">
              <h3>Total Users</h3>
              <span className="metric-number">0</span>
              <p className="metric-change">No data yet</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon engagement">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div className="metric-content">
              <h3>Game Sessions</h3>
              <span className="metric-number">0</span>
              <p className="metric-change">This month</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon completion">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
            </div>
            <div className="metric-content">
              <h3>Completion Rate</h3>
              <span className="metric-number">0%</span>
              <p className="metric-change">Average</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon performance">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18"/>
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
              </svg>
            </div>
            <div className="metric-content">
              <h3>Performance Score</h3>
              <span className="metric-number">-</span>
              <p className="metric-change">Team average</p>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          <div className="dashboard-grid">
            {/* Usage Chart */}
            <div className="dashboard-card chart-card">
              <div className="card-header">
                <h3>Usage Over Time</h3>
                <select className="time-filter">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 3 months</option>
                </select>
              </div>
              <div className="chart-placeholder">
                <div className="chart-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18"/>
                    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                  </svg>
                  <p>No usage data available yet</p>
                </div>
              </div>
            </div>

            {/* Top Games */}
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Most Popular Games</h3>
              </div>
              <div className="games-list">
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <path d="M9 9h6v6H9z"/>
                    </svg>
                  </div>
                  <p>No game data available</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="dashboard-card activity-card">
              <div className="card-header">
                <h3>Recent Activity</h3>
              </div>
              <div className="activity-list">
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 1v6m0 6v6"/>
                      <path d="M21 12h-6m-6 0H3"/>
                    </svg>
                  </div>
                  <p>No recent activity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;
