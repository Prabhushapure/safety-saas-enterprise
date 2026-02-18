import React from "react";
import "./PortalManagement.css";

const PartnerManagement = () => {
  return (
    <div className="portal-page">
      <div className="portal-container">

        {/* Header */}
        <div className="portal-header">
          <div className="portal-header-content">
            <h1>Partner Management</h1>
          </div>
        </div>

        {/* Cards */}
        <div className="portal-grid">

          {/* Partner Management */}
          <div className="portal-card portal-card-disabled">
            <div className="portal-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            <div className="portal-card-content">
              <h3>Partner Management</h3>
              <p className="portal-note">Coming Soon</p>
            </div>

            <div className="portal-card-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>

          {/* User Management */}
          <div className="portal-card portal-card-disabled">
            <div className="portal-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>

            <div className="portal-card-content">
              <h3>User Management</h3>
              <p className="portal-note">Coming Soon</p>
            </div>

            <div className="portal-card-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="portal-powered-by">
        Powered by{" "}
        <a href="https://antiztech.com/" target="_blank" rel="noopener noreferrer">
          <strong>Antiztech.com</strong>
        </a>
      </div>
    </div>
  );
};

export default PartnerManagement;
