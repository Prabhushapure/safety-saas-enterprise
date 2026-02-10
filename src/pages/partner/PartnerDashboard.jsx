import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePartnerAuth } from '../../hooks/usePartnerAuth';
import './PartnerDashboard.css';

const API_BASE_URL = '/AWE-SaaS/api';

const PartnerDashboard = () => {
  const { userData, isLoading } = usePartnerAuth();

  const [showDashboardIframe, setShowDashboardIframe] = useState(false);
  const [dashboardIframeUrl, setDashboardIframeUrl] = useState("");
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  const handleOpenPartnerBusinessDashboard = async () => {
    try {
      setLoadingDashboard(true);

      const response = await fetch(`${API_BASE_URL}/auth/corent-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Unable to create dashboard session");
        return;
      }

      let tenantName = userData?.tenantName;

      if (!tenantName) {
        tenantName = (userData?.companyName || "")
          .toLowerCase()
          .replace(/\s+/g, "")
          .replace(/[^a-z0-9]/g, "");
      }

      if (!tenantName) {
        alert("Tenant name missing. Please contact support.");
        return;
      }

      const safeTenantName = encodeURIComponent(tenantName);

      const dashboardUrl =
        `https://saasifynow.com/surpaas/r/awssaasopsprovider/h/antiz/t/${safeTenantName}` +
        `?token=${data.sessionId}&view=dashboard`;

      setDashboardIframeUrl(dashboardUrl);
      setShowDashboardIframe(true);

    } catch (err) {
      console.error("Dashboard iframe error:", err);
      alert("Network error while opening dashboard");
    } finally {
      setLoadingDashboard(false);
    }
  };

  if (isLoading || !userData) {
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
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <h1>Business Dashboard</h1>
          </div>
        </div>

        {/* ✅ Same Card Structure */}
        <div className="navigation-grid">

          

          {/* Coming Soon Card */}
          <div className="nav-card disabled-card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>

            <div className="card-content">
              <h3>User Lists</h3>
              
              <p className="trial-note">Coming Soon</p>
            </div>

            <div className="card-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>

          <div className="nav-card disabled-card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>

            <div className="card-content">
              <h3>Transaction Reports</h3>
              
              <p className="trial-note">Coming Soon</p>
            </div>

            <div className="card-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>

          <div className="nav-card disabled-card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>

            <div className="card-content">
              <h3>Utilization Reports</h3>
              
              <p className="trial-note">Coming Soon</p>
            </div>

            <div className="card-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>

          {/* Partner Business Dashboard Card */}
          <div
            className="nav-card dashboard-card"
            onClick={() => {
              if (loadingDashboard) return;
              handleOpenPartnerBusinessDashboard();
            }}
          >
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <path d="M9 9h6v6H9z" />
                <path d="M9 3v6" />
                <path d="M15 3v6" />
                <path d="M9 15v6" />
                <path d="M15 15v6" />
                <path d="M3 9h6" />
                <path d="M15 9h6" />
                <path d="M3 15h6" />
                <path d="M15 15h6" />
              </svg>
            </div>

            <div className="card-content">
              <h3>Business Analytics</h3>
              <p>View your business analytics</p>

              {loadingDashboard && (
                <p className="trial-note">Opening dashboard...</p>
              )}
            </div>

            <div className="card-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>

        </div>
      </div>

      {/* Dashboard iframe modal */}
      {showDashboardIframe && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ width: "95%", height: "95%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>Partner Business Dashboard</h2>

              <button
                className="close-btn"
                onClick={() => {
                  setShowDashboardIframe(false);
                  setDashboardIframeUrl("");
                }}
              >
                Close
              </button>
            </div>

            <div style={{ marginTop: "12px", height: "88%" }}>
              <iframe
                src={dashboardIframeUrl}
                title="Partner Business Dashboard"
                width="100%"
                height="100%"
                style={{ border: "none", borderRadius: "12px" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Powered By */}
      <div className="powered-by">
        Powered by{" "}
        <a
          href="https://antiztech.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <strong>Antiztech.com</strong>
        </a>
      </div>
    </div>
  );
};

export default PartnerDashboard;
