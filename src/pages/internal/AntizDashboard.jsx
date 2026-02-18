import React from "react";
import "./PortalManagement.css";

const AntizDashboard = () => {
  return (
    <div className="portal-page">
      <div className="portal-container">

        {/* Header */}
        <div className="portal-header">
          <div className="portal-header-content">
            <h1>Antiz Dashboard</h1>
          </div>
        </div>

        {/* Cards */}
        <div className="portal-grid">

          {/* Business Dashboard */}
          <div className="portal-card portal-card-disabled">
            <div className="portal-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <path d="M8 17V12" />
                <path d="M12 17V7" />
                <path d="M16 17V10" />
              </svg>
            </div>

            <div className="portal-card-content">
              <h3>Business Dashboard</h3>
              <p className="portal-note">Coming Soon</p>
            </div>

            <div className="portal-card-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>

          {/* Reports */}
          <div className="portal-card portal-card-disabled">
            <div className="portal-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M8 13h8" />
                <path d="M8 17h8" />
                <path d="M8 9h2" />
              </svg>
            </div>

            <div className="portal-card-content">
              <h3>Reports</h3>
              <p className="portal-note">Coming Soon</p>
            </div>

            <div className="portal-card-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>

          {/* Tech Docs */}
          <div className="portal-card portal-card-disabled">
            <div className="portal-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <path d="M8 7h8" />
                <path d="M8 11h8" />
                <path d="M8 15h6" />
              </svg>
            </div>

            <div className="portal-card-content">
              <h3>Tech Docs</h3>
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

export default AntizDashboard;
