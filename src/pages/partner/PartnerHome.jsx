import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePartnerAuth, clearLoginTimestamp } from '../../hooks/usePartnerAuth';
import './PartnerHome.css';

const API_BASE_URL = '/AWE-SaaS/api';

const PartnerHome = () => {
  const navigate = useNavigate();
  const { userData, isLoading } = usePartnerAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const isTrialPlan = userData?.subscription_plan_id === 'Trail Plan';

  const handleLogout = () => {
    localStorage.removeItem('partnerUser');
    clearLoginTimestamp();
    navigate('/partner/login');
  };

  const handlePasswordSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordMsg('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg('New password and confirmation do not match');
      return;
    }
    setPasswordMsg('');
    setChangingPassword(true);
    const businessPartnerId = userData.businessPartnerId || userData.id;
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: businessPartnerId, oldPassword, newPassword }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setPasswordMsg('Password updated successfully!');
        setTimeout(() => {
          localStorage.removeItem('partnerUser');
          clearLoginTimestamp();
          navigate('/partner/login');
        }, 1200);
      } else {
        setPasswordMsg(data.message || 'Password update failed');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordMsg('Network error, please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleUpgradePlan = async () => {
    try {
      setIsUpgrading(true);
      const partnerId = userData.id || userData.businessPartnerId;
      const response = await fetch(`${API_BASE_URL}/auth/upgrade-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        alert(data.message || 'Plan upgraded successfully');
        const updatedUser = { ...userData, subscription_plan_id: data.newPlan || 'Partner Plan' };
        localStorage.setItem('partnerUser', JSON.stringify(updatedUser));
        setShowUpgradeConfirm(false);
        window.location.reload();
      } else {
        alert(data.message || 'Upgrade failed');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Network error while upgrading plan');
    } finally {
      setIsUpgrading(false);
    }
  };

  if (isLoading || !userData) {
    return (
      <div className="ph-loading">
        <div className="ph-spinner" />
      </div>
    );
  }

  const navCards = [
    {
      to: isTrialPlan ? null : '/partner/manage-users',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: 'Manage Users',
      desc: 'Add, edit, or delete your trainee list',
      color: '#10b981',
      disabled: isTrialPlan,
    },
    {
      to: '/partner/license',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8" />
          <path d="M12 17v4" />
        </svg>
      ),
      title: 'Select & Distribute',
      desc: 'Pick a game and send tokens to your trainees via email',
      color: '#3b82f6',
    },
    {
      to: '/partner/dashboard',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 20V10" />
          <path d="M12 20V4" />
          <path d="M6 20v-6" />
        </svg>
      ),
      title: 'Business Dashboard',
      desc: 'View transactions and analytics',
      color: '#f59e0b',
    },
    {
      to: '/partner/help',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      title: 'Help & Support',
      desc: 'Get help and access support resources',
      color: '#8b5cf6',
    },
  ];

  return (
    <div className="ph-page">
      <div className="ph-container">
        {/* Header */}
        <div className="ph-header">
          <div className="ph-header-left">
            <h1>Welcome back, {userData.firstName}!</h1>
            <div className="ph-meta">
              <span>{userData.companyName}</span>
              <span className="ph-dot" />
              <span>{userData.country}</span>
              <span className="ph-dot" />
              <span className="ph-plan-badge">
                {userData.subscription_plan_id}
              </span>
              {isTrialPlan && (
                <button
                  className="ph-upgrade-btn"
                  onClick={() => setShowUpgradeConfirm(true)}
                >
                  Upgrade Plan
                </button>
              )}
            </div>
          </div>
          <div className="ph-header-right">
            <button
              className="ph-action-btn"
              onClick={() => {
                setShowPasswordModal(true);
                setPasswordMsg('');
              }}
            >
              Change Password
            </button>
            <button className="ph-action-btn ph-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* Nav Cards */}
        <div className="ph-grid">
          {navCards.map((card) => {
            const Tag = card.to && !card.disabled ? Link : 'div';
            const props = card.to && !card.disabled ? { to: card.to } : {};
            return (
              <Tag
                key={card.title}
                className={`ph-card${card.disabled ? ' ph-card-disabled' : ''}`}
                style={{ '--card-color': card.color, '--card-color-light': `${card.color}18`, '--card-color-glow': `${card.color}30` }}
                {...props}
                onClick={
                  card.disabled
                    ? undefined
                    : !card.to
                    ? () => navigate(card.to)
                    : undefined
                }
              >
                <div className="ph-card-accent" />
                <div className="ph-card-orb" />
                <div className="ph-card-content">
                  <div className="ph-card-icon">
                    {card.icon}
                  </div>
                  <div className="ph-card-body">
                    <h3>{card.title}</h3>
                    <p>{card.desc}</p>
                    {card.disabled && (
                      <span className="ph-card-lock">Upgrade plan to unlock</span>
                    )}
                  </div>
                  <div className="ph-card-cta">
                    <span>Open</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Tag>
            );
          })}
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="ph-modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="ph-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Change Password</h2>
            <div className="ph-modal-fields">
              <input type="password" placeholder="Current password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
              <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            {passwordMsg && <p className="ph-modal-msg">{passwordMsg}</p>}
            <div className="ph-modal-actions">
              <button className="ph-modal-submit" onClick={handlePasswordSubmit} disabled={changingPassword}>
                {changingPassword ? 'Updating...' : 'Update Password'}
              </button>
              <button className="ph-modal-cancel" onClick={() => { setShowPasswordModal(false); setOldPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordMsg(''); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Confirm Modal */}
      {showUpgradeConfirm && (
        <div className="ph-modal-overlay" onClick={() => setShowUpgradeConfirm(false)}>
          <div className="ph-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Upgrade to Partner Plan</h2>
            <p style={{ marginBottom: 'var(--space-3)' }}>
              You are about to convert from <strong>Trial Plan</strong> to <strong>Partner Plan</strong>.
            </p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
              Billing will start based on usage. Do you want to continue?
            </p>
            <div className="ph-modal-actions">
              <button className="ph-modal-submit" onClick={handleUpgradePlan} disabled={isUpgrading}>
                {isUpgrading ? 'Upgrading...' : 'Yes, Upgrade'}
              </button>
              <button className="ph-modal-cancel" onClick={() => setShowUpgradeConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrading spinner */}
      {isUpgrading && (
        <div className="ph-modal-overlay">
          <div className="ph-modal" style={{ textAlign: 'center' }}>
            <h2>Upgrading Plan...</h2>
            <p>Please wait, this may take a moment.</p>
            <div className="ph-spinner" style={{ margin: 'var(--space-6) auto' }} />
          </div>
        </div>
      )}

      <footer className="site-footer">
        <p>Powered by <a href="https://antiztech.com" target="_blank" rel="noopener noreferrer">Antiz Technologies</a></p>
      </footer>
    </div>
  );
};

export default PartnerHome;
