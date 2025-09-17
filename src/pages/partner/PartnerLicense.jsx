import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PartnerLicense.css';

const API_BASE_URL = '/api';

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

  // New pricing model for simplified Step 1
  const PRICE_PER_LICENSE = 20;

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
      const response = await fetch(`${API_BASE_URL}/users`);
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
                <path d="M19 12H5"/>
                <path d="M12 19l-7-7 7-7"/>
              </svg>
              Back to Home
            </Link>
            <h1>License & Distribution</h1>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="progress-timeline">
          <div className={`timeline-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-circle">
              {currentStep > 1 ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              ) : (
                <span>1</span>
              )}
            </div>
            <div className="step-content">
              <h3>Games</h3>
              <p>Select a game</p>
            </div>
          </div>
          
          <div className="timeline-connector"></div>
          
          <div className={`timeline-step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="step-circle">
              <span>2</span>
            </div>
            <div className="step-content">
              <h3>Distribute</h3>
              <p>Assign licenses</p>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="step-content-container">
          {currentStep === 1 && (
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
                            <img src={game.image} alt={game.title} className="game-thumbnail" />
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
          )}

          {currentStep === 2 && (
            <div className="distribute-step">
              <div className="step-header">
                <h2>Distribute Licenses</h2>
                <p>Select users to receive license emails for the chosen game.</p>
              </div>

              <div className="payment-summary" style={{marginBottom: '1rem'}}>
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
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name"
                        className="search-input"
                      />
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
                                <td style={{width: '2rem'}}>
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
                              <td style={{width: '2rem'}}>
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
                    // Placeholder for distribution action
                    console.log('Distribute to users:', selectedUsers.map(u => ({ id: u.id, email: u.email })));
                    alert(`Distribute ${selectedUsers.length} users via email`);
                  }}
                >
                  Distribute {selectedUsers.length} user{selectedUsers.length === 1 ? '' : 's'} via email
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="step-navigation">
          {currentStep > 1 && (
            <button onClick={handlePrevious} className="nav-button secondary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5"/>
                <path d="M12 19l-7-7 7-7"/>
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
