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
  const [purchasing, setPurchasing] = useState(false);
  const [purchasedLicenses, setPurchasedLicenses] = useState([]);
  const [emailInputs, setEmailInputs] = useState({});

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

  const handleEmailChange = (licenseId, email) => {
    setEmailInputs(prev => ({
      ...prev,
      [licenseId]: email
    }));
  };

  const isValidEmail = (email) => {
    if (!email.trim()) return true; // Empty email is allowed
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendEmails = async () => {
    // Validate all email inputs
    const invalidEmails = Object.entries(emailInputs).filter(([, email]) => 
      email.trim() && !isValidEmail(email)
    );

    if (invalidEmails.length > 0) {
      setError('Please enter valid email addresses for all fields.');
      return;
    }

    // TODO: Implement email sending functionality
    alert('Email sending functionality will be implemented later.');
    
    // For now, redirect to dashboard after successful "send"
    navigate('/partner/home');
  };

  const handleBuyNow = async () => {
    if (getTotalAmount() === 0) {
      setError('Please select at least one license to purchase.');
      return;
    }
    
    setPurchasing(true);
    setError(null);
    
    try {
      // Prepare the license data for purchase
      const purchaseData = {
        licenses: Object.entries(licenses)
          // eslint-disable-next-line no-unused-vars
          .filter(([gameId, license]) => license.count > 0)
          .map(([gameId, license]) => ({
            gameId: parseInt(gameId),
            count: license.count,
            tier: license.validity, // This will be mapped on the backend
            amount: license.amount
          })),
        totalAmount: getTotalAmount()
      };

      const businessPartnerId = userData.businessPartnerId || userData.id;
      console.log('Sending purchase request with businessPartnerId:', businessPartnerId, 'from userData:', userData);

      const response = await fetch(`${API_BASE_URL}/licenses/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessPartnerId,
          ...purchaseData
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store purchased licenses for distribution step
        setPurchasedLicenses(data.licenses || []);
        
        // Initialize email inputs for each license
        const initialEmailInputs = {};
        (data.licenses || []).forEach(license => {
          initialEmailInputs[license.id] = '';
        });
        setEmailInputs(initialEmailInputs);
        
        // Move to distribute step
        setCurrentStep(3);
      } else {
        // Create structured error display
        setError({
          message: data.message || 'Purchase failed. Please try again.',
          details: data.details || null,
          receivedData: data.receivedData || null,
          invalidLicense: data.invalidLicense || null
        });
      }
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error: Cannot connect to server. Please check if the backend is running.');
      } else if (err.name === 'SyntaxError') {
        setError('Server returned invalid response. Please try again.');
      } else {
        setError(`Failed to process purchase: ${err.message}`);
      }
    } finally {
      setPurchasing(false);
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
              <h3>Transaction</h3>
              <p>Review & purchase</p>
            </div>
          </div>
          
          <div className="timeline-connector"></div>
          
          <div className={`timeline-step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-circle">
              <span>3</span>
            </div>
            <div className="step-content">
              <h3>Distribute</h3>
              <p>Assign to users</p>
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
                      {error.receivedData && (
                        <div className="error-data">
                          <strong>Request Data:</strong><br/>
                          Business Partner ID: {error.receivedData.businessPartnerId}<br/>
                          Licenses Type: {error.receivedData.licensesType}<br/>
                          Licenses Count: {error.receivedData.licensesCount}
                        </div>
                      )}
                      {error.invalidLicense && (
                        <div className="error-data">
                          <strong>Invalid License:</strong><br/>
                          Game ID: {error.invalidLicense.gameId}<br/>
                          Count: {error.invalidLicense.count}<br/>
                          Tier: {error.invalidLicense.tier}<br/>
                          Amount: {error.invalidLicense.amount}
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
                                  {game.short_desc}
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
            <div className="payment-step">
              <div className="step-header">
                <h2>Transaction Details</h2>
                <p>Review your order and complete your purchase</p>
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
                      {error.receivedData && (
                        <div className="error-data">
                          <strong>Request Data:</strong><br/>
                          Business Partner ID: {error.receivedData.businessPartnerId}<br/>
                          Licenses Type: {error.receivedData.licensesType}<br/>
                          Licenses Count: {error.receivedData.licensesCount}
                        </div>
                      )}
                      {error.invalidLicense && (
                        <div className="error-data">
                          <strong>Invalid License:</strong><br/>
                          Game ID: {error.invalidLicense.gameId}<br/>
                          Count: {error.invalidLicense.count}<br/>
                          Tier: {error.invalidLicense.tier}<br/>
                          Amount: {error.invalidLicense.amount}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              
              <div className="payment-summary">
                <h3>Order Summary</h3>
                <div className="order-items">
                  {/* eslint-disable-next-line no-unused-vars */}
                  {Object.entries(licenses).filter(([gameId, license]) => license.count > 0).map(([gameId, license]) => {
                    const game = games.find(g => g.id.toString() === gameId);
                    const validityLabel = {
                      'one-time': 'One Time',
                      '1-month': '1 Month',
                      '6-months': '6 Months', 
                      '1-year': '1 Year'
                    }[license.validity];
                    
                    return (
                      <div key={gameId} className="order-item">
                        <div className="order-item-details">
                          <span className="order-item-name">{game?.title}</span>
                          <span className="order-item-specs">{license.count} licenses × {validityLabel}</span>
                        </div>
                        <span className="order-item-amount">${license.amount}</span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="order-total">
                  <div className="total-row">
                    <span className="total-label">Total Amount:</span>
                    <span className="total-amount">${getTotalAmount()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="distribute-step">
              <div className="step-header">
                <h2>Distribute Licenses</h2>
                <p>Assign your purchased licenses to users by entering their email addresses</p>
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
                      {error.receivedData && (
                        <div className="error-data">
                          <strong>Request Data:</strong><br/>
                          Business Partner ID: {error.receivedData.businessPartnerId}<br/>
                          Licenses Type: {error.receivedData.licensesType}<br/>
                          Licenses Count: {error.receivedData.licensesCount}
                        </div>
                      )}
                      {error.invalidLicense && (
                        <div className="error-data">
                          <strong>Invalid License:</strong><br/>
                          Game ID: {error.invalidLicense.gameId}<br/>
                          Count: {error.invalidLicense.count}<br/>
                          Tier: {error.invalidLicense.tier}<br/>
                          Amount: {error.invalidLicense.amount}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="distribute-table-container">
                <table className="distribute-table">
                  <thead>
                    <tr>
                      <th>License Code</th>
                      <th>Game Title</th>
                      <th>Validity</th>
                      <th>User Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchasedLicenses.map(license => {
                      const game = games.find(g => g.id === license.gameId);
                      const validityLabel = {
                        'OneTime': 'One Time',
                        'OneMonth': '1 Month',
                        'SixMonth': '6 Months', 
                        'OneYear': '1 Year'
                      }[license.tier];
                      
                      return (
                        <tr key={license.id}>
                          <td>
                            <span className="license-code">{license.tokenCode}</span>
                          </td>
                          <td>
                            <span className="game-title-simple">{game?.title}</span>
                          </td>
                          <td>
                            <span className="validity-badge">{validityLabel}</span>
                          </td>
                          <td>
                            <input
                              type="email"
                              value={emailInputs[license.id] || ''}
                              onChange={(e) => handleEmailChange(license.id, e.target.value)}
                              className="email-input"
                              placeholder="Enter user email"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {purchasedLicenses.length === 0 && (
                <div className="no-licenses">
                  <p>No licenses to distribute. Please complete the purchase first.</p>
                </div>
              )}
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
          
          {currentStep === 1 && (
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
          
          {currentStep === 2 && (
            <button 
              onClick={handleBuyNow} 
              className={`nav-button buy-now ${purchasing ? 'loading' : ''} ${getTotalAmount() === 0 ? 'disabled' : ''}`}
              disabled={getTotalAmount() === 0 || purchasing}
            >
              {purchasing ? (
                <>
                  <div className="button-spinner"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                    <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                  </svg>
                  Buy Now (Pay Later) - ${getTotalAmount()}
                </>
              )}
            </button>
          )}

          {currentStep === 3 && (
            <button 
              onClick={handleSendEmails} 
              className="nav-button primary"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Send Emails
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerLicense;
