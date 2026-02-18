import React from "react";
import { useNavigate } from "react-router-dom";
import "./PortalManagement.css";

const PortalManagement = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("internalUser");
    navigate("/internal/home");
  };

  return (
    <div className="portal-page">
      <div className="portal-container">

        {/* Header */}
        <div className="portal-header">
          <div className="portal-header-content">
            <h1>Portal Management</h1>

          </div>
        </div>

        {/* Cards */}
        <div className="portal-grid">

          {/* Reg Duration */}
          <div className="portal-card portal-card-disabled">
            <div className="portal-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>

            <div className="portal-card-content">
              <h3>Reg Duration</h3>
              <p className="portal-note">Coming Soon</p>
            </div>

            <div className="portal-card-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>

          {/* Token Duration */}
          <div className="portal-card portal-card-disabled">
            <div className="portal-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <path d="M9 9h6v6H9z" />
              </svg>
            </div>

            <div className="portal-card-content">
              <h3>Token Duration</h3>
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

export default PortalManagement;
