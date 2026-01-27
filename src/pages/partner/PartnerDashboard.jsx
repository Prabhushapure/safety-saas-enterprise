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
              Back 
            </Link>
                         <h1>Business Dashboard</h1>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="metrics-overview">
          {/* Coming Soon */}
<div className="dashboard-coming-soon">
  <div className="coming-soon-card">
    
    <h2>Coming Soon.....</h2>
    <p>
     
    </p>
  </div>
</div>
        </div>
        </div> 
      </div>
  );
};

export default PartnerDashboard;
