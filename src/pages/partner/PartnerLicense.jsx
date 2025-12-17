import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GameTitle from '../../components/GameTitle';
import './PartnerLicense.css';

const API_BASE_URL = '/AWE-SaaS/api';

const PartnerLicense = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  // Keep available and selected lists; no need to retain a separate allUsers copy
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [leftSelectedIds, setLeftSelectedIds] = useState(new Set());
  const [rightSelectedIds, setRightSelectedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [modalError, setModalError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmResult, setConfirmResult] = useState(null);

  // New pricing model for simplified Step 1
  const PRICE_PER_LICENSE = 20;

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
    // Check if user is logged in
    const storedUser = localStorage.getItem('partnerUser');
    if (!storedUser) {
      navigate('/partner/login');
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      console.log('Partner user data loaded:', user);
      setUserData(user);
      fetchGames();
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/partner/login');
    }
  }, [navigate]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/games`);
      const data = await response.json();

      if (data.success) {
        setGames(data.data);
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

  const fetchUsers = async () => {
    try {
      setError(null);
      // Get logged-in partner data
      const partnerUser = JSON.parse(localStorage.getItem('partnerUser'));
      const businessPartnerId = partnerUser.businessPartnerId || partnerUser.id;

      const response = await fetch(`${API_BASE_URL}/users?businessPartnerId=${businessPartnerId}`);
      const data = await response.json();
      if (data.success) {
        setAvailableUsers(data.data || []);
        setSelectedUsers([]);
        setLeftSelectedIds(new Set());
        setRightSelectedIds(new Set());
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
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };


  const handleSelectGame = (game) => {
    setSelectedGame(game);
    setCurrentStep(2);
  };

  if (!userData || loading) {
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
          <div className="header-content">
            <Link to="/partner/home" className="back-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
            <h1>License & Distribution</h1>

          </div>
          {/* Small Minimal Progress Timeline */}
          <div className="progress-timeline-small">
            <span className={currentStep > 1 ? 'completed' : 'active'}>Select Game</span>
            <span className={currentStep === 2 ? 'active' : ''}>Distribute to Users</span>
          </div>

        </div>



        {/* Step Content */}
        <div className="step-content-container">
          {/* {currentStep === 1 && (
            <div className="licenses-step">
              <div className="step-header">
                <h2>Select a Game</h2>
                <p>Choose a game to purchase licenses for. Price per license is ${PRICE_PER_LICENSE}.</p>
              </div>

              {error && (
                <div className="error-message">
                  {typeof error === 'string' ? (
                    error
                  ) : (
                    <>
                      <span className="error-title">{error.message}</span>
                      {error.details && (
                        <div className="error-details">
                          <strong>Issues found:</strong>
                          <ul style={{margin: '0.5rem 0', paddingLeft: '1.5rem'}}>
                            {error.details.map((detail, index) => (
                              <li key={index}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="licenses-table-container">
                <table className="licenses-table">
                  <thead>
                    <tr>
                      <th>Game</th>
                      <th>Price per license</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.map(game => (
                      <tr key={game.id}>
                        <td>
                          <div className="game-info">
                            <img src={game.image_url} alt={game.title} className="game-thumbnail" />
                            <div className="game-details">
                              <span className="game-title">{game.title}</span>
                              <div className="info-tooltip">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"/>
                                  <path d="M9,9h0a3,3,0,0,1,6,0c0,2-3,3-3,3"/>
                                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                                <div className="tooltip-content">
                                  {game.short_desc}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="amount">${PRICE_PER_LICENSE}</span>
                        </td>
                        <td>
                          <button className="nav-button primary" onClick={() => handleSelectGame(game)}>
                            Select game
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )} */}
          {currentStep === 1 && (
            <div className="licenses-step">
              <div className="step-header">
                <h2>Select a Game</h2>
                <p>Choose a game to purchase licenses for. Price per license is ${PRICE_PER_LICENSE}.</p>
              </div>

              <div className="store-grid-container">
                <div className="store-grid">
                  {games.map(game => (
                    <GameTitle
                      key={game.id}
                      game={game}
                      onDetails={() => handleSelectGame(game)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}


          {currentStep === 2 && (
            <div className="distribute-step">
              <div className="step-header">
                <h2>Distribute Licenses</h2>
                <p>Select users to receive license emails for the chosen game.</p>
              </div>

              <div className="payment-summary" style={{ marginBottom: '1rem' }}>
                <h3>Selected Game</h3>
                {selectedGame ? (
                  <div className="order-item">
                    <div className="order-item-details">
                      <span className="order-item-name">{selectedGame.title}</span>
                      <span className="order-item-specs">Price per license: ${PRICE_PER_LICENSE}</span>
                    </div>
                  </div>
                ) : (
                  <p>No game selected.</p>
                )}
              </div>

              <div className="dual-list-container">
                <div className="dual-list">
                  <div className="list-panel">
                    <div className="list-header">
                      <h4>All Users</h4>
                    </div>
                    <div className="list-search">
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by name"
                          className="search-input"
                        />
                        <button
                          className="nav-button secondary"
                          title="Add new user"
                          onClick={() => {
                            setNewUserName('');
                            setNewUserEmail('');
                            setModalError('');
                            setShowAddUserModal(true);
                          }}
                        >
                          Add New User
                        </button>
                      </div>
                    </div>
                    <div className="list-body">
                      <table className="users-table">
                        <thead>
                          <tr>
                          </tr>
                        </thead>
                        <tbody>
                          {availableUsers
                            .filter(u => !searchQuery || (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(user => (
                              <tr key={user.id}>
                                <td style={{ width: '2rem' }}>
                                  <input
                                    type="checkbox"
                                    checked={leftSelectedIds.has(user.id)}
                                    onChange={(e) => {
                                      const next = new Set(leftSelectedIds);
                                      if (e.target.checked) next.add(user.id); else next.delete(user.id);
                                      setLeftSelectedIds(next);
                                    }}
                                  />
                                </td>
                                <td>
                                  <span className="user-row-name">{user.name}</span>
                                  <span className="user-row-email"> ({user.email})</span>
                                </td>
                              </tr>
                            ))}
                          {availableUsers.filter(u => !searchQuery || (u.name || '').toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                            <tr>
                              <td colSpan={2}>
                                <span className="empty-state">No users found</span>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="list-actions">
                    <button
                      className={`nav-button primary ${leftSelectedIds.size === 0 ? 'disabled' : ''}`}
                      disabled={leftSelectedIds.size === 0}
                      onClick={() => {
                        const idsToAdd = new Set(leftSelectedIds);
                        const toMove = availableUsers.filter(u => idsToAdd.has(u.id));
                        if (toMove.length === 0) return;
                        const remaining = availableUsers.filter(u => !idsToAdd.has(u.id));
                        setAvailableUsers(remaining);
                        setSelectedUsers([...selectedUsers, ...toMove]);
                        setLeftSelectedIds(new Set());
                      }}
                    >
                      Add →
                    </button>
                    <button
                      className={`nav-button secondary ${rightSelectedIds.size === 0 ? 'disabled' : ''}`}
                      disabled={rightSelectedIds.size === 0}
                      onClick={() => {
                        const idsToRemove = new Set(rightSelectedIds);
                        const toMoveBack = selectedUsers.filter(u => idsToRemove.has(u.id));
                        if (toMoveBack.length === 0) return;
                        const remainingRight = selectedUsers.filter(u => !idsToRemove.has(u.id));
                        setSelectedUsers(remainingRight);
                        setAvailableUsers([...availableUsers, ...toMoveBack].sort((a, b) => (a.name || '').localeCompare(b.name || '')));
                        setRightSelectedIds(new Set());
                      }}
                    >
                      ← Remove
                    </button>
                  </div>

                  <div className="list-panel">
                    <div className="list-header">
                      <h4>Selected Users</h4>
                    </div>
                    <div className="list-body">
                      <table className="users-table">
                        <thead>
                          <tr>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedUsers.map(user => (
                            <tr key={user.id}>
                              <td style={{ width: '2rem' }}>
                                <input
                                  type="checkbox"
                                  checked={rightSelectedIds.has(user.id)}
                                  onChange={(e) => {
                                    const next = new Set(rightSelectedIds);
                                    if (e.target.checked) next.add(user.id); else next.delete(user.id);
                                    setRightSelectedIds(next);
                                  }}
                                />
                              </td>
                              <td>
                                <span className="user-row-name">{user.name}</span>
                                <span className="user-row-email"> ({user.email})</span>
                              </td>
                            </tr>
                          ))}
                          {selectedUsers.length === 0 && (
                            <tr>
                              <td colSpan={2}>
                                <span className="empty-state">No users selected</span>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="distribution-actions">
                <button
                  className={`nav-button primary ${selectedUsers.length === 0 ? 'disabled' : ''}`}
                  disabled={selectedUsers.length === 0}
                  onClick={() => {
                    setConfirmResult(null);
                    setShowConfirmModal(true);
                  }}
                >
                  Distribute {selectedUsers.length} user{selectedUsers.length === 1 ? '' : 's'} via email
                </button>
              </div>
            </div>
          )}
          {/* Add User Modal */}
          {showAddUserModal && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h3>Add New User</h3>
                </div>
                <div className="modal-body">
                  {modalError && <div className="error-message" style={{ margin: '0 0 1rem' }}>{modalError}</div>}
                  <div className="form-row">
                    <label>Full name</label>
                    <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Jane Doe" />
                  </div>
                  <div className="form-row">
                    <label>Email</label>
                    <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="jane@example.com" />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="nav-button secondary" onClick={() => setShowAddUserModal(false)}>Cancel</button>
                  <button className="nav-button primary" onClick={async () => {
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
                      setAvailableUsers([...availableUsers, data.data].sort((a, b) => (a.name || '').localeCompare(b.name || '')));
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
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h3>Confirm Distribution</h3>
                </div>
                <div className="modal-body">
                  {!confirmResult ? (
                    <p>Distributing {selectedGame?.title} license to {selectedUsers.length} user{selectedUsers.length === 1 ? '' : 's'}.</p>
                  ) : (
                    <div>
                      <h4>Emails Sent</h4>
                      <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
                        {confirmResult.mappings.map((m, idx) => (
                          <li key={idx}>{m.user.name} &lt;{m.user.email}&gt; — token {m.license.tokenCode}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="nav-button secondary" disabled={confirmLoading} onClick={() => setShowConfirmModal(false)}>Close</button>
                  {!confirmResult && (
                    <button className={`nav-button primary ${confirmLoading ? 'disabled' : ''}`} disabled={confirmLoading} onClick={async () => {
                      setConfirmLoading(true);
                      try {
                        const businessPartnerId = userData.businessPartnerId || userData.id;
                        const licensesPayload = [{ gameId: selectedGame.id, count: selectedUsers.length, tier: 'one-time', amount: 0 }];
                        const purchaseRes = await fetch(`${API_BASE_URL}/licenses/purchase`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ businessPartnerId, licenses: licensesPayload, totalAmount: 0 }) });
                        const purchaseData = await purchaseRes.json();
                        if (!purchaseData.success) { throw new Error(purchaseData.message || 'Purchase failed'); }
                        const created = purchaseData.licenses || [];
                        const assignments = [];
                        const mappings = [];
                        for (let i = 0; i < Math.min(created.length, selectedUsers.length); i++) {
                          assignments.push({ licenseId: created[i].id, userId: selectedUsers[i].id });
                          mappings.push({ user: selectedUsers[i], license: created[i] });
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

        {/* Navigation Buttons */}
        <div className="step-navigation">
          {currentStep > 1 && (
            <button onClick={handlePrevious} className="nav-button secondary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerLicense;
