import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { clearEnterpriseSession, getEnterpriseToken, useEnterpriseAuth } from '../../hooks/useEnterpriseAuth';
import '../partner/PartnerHome.css';

const API_BASE_URL = '/GamifiedLearning/api';

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const EnterpriseAdminHome = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { userData, isLoading } = useEnterpriseAuth(['super_admin', 'unit_admin']);
  const [profileError, setProfileError] = useState('');
  const [serverProfile, setServerProfile] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!userData) return;

    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/enterprise/me`, {
          headers: {
            Authorization: `Bearer ${getEnterpriseToken()}`
          }
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          setProfileError(json.message || 'Unable to load enterprise profile');
          return;
        }
        setServerProfile(json.data);
      } catch (error) {
        console.error(error);
        setProfileError('Unable to load enterprise profile');
      }
    };

    loadProfile();
  }, [userData]);

  const handleLogout = () => {
    clearEnterpriseSession();
    navigate(`/e/${slug}/login`);
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
        body: JSON.stringify({
          id: businessPartnerId,
          oldPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPasswordMsg('Password updated successfully!');
        setTimeout(() => {
          clearEnterpriseSession();
          navigate(`/e/${slug}/login`);
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

  if (isLoading || !userData) {
    return (
      <div className="partner-home-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  const profile = serverProfile || userData;
  const base = `/e/${profile?.companySlug || slug}`;

  return (
    <div className="partner-home-page">
      <div className="partner-home-container">
        <div className="partner-header">
          <div className="welcome-section">
            <h1>Welcome back, {profile?.firstName}!</h1>
            <div className="company-info">
              {profile?.companyName}
              {profile?.country ? ` • ${profile.country}` : ''}
            </div>
          </div>
          <div className="header-actions">
            <div className="account-menu">
              <a
                href="#"
                className="menu-item"
                onClick={(e) => {
                  e.preventDefault();
                  setShowPasswordModal(true);
                  setPasswordMsg('');
                }}
              >
                Change Password
              </a>
              <a
                href="#"
                className="menu-item logout"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                Logout
              </a>
            </div>
          </div>
        </div>

        {profileError && <p className="error-message">{profileError}</p>}

        <div className="navigation-grid">
          <Link to={`${base}/employees`} className="nav-card distribute-card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="card-content">
              <h3>Manage Employees</h3>
              <p>Add, edit or deactivate employees</p>
            </div>
            <div className="card-arrow">
              <ArrowIcon />
            </div>
          </Link>

          <Link to={`${base}/catalog`} className="nav-card licenses-card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="M21 15.5c-.3-1.4-1.4-2.5-2.8-2.8" />
                <path d="M15 12c-1.1 0-2.1.4-2.8 1.2" />
              </svg>
            </div>
            <div className="card-content">
              <h3>Game Catalog</h3>
              <p>View the games available to your company</p>
            </div>
            <div className="card-arrow">
              <ArrowIcon />
            </div>
          </Link>

          <Link to={`${base}/reports`} className="nav-card dashboard-card">
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
              <h3>Reports</h3>
              <p>View participation, passes and certificates</p>
            </div>
            <div className="card-arrow">
              <ArrowIcon />
            </div>
          </Link>

          <Link to={`${base}/help`} className="nav-card help-card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="card-content">
              <h3>Help & Support</h3>
              <p>Get help and access support resources</p>
            </div>
            <div className="card-arrow">
              <ArrowIcon />
            </div>
          </Link>
        </div>
      </div>

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2>Change Password</h2>
            <input
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {passwordMsg && <p className="password-msg">{passwordMsg}</p>}
            <div className="modal-actions">
              <button
                className="submit-btn"
                onClick={handlePasswordSubmit}
                disabled={changingPassword}
              >
                {changingPassword ? 'Updating...' : 'Submit'}
              </button>
              <button
                className="close-btn"
                onClick={() => {
                  setShowPasswordModal(false);
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordMsg('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseAdminHome;
