import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PartnerLicense.css';

const API_BASE_URL = '/api';

const PartnerLicense = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [games, setGames] = useState([]);
  const [licenses, setLicenses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // License pricing
  const PRICING = {
    'one-time': 10,
    '1-month': 25,
    '6-months': 100,
    '1-year': 150
  };

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
        // Initialize licenses object
        const initialLicenses = {};
        data.data.forEach(game => {
          initialLicenses[game.id] = {
            count: '',
            validity: '',
            amount: 0
          };
        });
        setLicenses(initialLicenses);
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

  const handleLicenseCountChange = (gameId, count) => {
    const numericCount = count === '' ? '' : parseInt(count) || '';
    setLicenses(prev => {
      const updated = {
        ...prev,
        [gameId]: {
          ...prev[gameId],
          count: numericCount,
          amount: numericCount && prev[gameId].validity ? 
            numericCount * PRICING[prev[gameId].validity] : 0
        }
      };
      return updated;
    });
  };

  const handleValidityChange = (gameId, validity) => {
    setLicenses(prev => {
      const updated = {
        ...prev,
        [gameId]: {
          ...prev[gameId],
          validity,
          amount: prev[gameId].count && validity ? 
            prev[gameId].count * PRICING[validity] : 0
        }
      };
      return updated;
    });
  };

  const getTotalAmount = () => {
    return Object.values(licenses).reduce((total, license) => total + license.amount, 0);
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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
              <h3>Licenses</h3>
              <p>Select games and quantities</p>
            </div>
          </div>
          
          <div className="timeline-connector"></div>
          
          <div className={`timeline-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-circle">
              {currentStep > 2 ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              ) : (
                <span>2</span>
              )}
            </div>
            <div className="step-content">
              <h3>Distribute</h3>
              <p>Assign to users</p>
            </div>
          </div>
          
          <div className="timeline-connector"></div>
          
          <div className={`timeline-step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-circle">
              <span>3</span>
            </div>
            <div className="step-content">
              <h3>Payment</h3>
              <p>Complete purchase</p>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="step-content-container">
          {currentStep === 1 && (
            <div className="licenses-step">
              <div className="step-header">
                <h2>Select Game Licenses</h2>
                <p>Choose the games you want to license and specify the quantity and validity period.</p>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="licenses-table-container">
                <table className="licenses-table">
                  <thead>
                    <tr>
                      <th>Game</th>
                      <th>License Count</th>
                      <th>Validity</th>
                      <th>Amount</th>
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
                                  {game.description}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            value={licenses[game.id]?.count || ''}
                            onChange={(e) => handleLicenseCountChange(game.id, e.target.value)}
                            className="count-input"
                            placeholder="0"
                          />
                        </td>
                        <td>
                          {licenses[game.id]?.count > 0 ? (
                            <select
                              value={licenses[game.id]?.validity || ''}
                              onChange={(e) => handleValidityChange(game.id, e.target.value)}
                              className="validity-select"
                            >
                              <option value="">Select validity</option>
                              <option value="one-time">One time - $10</option>
                              <option value="1-month">1 month - $25</option>
                              <option value="6-months">6 months - $100</option>
                              <option value="1-year">1 year - $150</option>
                            </select>
                          ) : (
                            <span className="validity-placeholder">-</span>
                          )}
                        </td>
                        <td>
                          <span className="amount">
                            {licenses[game.id]?.amount > 0 ? `$${licenses[game.id].amount}` : '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="total-section">
                <div className="total-amount">
                  <span className="total-label">Total Cost:</span>
                  <span className="total-value">${getTotalAmount()}</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="distribute-step">
              <div className="step-header">
                <h2>Distribute Licenses</h2>
                <p>Assign licenses to your users (Coming soon)</p>
              </div>
              <div className="coming-soon">
                <div className="coming-soon-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                </div>
                <h3>Distribution Feature</h3>
                <p>This feature is under development and will be available soon.</p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="payment-step">
              <div className="step-header">
                <h2>Payment</h2>
                <p>Complete your purchase (Coming soon)</p>
              </div>
              <div className="coming-soon">
                <div className="coming-soon-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <h3>Payment Gateway</h3>
                <p>Payment processing will be integrated soon.</p>
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
          
          {currentStep < 3 && (
            <button 
              onClick={handleNext} 
              className={`nav-button primary ${getTotalAmount() === 0 ? 'disabled' : ''}`}
              disabled={getTotalAmount() === 0}
            >
              Next
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14"/>
                <path d="M12 5l7 7-7 7"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerLicense;
