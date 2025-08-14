import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PartnerDistribute.css';

const PartnerDistribute = () => {
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
      <div className="partner-distribute-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="partner-distribute-page">
      <div className="distribute-container">
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
            <h1>User Management</h1>
          </div>
        </div>

        {/* User Overview */}
        <div className="user-overview">
          <div className="overview-card">
            <h3>Total Users</h3>
            <span className="overview-number">0</span>
            <p>Active accounts</p>
          </div>
          <div className="overview-card">
            <h3>Active This Week</h3>
            <span className="overview-number">0</span>
            <p>Users with activity</p>
          </div>
          <div className="overview-card">
            <h3>New Users</h3>
            <span className="overview-number">0</span>
            <p>This month</p>
          </div>
        </div>

        {/* User Management */}
        <div className="user-content">
          <div className="content-header">
            <h2>Manage Users</h2>
            <button className="primary-button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Add User
            </button>
          </div>

          <div className="user-list">
            <div className="empty-state">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3>No users yet</h3>
              <p>Add users to your organization to start managing access to safety games and tracking their progress.</p>
              <button className="secondary-button">Invite Users</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDistribute;
