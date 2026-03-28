import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePartnerAuth } from '../../hooks/usePartnerAuth';
import './PartnerShared.css';

const API_BASE_URL = '/AWE-SaaS/api';

const PartnerDashboard = () => {
  const { userData, isLoading } = usePartnerAuth();
  const [showDashboardIframe, setShowDashboardIframe] = useState(false);
  const [dashboardIframeUrl, setDashboardIframeUrl] = useState('');
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  const handleOpenPartnerBusinessDashboard = async () => {
    try {
      setLoadingDashboard(true);
      const response = await fetch(`${API_BASE_URL}/auth/corent-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.message || 'Unable to create dashboard session');
        return;
      }
      let tenantName = userData?.tenantName;
      if (!tenantName) {
        tenantName = (userData?.companyName || '').toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
      }
      if (!tenantName) { alert('Tenant name missing.'); return; }
      const safeTenantName = encodeURIComponent(tenantName);
      const dashboardUrl = `https://saasifynow.com/surpaas/r/awssaasopsprovider/h/antiz/t/${safeTenantName}?token=${data.sessionId}&view=dashboard`;
      setDashboardIframeUrl(dashboardUrl);
      setShowDashboardIframe(true);
    } catch (err) {
      console.error('Dashboard iframe error:', err);
      alert('Network error while opening dashboard');
    } finally {
      setLoadingDashboard(false);
    }
  };

  if (isLoading || !userData) {
    return <div className="ps-loading"><div className="ps-spinner" /></div>;
  }

  return (
    <div className="partner-subpage">
      <div className="partner-subpage-inner">
        <div className="ps-header">
          <div className="ps-header-left">
            <Link to="/partner/home" className="ps-back-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
              Back
            </Link>
            <h1 className="ps-title">Business Dashboard</h1>
          </div>
        </div>

        <div className="ph-grid" style={{ marginBottom: 'auto' }}>
          {/* Reports Card */}
          <div className="ph-card" style={{ cursor: 'default' }}>
            <div className="ph-card-icon" style={{ backgroundColor: '#3b82f614', color: '#3b82f6' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /><path d="M15 3v18" />
              </svg>
            </div>
            <div className="ph-card-body">
              <h3>Reports & Queries</h3>
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <Link to="/partner/transaction-reports" className="ps-btn ps-btn-secondary ps-btn-sm">User Summary</Link>
                <Link to="/partner/user-lists" className="ps-btn ps-btn-secondary ps-btn-sm">Transactions</Link>
              </div>
            </div>
          </div>

          {/* Analytics Card */}
          <div className="ph-card" onClick={() => { if (!loadingDashboard) handleOpenPartnerBusinessDashboard(); }} style={{ cursor: 'pointer' }}>
            <div className="ph-card-icon" style={{ backgroundColor: '#f59e0b14', color: '#f59e0b' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
              </svg>
            </div>
            <div className="ph-card-body">
              <h3>Business Analytics</h3>
              <p>{loadingDashboard ? 'Opening dashboard...' : 'View your business analytics'}</p>
            </div>
            <svg className="ph-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </div>
        </div>
      </div>

      {showDashboardIframe && (
        <div className="ps-modal-overlay">
          <div style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', width: '95%', height: '95%', display: 'flex', flexDirection: 'column', padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Partner Business Dashboard</h2>
              <button className="ps-btn ps-btn-secondary" onClick={() => { setShowDashboardIframe(false); setDashboardIframeUrl(''); }}>Close</button>
            </div>
            <iframe src={dashboardIframeUrl} title="Partner Business Dashboard" style={{ flex: 1, border: 'none', borderRadius: 'var(--radius-lg)' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerDashboard;
