import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Play.css';

const API_BASE_URL = '/api';

const Play = () => {
  const [currentStep, setCurrentStep] = useState('token'); // token, details, ready
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  // Form states
  const [token, setToken] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');

  // Validation states
  const [tokenError, setTokenError] = useState('');
  const [nameError, setNameError] = useState('');
  const [organizationError, setOrganizationError] = useState('');

  // Guard to avoid duplicate auto-init from StrictMode
  const autoInitDoneRef = useRef(false);

  const clearErrors = useCallback(() => {
    setError('');
    setTokenError('');
    setNameError('');
    setOrganizationError('');
  }, []);

  const validateTokenAndAdvance = useCallback(async (tokenToValidate) => {
    clearErrors();
    if (!tokenToValidate || !tokenToValidate.trim()) {
      setTokenError('Token is required');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/play/validate-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenToValidate.trim() })
      });
      const data = await response.json();
      if (data.success) {
        setTokenData(data.data);
        // Compute expiry
        let expired = false;

        // 3 days after registration expiry (for already assigned tokens)
        if (data.data.registeredAt) {
          const registeredAt = new Date(data.data.registeredAt);
          const now = new Date();
          const diffMs = now.getTime() - registeredAt.getTime();
          const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
          expired = diffMs > threeDaysMs;
        }

        // 5 days after creation expiry (for unregistered tokens)
        else if (data.data.createdAt) {
          const createdAt = new Date(data.data.createdAt);
          const now = new Date();
          const diffMs = now.getTime() - createdAt.getTime();
          const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
          expired = diffMs > fiveDaysMs;
        }

        setIsExpired(expired);

        // If already assigned, jump to ready and use assigned user's name if available
        if (String(data.data.status).toLowerCase() === 'assigned') {
          if (data.data.userName) setName(data.data.userName);
          setCurrentStep('ready');
        } else {
          setCurrentStep('details');
        }
      } else {
        setError(data.message || 'Invalid token');
      }
    } catch (err) {
      console.error('Error validating token:', err);
      setError('Failed to validate token. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [clearErrors]);

  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    await validateTokenAndAdvance(token);
  };

  // Auto-advance if ?token= is present
  useEffect(() => {
    if (autoInitDoneRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('token');
    if (code && typeof code === 'string') {
      const upper = code.toUpperCase();
      setToken(upper);
      autoInitDoneRef.current = true;
      validateTokenAndAdvance(upper);
    }
  }, [validateTokenAndAdvance]);

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    clearErrors();

    let hasErrors = false;

    if (!name.trim()) {
      setNameError('Full name is required');
      hasErrors = true;
    }

    if (!organization.trim()) {
      setOrganizationError('Organization is required');
      hasErrors = true;
    }

    if (hasErrors) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/play/complete-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token.trim(),
          name: name.trim(),
          organization: organization.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setCurrentStep('ready');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Error during registration:', err);
      setError('Failed to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayClick = async () => {
    try {
      // 1️⃣ Create play record
      const response = await fetch(`${API_BASE_URL}/play/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() })
      });
      const data = await response.json();
  
      if (!data.success) {
        alert(data.message || 'Failed to start play');
        return;
      }
  
      // 2️⃣ Redirect to the external game
      const url = `${API_BASE_URL}/play/launch?token=${encodeURIComponent(token.trim())}`;
      window.location.href = url;
  
    } catch (err) {
      console.error('Error starting play:', err);
      alert('Failed to start play. Please try again.');
    }
  };
  

  const renderTokenForm = () => (
    <div className="play-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Enter Game Token</h2>
          <p>Enter your game access token to start playing</p>
        </div>

        <form onSubmit={handleTokenSubmit} className="play-form">
          <div className="form-group">
            <label htmlFor="token">Game Token</label>
            <input
              type="text"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className={tokenError ? 'error' : ''}
              maxLength={19}
            />
            {tokenError && <span className="error-text">{tokenError}</span>}
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner"></div>
                Validating...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </form>
      </div>
    </div>
  );

  const renderDetailsForm = () => (
    <div className="play-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{tokenData?.gameTitle || 'Game'}</h2>
          <p>Provided by: {tokenData?.providerName || '—'}</p>
        </div>

        <div className="modal-text" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
          {isExpired ? (
            <p style={{ color: '#b91c1c' }}>
              Sorry, this Game Token has expired. 5 or more days has past since this Token has been sent.
              Please ask your provider to resend the Game Token.
            </p>
            
          ) : (
            <p>
              Please complete your registration to start playing this game. The game will be active for 3 days after registration. You can play this game any number of times while it's active.
            </p>
          )}

        </div>

        <form onSubmit={handleCompleteRegistration} className="play-form">
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className={nameError ? 'error' : ''}
            />
            {nameError && <span className="error-text">{nameError}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="organization">Organization</label>
            <input
              type="text"
              id="organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Enter your organization"
              className={organizationError ? 'error' : ''}
            />
            {organizationError && <span className="error-text">{organizationError}</span>}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading || isExpired}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Registering...
                </>
              ) : (
                'Register'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderReadyModal = () => (
    <div className="play-modal success">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{tokenData?.gameTitle || 'Game'}</h2>
          <p>Provided by: {tokenData?.providerName || '—'}</p>
        </div>

        <div className="modal-text" style={{ marginTop: '0.5rem' }}>
          <p>Welcome {name.trim() || 'Player'}.</p>
          {isExpired && (
            <p style={{ color: '#b91c1c', marginTop: '0.5rem' }}>Sorry, this Game Token has been used for 3 days and has now expired</p>
          )}
        </div>

        <button onClick={handlePlayClick} className="submit-btn play-btn large" disabled={isExpired}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5,3 19,12 5,21 5,3" />
          </svg>
          Play
        </button>
      </div>
    </div>
  );

  return (
    <div className="play-page">
      <div className="play-background">
        <div className="background-pattern"></div>
      </div>

      {currentStep === 'token' && renderTokenForm()}
      {currentStep === 'details' && renderDetailsForm()}
      {currentStep === 'ready' && renderReadyModal()}
    </div>
  );
};

export default Play;
