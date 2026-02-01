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
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false);


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

  const handleUpgradePlan = async () => {
    try {
      const partnerId = userData.id || userData.businessPartnerId;

      const response = await fetch(`${API_BASE_URL}/auth/upgrade-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // update local state
        const updatedUser = {
          ...userData,
          subscription_plan_id: data.newPlan
        };

        // update storage
        localStorage.setItem('partnerUser', JSON.stringify(updatedUser));
        setUserData(updatedUser);

        // close modal
        setShowUpgradeConfirm(false);
      } else {
        alert(data.message || 'Upgrade failed');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Network error while upgrading plan');
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

              {/* Trial badge → trial card only; upgrade badge → partner card + Convert / Not Now */}
              <div className="plan-badges-row">
                {isTrialPlan ? (
                  <>
                    <div className="plan-wrapper">
                      <span className="plan-badge">{userData.subscription_plan_id}</span>
                      <div className="plan-popup">
                        <div className="plan-card trial">
                          <h3>Trial Plan</h3>
                          <ul>
                            <li>Partner can register and use this Plan to try out and experience the Games in the Catalogue.</li>
                            <li>Access will be limited to 10 days from the date of Trial Plan Registration.</li>
                            <li>Convert your Trial Plan to either the Partner Plan or the Enterprise Plan within the Trial access period.</li>
                          </ul>
                          <h4>Notes</h4>
                          <ul className="notes">
                            <li>To extend the Plan duration, please write us an email as in “Help & Support”.</li>
                        </ul>
                        </div>
                      </div>
                    </div>
                    <div className="plan-wrapper">
                      <span className="plan-badge upgrade-plan-badge">Upgrade</span>
                      <div className="plan-popup">
                        <div className="plan-card partner highlight">
                          <h3>Partner Plan</h3>
                          <ul>
                            <li>Registered Partner can select any Game  from the Catalogue and distribute them as Game Tokens (by email invite) to their Users</li>
                            <li>Email invite sent to each User will have a unique Game Token.</li>
                            <li>Partners will maintain their Users list to enable easy distribution.</li>
                            <li>The price of each Game Token is as per the List price on the Catalogue.</li>
                            <li>The Plan is a Post-paid Plan.</li>
                          </ul>
                          <h4>Notes</h4>
                          <ul className="notes">
                            <li>Your Users will need to Register & Play from the email invite sent to them.</li>
                            <li>Email invites have 5 days validity for Registration</li>
                            <li>Partner will be billed at the time of User Registration.</li>
                            <li>Game Tokens will be active for 3 days after User Registration during which the Game can be played multiple times.</li>
                            <li>User will get a Completion Certificate on expiry of Game Token.</li>
                            <li>Partner has access to business dashboard</li>
                          </ul>
                          <div className="upgrade-actions">
                            <button
                              className="btn-primary"
                              onClick={() => setShowUpgradeConfirm(true)}
                            >
                              Upgrade to Partner Plan
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className={`plan-wrapper ${userData.subscription_plan_id === "Partner Plan" ? "plan-wrapper-partner" : ""}`}>
                    <span className="plan-badge">{userData.subscription_plan_id}</span>
                    <div className="plan-popup">
                      {userData.subscription_plan_id === "Partner Plan" && (
                    <div className="plan-card partner">
                      <h3>Partner Plan</h3>

                      <ul>
                        <li>Registered Partner can select any Game  from the Catalogue and distribute them as Game Tokens (by email invite) to their Users</li>
                        <li>Email invite sent to each User will have a unique Game Token.</li>
                        <li>Partners will maintain their Users list to enable easy distribution.</li>
                        <li>The price of each Game Token is as per the List price on the Catalogue.</li>
                        <li>The Plan is a Post-paid Plan.</li>
                      </ul>

                      <h4>Notes</h4>
                      <ul className="notes">
                        <li>Your Users will need to Register & Play from the email invite sent to them.</li>
                        <li>Email invites have 5 days validity for Registration</li>
                        <li>Partner will be billed at the time of User Registration.</li>
                        <li>Game Tokens will be active for 3 days after User Registration during which the Game can be played multiple times.</li>
                        <li>User will get a Completion Certificate on expiry of Game Token.</li>
                        <li>Partner has access to business dashboard</li>
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
                )}
              </div>
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
                  setPasswordMsg("");
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
              <h3>Manage Your Users list</h3>
              <p>Add, edit or delete your Users list</p>

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
              <h3>Select Game & Distribute</h3>
              <p>Select a Game from the catalog and send it to your Users by email</p>
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
              <p>View your transactions and Business analytics</p>
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

      {showUpgradeConfirm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2>Confirm Plan Upgrade</h2>

            <p style={{ marginBottom: '12px' }}>
              You are about to convert from <b>Trial Plan</b> to
              <b> Partner Plan</b>.
            </p>

            <p style={{ fontSize: '14px', color: '#555' }}>
              Billing will start based on usage. Do you want to continue?
            </p>

            <div className="modal-actions">
              <button
                className="submit-btn"
                onClick={handleUpgradePlan}
              >
                Yes, Upgrade
              </button>


              <button
                className="close-btn"
                onClick={() => setShowUpgradeConfirm(false)}
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
