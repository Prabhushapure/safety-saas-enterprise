import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePartnerAuth } from '../../hooks/usePartnerAuth';
import GameTitle from '../../components/GameTitle';
import CategoryFilter from '../../components/CategoryFilter';
import { parseDescription } from '../../utils/parseDescription';
import './PartnerLicense.css';
import './PartnerShared.css';

const API_BASE_URL = '/AWE-SaaS/api';

const PartnerLicense = () => {
  const navigate = useNavigate();
  const { userData, isLoading: authLoading } = usePartnerAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [modalError, setModalError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmResult, setConfirmResult] = useState(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(['all']);
  const [companyName, setCompanyName] = useState('');


  // When partner is on the trial plan, license selection & sending is disabled
  const isTrialPlan = userData?.subscription_plan_id === 'Trail Plan';

  const CARD_COLORS = [
    '#fef3c7', 
    '#e0f2fe', 
    '#ecfeff', 
    '#fce7f3', 
    '#ede9fe', 
    '#dcfce7', 
  ];

  // Redirect to partner home shortly after the email confirmation is shown
  useEffect(() => {
    if (showConfirmModal && confirmResult && !confirmLoading) {
      const timeoutId = setTimeout(() => {
        setShowConfirmModal(false);
        navigate('/partner/home');
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [showConfirmModal, confirmResult, confirmLoading, navigate]);

  useEffect(() => {
    if (userData) {
      fetchGames();
    }
  }, [userData]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);

      const partnerUser = JSON.parse(localStorage.getItem('partnerUser'));
const partnerId = partnerUser.businessPartnerId || partnerUser.id;

const response = await fetch(
  `${API_BASE_URL}/games/partner/${partnerId}/games`
);
      const data = await response.json();

      if (data.success) {
        setGames(data.data);
        setCompanyName(data.company_name);
      } else {
        setError('Failed to load games from database');
      }
    } catch (err) {
      console.error('Error fetching games:', err);
      setError('Failed to connect to the server. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Derived values
  const selectedUsers = allUsers.filter((u) => selectedIds.has(u.id));
  const filteredUsers = allUsers.filter(
    (u) => !searchQuery || (u.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchUsers = async () => {
    try {
      setError(null);
      const partnerUser = JSON.parse(localStorage.getItem('partnerUser'));
      const businessPartnerId = partnerUser.businessPartnerId || partnerUser.id;

      const response = await fetch(`${API_BASE_URL}/users?businessPartnerId=${businessPartnerId}`);
      const data = await response.json();
      if (data.success) {
        setAllUsers(data.data || []);
        setSelectedIds(new Set());
      } else {
        setError('Failed to load users from database');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to connect to the server. Please make sure the backend is running.');
    }
  };

  useEffect(() => {
    if (currentStep === 2) {
      fetchUsers();
    }
  }, [currentStep]);



  const handlePrevious = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      navigate('/partner/home');
    }
  };


  const handleGameClick = (game) => {
    setSelectedGame(game);
    setShowSidePanel(true);
  };

  const closeSidePanel = () => {
    setShowSidePanel(false);
    setSelectedGame(null);
  };

  const handleSelectGame = (game) => {
    setSelectedGame(game);
    setCurrentStep(2);
  };



  const filteredGames =
  selectedCategories.includes('all') || selectedCategories.length === 0
    ? games
    : games.filter((game) => {
        const gameCategories = Array.isArray(game.categories) ? game.categories : [];
        return selectedCategories.some((catId) => gameCategories.includes(catId));
      });


  if (authLoading || !userData || loading) {
    return (
      <div className="partner-license-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="partner-license-page">
      <div className="partner-license-container">
        {/* Header */}
        <div className="page-header">
          <div className="license-header">

            <button
              type="button"
              className="back-link"
              onClick={handlePrevious}
            >
              ← Back
            </button>

            <div className="license-header-center">
              <h1>Select Game & Distribute</h1>

              <p className="license-header-sub">
                {currentStep === 1
                  ? 'Choose a game from the catalog to distribute to your trainees'
                  : `Select users to receive the ${selectedGame?.title || 'game'} license`}
              </p>
            </div>

            {/* Right */}
            <div className="license-header-right">

              {/* STEP 1 → Category filter (reused component) */}
              {currentStep === 1 && (
                <>
                {companyName && (
                  <div className="company-name">
                    Company: <strong>{companyName}</strong>
                  </div>
                )}
          
                <CategoryFilter
                  selectedCategories={selectedCategories}
                  onChange={setSelectedCategories}
                  className="header-filter"
                />
              </>
              )}

              {/* STEP 2 → Selected game card */}
              {currentStep === 2 && selectedGame && (
                <div className="selected-game-card">
                  <div className="selected-game-title">
                    {selectedGame.title}
                  </div>
                  <div className="selected-game-desc">
                    {selectedGame.short_desc}
                  </div>
                  <div className="selected-game-price">
                    US$ {selectedGame.list_price}
                  </div>
                </div>
              )}

            </div>




          </div>
        </div>



        {/* Step Content */}
        <div className="step-content-container">

          {currentStep === 1 && (
            <div className="licenses-step">
              <div className="step-header" style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', gap: '8px' }}>


              </div>


              <div className="store-grid-container">
                <div className="store-grid">
                  {filteredGames.map((game, index) => {
                    const isDisabled = game.is_active === 0;
                    const bgColor = CARD_COLORS[index % CARD_COLORS.length];

                    return (
                      <GameTitle
                        key={game.id}
                        game={game}
                        showActions={true}
                        showPrice={true}
                        onSelect={handleSelectGame}
                        onDetails={handleGameClick}
                        isTrialPlan={isTrialPlan}
                        isDisabled={isDisabled}
                        bgColor={bgColor}   
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}


          {currentStep === 2 && (
            <div className="distribute-step">
              {/* Toolbar */}
              <div className="ul-toolbar">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by name..."
                  className="ul-search"
                />
                <button
                  className="ul-add-btn"
                  onClick={() => {
                    setNewUserName('');
                    setNewUserEmail('');
                    setModalError('');
                    setShowAddUserModal(true);
                  }}
                >
                  + Add User
                </button>
              </div>

              {/* Unified User Table */}
              <div className="ul-table-wrap">
                <table className="ul-table">
                  <thead>
                    <tr>
                      <th style={{ width: '3rem' }}>
                        <input
                          type="checkbox"
                          checked={filteredUsers.length > 0 && filteredUsers.every((u) => selectedIds.has(u.id))}
                          onChange={(e) => {
                            const next = new Set(selectedIds);
                            filteredUsers.forEach((u) => {
                              if (e.target.checked) next.add(u.id);
                              else next.delete(u.id);
                            });
                            setSelectedIds(next);
                          }}
                        />
                      </th>
                      <th>Name</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const isChecked = selectedIds.has(user.id);
                      return (
                        <tr
                          key={user.id}
                          className={isChecked ? 'ul-row-selected' : ''}
                          onClick={() => {
                            const next = new Set(selectedIds);
                            if (next.has(user.id)) next.delete(user.id);
                            else next.add(user.id);
                            setSelectedIds(next);
                          }}
                        >
                          <td>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                            />
                          </td>
                          <td>{user.name}</td>
                          <td className="ul-email">{user.email}</td>
                        </tr>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={3} className="ul-empty">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Sticky Summary Bar */}
              <div className="ul-summary-bar">
                <span className="ul-summary-count">
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                </span>
                <button
                  className={`ul-distribute-btn ${(selectedUsers.length === 0 || isTrialPlan) ? 'disabled' : ''}`}
                  disabled={selectedUsers.length === 0 || isTrialPlan}
                  onClick={() => {
                    if (selectedUsers.length === 0 || isTrialPlan) return;
                    setConfirmResult(null);
                    setShowConfirmModal(true);
                  }}
                >
                  Distribute via Email
                </button>
              </div>
            </div>
          )}
          {/* Add User Modal */}
          {showAddUserModal && (
            <div className="gd-overlay" onClick={() => setShowAddUserModal(false)}>
              <div className="gd-modal gd-modal-sm" onClick={(e) => e.stopPropagation()}>
                <button className="gd-close" onClick={() => setShowAddUserModal(false)} aria-label="Close">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
                <div className="gd-body">
                  <h2 className="gd-title">Add New User</h2>
                  {modalError && <div className="error-message">{modalError}</div>}
                  <div className="gd-form-row">
                    <label>Full name</label>
                    <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
                  </div>
                  <div className="gd-form-row">
                    <label>Email</label>
                    <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
                  </div>
                </div>
                <div className="gd-footer">
                  <button className="gd-btn-secondary" onClick={() => setShowAddUserModal(false)}>Cancel</button>
                  <button className="gd-btn-primary" onClick={async () => {
                    const name = newUserName.trim();
                    const email = newUserEmail.trim();
                    if (!name || !email) { setModalError('Name and Email are required'); return; }
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) { setModalError('Please enter a valid email'); return; }
                    try {
                      const businessPartnerId = userData.businessPartnerId || userData.id;
                      const res = await fetch(`${API_BASE_URL}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, business_partner_id: businessPartnerId }) });
                      const data = await res.json();
                      if (!data.success) { setModalError(data.message || 'Failed to create user'); return; }
                      setAllUsers((prev) => [...prev, data.data].sort((a, b) => (a.name || '').localeCompare(b.name || '')));
                      setShowAddUserModal(false);
                    } catch (err) {
                      console.error('Create user failed:', err);
                      setModalError('Network error. Please try again.');
                    }
                  }}>Save</button>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Distribute Modal */}
          {showConfirmModal && (
            <div className="gd-overlay">
              <div className="gd-modal gd-modal-sm" onClick={(e) => e.stopPropagation()}>
                <button className="gd-close" onClick={() => setShowConfirmModal(false)} aria-label="Close">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
                <div className="gd-body">
                  <h2 className="gd-title">Confirm Distribution</h2>
                  {!confirmResult ? (
                    <p className="gd-confirm-text">
                      Distributing <strong>{selectedGame?.title}</strong> license to {selectedUsers.length} user{selectedUsers.length === 1 ? '' : 's'}.
                    </p>
                  ) : (
                    <div>
                      <h4 className="gd-section-heading">Emails Sent</h4>
                      {confirmResult.mappings.map((m, idx) => (
                        <p className="gd-section-item" key={idx}>
                          {m.user.name} &lt;{m.user.email}&gt; &mdash; token {m.license.tokenCode}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <div className="gd-footer">
                  <button className="gd-btn-secondary" disabled={confirmLoading} onClick={() => setShowConfirmModal(false)}>Close</button>
                  {!confirmResult && (
                    <button className={`gd-btn-primary ${confirmLoading ? 'gd-btn-disabled' : ''}`} disabled={confirmLoading} onClick={async () => {
                      setConfirmLoading(true);
                      const usersToDistribute = [...selectedUsers];
                      try {
                        const businessPartnerId = userData.businessPartnerId || userData.id;
                        const licensesPayload = [{ gameId: selectedGame.id, count: usersToDistribute.length, tier: 'one-time', amount: 0 }];
                        const purchaseRes = await fetch(`${API_BASE_URL}/licenses/purchase`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ businessPartnerId, licenses: licensesPayload, totalAmount: 0 }) });
                        const purchaseData = await purchaseRes.json();
                        if (!purchaseData.success) { throw new Error(purchaseData.message || 'Purchase failed'); }
                        const created = purchaseData.licenses || [];
                        const assignments = [];
                        const mappings = [];
                        for (let i = 0; i < Math.min(created.length, usersToDistribute.length); i++) {
                          assignments.push({ licenseId: created[i].id, userId: usersToDistribute[i].id });
                          mappings.push({ user: usersToDistribute[i], license: created[i] });
                        }
                        if (assignments.length > 0) {
                          const assignRes = await fetch(`${API_BASE_URL}/licenses/assign-bulk`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assignments }) });
                          const assignData = await assignRes.json();
                          if (!assignData.success) { throw new Error(assignData.message || 'Assign failed'); }
                        }
                        if (mappings.length > 0) {
                          const emailRes = await fetch(`${API_BASE_URL}/sendmail`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              mappings,
                              gameTitle: selectedGame.title || 'Your Game',
                              businessPartnerId: userData.businessPartnerId || userData.id
                            }),
                          });
                          const emailData = await emailRes.json();
                          if (!emailData.success) {
                            console.error('Email sending failed:', emailData.message);
                          }
                        }
                        setConfirmResult({ mappings });
                      } catch (err) {
                        setConfirmResult({ mappings: [], error: err.message || 'Operation failed' });
                      } finally {
                        setConfirmLoading(false);
                      }
                    }}>{confirmLoading ? 'Processing...' : 'Confirm'}</button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* View Details Modal */}
        {showSidePanel && selectedGame && (
          <div className="gd-overlay" onClick={closeSidePanel}>
            <div className="gd-modal" onClick={(e) => e.stopPropagation()}>
              <button className="gd-close" onClick={closeSidePanel} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
              <div className="gd-layout">
                <div className="gd-image-col">
                  <img
                    src={`${import.meta.env.BASE_URL}${selectedGame.image_url.replace(/^\//, '')}`}
                    alt={selectedGame.title}
                    className="gd-image"
                  />
                </div>
                <div className="gd-content-col">
                  <h2 className="gd-title">{selectedGame.title}</h2>
                  <p className="gd-subtitle">{selectedGame.short_desc}</p>
                  {selectedGame.long_desc && selectedGame.long_desc.trim() ? (
                    <div className="gd-sections">
                      {parseDescription(selectedGame.long_desc)?.map((section, idx) => (
                        <div className="gd-section" key={idx}>
                          {section.heading && <h4 className="gd-section-heading">{section.heading}</h4>}
                          {section.items.map((item, j) => (
                            <p className="gd-section-item" key={j}>{item}</p>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="gd-coming-soon">Detailed description coming soon...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PartnerLicense;
