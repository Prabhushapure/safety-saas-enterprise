import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PartnerHome.css';

const API_BASE_URL = '/AWE-SaaS/api';

const PartnerHome = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const isTrialPlan = userData?.subscription_plan_id === 'Trail Plan';


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

  const handleLogout = () => {
    localStorage.removeItem('partnerUser');
    navigate('/partner/login');
  };

  const handlePasswordSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordMsg("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg("New password and confirmation do not match");
      return;
    }

    setPasswordMsg("");
    setChangingPassword(true);

    const businessPartnerId = userData.businessPartnerId || userData.id;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: businessPartnerId,
          oldPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPasswordMsg("Password updated successfully!");
        setTimeout(() => {
          // Redirect to login after success
          localStorage.removeItem('partnerUser');
          navigate('/partner/login');
        }, 1200);
      } else {
        setPasswordMsg(data.message || "Password update failed");
      }

    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordMsg("Network error, please try again.");
    } finally {
      setChangingPassword(false);
    }
  };




  if (!userData) {
    return (
      <div className="partner-home-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="partner-home-page">
      <div className="partner-home-container">
        {/* Header */}
        <div className="partner-header">
          <div className="welcome-section">
            <h1>Welcome back, {userData.firstName}!</h1>
            <div className="company-info">
  {userData.companyName} • {userData.city}, {userData.country} •

  {/* Subscription plan hover */}
  <div className="plan-wrapper">
    <span className="plan-badge">
      {userData.subscription_plan_id}
    </span>

    <div className="plan-popup">
      {userData.subscription_plan_id === "Trail Plan" && (
        <div className="plan-card trial">
          <h3>Trial Plan</h3>

          <ul>
            <li>Partner can register and try learning games</li>
            <li>Games worth up to $50 can be tried</li>
          </ul>

          <h4>Notes</h4>
          <ul className="notes">
            <li>Game tokens sent to partner email</li>
            <li>Token valid for 3 days</li>
            <li>Games can be replayed while token is active</li>
          </ul>
        </div>
      )}

      {userData.subscription_plan_id === "trainer Plan post-paid" && (
        <div className="plan-card partner">
          <h3>Partner Plan</h3>

          <ul>
            <li>Select & distribute games to users</li>
            <li>One game token per user</li>
            <li>Post-paid plan</li>
            <li>10% discount above $5,000</li>
            <li>20% discount above $10,000</li>
          </ul>

          <h4>Notes</h4>
          <ul className="notes">
            <li>Token valid for 5 days</li>
            <li>Invoiced on user registration</li>
            <li>Access to analytics dashboard</li>
          </ul>
        </div>
      )}

      {userData.subscription_plan_id === "Enterprise Plan" && (
        <div className="plan-card enterprise">
          <h3>Enterprise Plan</h3>

          <ul>
            <li>Unlimited game access</li>
            <li>Quarterly or annual payment</li>
            <li>Enterprise-wide access</li>
          </ul>

          <h4>Notes</h4>
          <ul className="notes">
            <li>Employees register once via email</li>
            <li>Admin access to analytics dashboard</li>
          </ul>
        </div>
      )}
    </div>
  </div>
</div>

          </div>
          <div className="header-actions">
            <button
              onClick={() => { setShowPasswordModal(true); setPasswordMsg(""); }}
              className="change-password-button"
            >
              Change Password
            </button>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="navigation-grid">
          <div
            className={`nav-card distribute-card ${isTrialPlan ? 'disabled-card' : ''}`}
            onClick={() => {
              if (isTrialPlan) return;
              navigate('/partner/manage-users');
            }}
          >

            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="card-content">
              <h3>User Management</h3>
              <p>Manage users and their access to safety games</p>

              {isTrialPlan && (
                <p className="trial-note">
                  Available after upgrading plan
                </p>
              )}
            </div>
            <div className="card-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>

          <Link to="/partner/license" className="nav-card licenses-card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="M21 15.5c-.3-1.4-1.4-2.5-2.8-2.8" />
                <path d="M15 12c-1.1 0-2.1.4-2.8 1.2" />
              </svg>
            </div>
            <div className="card-content">
              <h3>License & Distribution</h3>
              <p>Manage your game licenses and distribution</p>
            </div>
            <div className="card-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </Link>

          <Link to="/partner/dashboard" className="nav-card dashboard-card">
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
              <h3>Business Dashboard</h3>
              <p>View Transactions, analytics and performance metrics</p>
            </div>
            <div className="card-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </Link>

          <Link to="/partner/transactions" className="nav-card transactions-card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="card-content">
              <h3>Transactions</h3>
              <p>View your payment history and invoices</p>
            </div>
            <div className="card-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </Link>

          <Link to="/partner/help" className="nav-card help-card">
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-card">
            <h4>Active Licenses</h4>
            <span className="stat-number">-</span>
          </div>
          <div className="stat-card">
            <h4>Games Distributed</h4>
            <span className="stat-number">-</span>
          </div>
          <div className="stat-card">
            <h4>Total Users</h4>
            <span className="stat-number">-</span>
          </div>
        </div>
      </div>
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2>Change Password</h2>

            <input type="password" placeholder="Old Password"
              value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
            />
            <input type="password" placeholder="New Password"
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            />
            <input type="password" placeholder="Confirm New Password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {passwordMsg && <p className="password-msg">{passwordMsg}</p>}

            <div className="modal-actions">
              <button
                className="submit-btn"
                onClick={handlePasswordSubmit}
                disabled={changingPassword}
              >
                {changingPassword ? "Updating..." : "Submit"}
              </button>
              <button
                className="close-btn"
                onClick={() => {
                  setShowPasswordModal(false);
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordMsg("");
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

export default PartnerHome;
