import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePartnerAuth } from '../../hooks/usePartnerAuth';
import './PartnerDashboard.css';

const API_BASE_URL = '/AWE-SaaS/api';

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const { userData, isLoading } = usePartnerAuth();

  const [showDashboardIframe, setShowDashboardIframe] = useState(false);
  const [dashboardIframeUrl, setDashboardIframeUrl] = useState("");
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  const handleOpenPartnerBusinessDashboard = async () => {
    try {
      setLoadingDashboard(true);

      // 1) Generate new session
      const response = await fetch(`${API_BASE_URL}/auth/corent-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Unable to create dashboard session");
        return;
      }

      // 2) tenant name
      let tenantName = userData?.tenantName;

      // fallback: sanitize companyName
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

      // 3) Build dashboard URL
      const dashboardUrl =
        `https://saasifynow.com/surpaas/r/awssaasopsprovider/h/antiz/t/${safeTenantName}` +
        `?token=${data.sessionId}&view=dashboard`;

      // 4) Open iframe modal
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

        {/* Coming Soon */}
        <div className="metrics-overview">
          <div className="dashboard-coming-soon">
            <div className="coming-soon-card">
              <h2>Coming Soon.....</h2>

              <button
                className="open-dashboard-btn"
                onClick={handleOpenPartnerBusinessDashboard}
                disabled={loadingDashboard}
              >
                {loadingDashboard ? "Opening..." : "Partner Business Dashboard"}
              </button>

            </div>
          </div>
        </div>

      </div>

      {/* ✅ Dashboard iframe modal */}
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

    </div>
  );
};

export default PartnerDashboard;
