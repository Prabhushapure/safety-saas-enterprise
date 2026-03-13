import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Play.css';

const API_BASE_URL = 'api';

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
  const [playHistory, setPlayHistory] = useState(null);

  // Guard to avoid duplicate auto-init from StrictMode
  const autoInitDoneRef = useRef(false);

  const clearErrors = useCallback(() => {
    setError('');
    setTokenError('');
    setNameError('');
    setOrganizationError('');
  }, []);

  // ✅ Fetch user's play history using token
  const fetchPlayHistory = async (tokenToFetch) => {
    try {
      const response = await fetch(`${API_BASE_URL}/play/history?token=${encodeURIComponent(tokenToFetch)}`);
      const data = await response.json();
      if (data.success) {
        setPlayHistory(data.data);
      }
    } catch (err) {
      console.error('Error fetching play history:', err);
    }
  };

  // ✅ Helper function to show time remaining until 3-day expiry
  const getTimeRemaining = (registeredAt) => {
    if (!registeredAt) return '3d 0h 0m';
    const registered = new Date(registeredAt);
    const now = new Date();
    const expiry = new Date(registered.getTime() + 3 * 24 * 60 * 60 * 1000);
    const diffMs = expiry - now;

    if (diffMs <= 0) return 'Expired';

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffDays}d ${diffHrs}h ${diffMins}m`;
  };



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
        setToken(tokenToValidate.trim()); 
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
          fetchPlayHistory(tokenToValidate.trim()); // ✅ call here
        }
        else {
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

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/play/complete-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        if (tokenData?.userName) {
          setName(tokenData.userName);
        }
        setCurrentStep('ready');
        fetchPlayHistory(token.trim());
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

      // Extract play_no from backend response
      const { play_no } = data.data;

      // 2️⃣ Redirect to the external Unity game URL with both token and play_no
      const url = `${API_BASE_URL}/play/launch?token=${encodeURIComponent(token.trim())}&play_no=${play_no}`;
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

  const renderDetailsForm = () => {
    const gameImage = tokenData?.imageUrl || '/images/game-placeholder.png';
    const gameName = tokenData?.gameTitle || 'Game';
    const providerCompany = tokenData?.providerCompany || '—';
    const providerName = tokenData?.providerName || '—';
    const shortDescription = tokenData?.shortDescription || '—';

    return (
      <div
  className="play-modal"
  style={{
    width: "100%",
    maxWidth: "700px",
    height: "100vh",
    margin: "0 auto",
    padding: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }}
>
        <div style={{ 
          background: '#fff', 
          border: '3px solid #333', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ 
            background: '#cc0000', 
            color: '#fff', 
            textAlign: 'center', 
            padding: '12px', 
            fontWeight: 'bold', 
            fontSize: '1.2rem', 
            letterSpacing: '0.5px',
            borderBottom: '2px solid #333'
          }}>
            GAME TOKEN REGISTRATION
          </div>

          <div style={{ padding: '20px 25px', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            
            {/* Left Column */}
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '1.4rem', margin: '0 0 10px 0', textTransform: 'uppercase', color: '#000', fontWeight: '800' }}>
                {gameName}
              </h2>
              
              <div style={{ fontSize: '1rem', marginBottom: '20px', color: '#000', lineHeight: '1.5' }}>
                <p style={{ margin: '0 0 8px 0' }}><b>Sponsored by</b> {providerName}, {providerCompany}.</p>
                <p style={{ margin: '0 0 4px 0' }}><b>User Name:</b> {tokenData?.userName || '—'}</p>
                <p style={{ margin: '0 0 0 0' }}><b>Organization:</b> {tokenData?.userOrganization || '—'}</p>
              </div>

              <div style={{ 
                fontSize: '1.05rem', 
                color: '#222', 
                marginBottom: '25px', 
                lineHeight: '1.5' 
              }}>
                {isExpired ? (
                  <p style={{ color: '#b91c1c', margin: 0 }}>
                    Sorry, this Game Token has expired since it was sent more than 5 days earlier.
                    <br/>
                    Please ask your provider to resend the Game Token.
                  </p>
                  
                ) : (
                  <p style={{ margin: 0 }}>
                    Please complete your Registration to start playing the Game. The Game will be active
                    for 3 days after Registration. You can play this Game any number of times while it is active.
                  </p>
                )}
              </div>

              {/* Registration Form */}
              <form onSubmit={handleCompleteRegistration} style={{ marginTop: 'auto', width: '100%' }}>
                {error && <div className="error-message" style={{ marginBottom: '10px' }}>{error}</div>}
                <button
                  type="submit"
                  disabled={loading || isExpired}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#6b7280', 
                    color: '#fff',
                    border: '2px solid #4b5563',
                    borderBottomWidth: '4px',
                    borderRightWidth: '4px',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    cursor: (loading || isExpired) ? 'not-allowed' : 'pointer',
                    textTransform: 'uppercase',
                    opacity: (loading || isExpired) ? 0.7 : 1,
                    letterSpacing: '1px'
                  }}
                >
                  {loading ? 'Registering...' : 'REGISTER'}
                </button>
              </form>
            </div>

            {/* Right Column: Game Card */}
            <div style={{ width: '220px', display: 'flex', flexDirection: 'column', flexShrink: 0, margin: '0 auto' }}>
              <div style={{
                background: '#fff9e6', // yellowish
                border: '2px solid #e11d48', // redish border
                borderBottomWidth: '4px',
                borderRightWidth: '4px',
                borderRadius: '12px',
                padding: '4px',
                textAlign: 'center',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}>
                <img 
                  src={gameImage} 
                  alt={gameName} 
                  style={{ width: '100%', borderRadius: '8px', marginBottom: '12px', height: '160px', objectFit: 'cover' }} 
                />
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 8px 0', color: '#000', padding: '0 10px', fontWeight: 'bold' }}>
                  {gameName}
                </h3>
                <p style={{ fontSize: '0.85rem', margin: '0 0 10px 0', color: '#222', lineHeight: '1.4', padding: '0 10px' }}>
                  {shortDescription}
                </p>
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.9rem', color: '#cc0000', fontWeight: 'bold' }}>
                Powered by AntizTech.com
              </div>
            </div>

          </div>

          {/* Bottom Segments */}
          <div style={{ display: 'flex', height: '14px', width: '100%' }}>
            <div style={{ flex: 1.5, backgroundColor: '#374151' }}></div>
            <div style={{ flex: 1, backgroundColor: '#e5e7eb' }}></div>
            <div style={{ flex: 1.5, backgroundColor: '#e11d48' }}></div>
          </div>
          
        </div>
      </div>
    );
  };

  const renderReadyModal = () => {
    const gameImage = tokenData?.imageUrl || '/images/game-placeholder.png'; // adjust fallback as needed
    const gameName = tokenData?.gameTitle || 'Game';
    const providerCompany = tokenData?.providerCompany || '—';
    const providerName = tokenData?.providerName || '—';
    const shortDescription = tokenData?.shortDescription || '—';

    return (
      <div
        className="play-modal"
        style={{
          width: "100%",
          maxWidth: "700px",
          height: "100vh",
          margin: "0 auto",
          padding: "15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div style={{ 
          background: '#fff', 
          border: '3px solid #333', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          width: '100%'
        }}>
          {/* Header */}
          <div style={{ 
            background: '#cc0000', 
            color: '#fff', 
            textAlign: 'center', 
            padding: '12px', 
            fontWeight: 'bold', 
            fontSize: '1.2rem', 
            letterSpacing: '0.5px',
            borderBottom: '2px solid #333',
            textTransform: 'uppercase'
          }}>
            GAME STATISTICS & PLAY
          </div>

          <div style={{ padding: '20px 25px 5px', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            
            {/* Left Column */}
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '1.4rem', margin: '0 0 10px 0', textTransform: 'uppercase', color: '#000', fontWeight: '800' }}>
                {gameName}
              </h2>
              
              <div style={{ fontSize: '1rem', marginBottom: '15px', color: '#000', lineHeight: '1.5' }}>
                <p style={{ margin: '0 0 8px 0' }}><b>Sponsored by</b> {providerName}, {providerCompany}.</p>
                <p style={{ margin: '0 0 4px 0' }}><b>User Name:</b> {name.trim() || tokenData?.userName || '—'}</p>
                <p style={{ margin: '0 0 0 0' }}><b>Organization:</b> {tokenData?.userOrganization || '—'}</p>
              </div>

              {/* Play history & stats */}
              {!isExpired && playHistory && (
                <div style={{
                  background: '#fbe4d5',
                  borderRadius: '16px',
                  padding: '12px 20px',
                  margin: '0 0 15px 30px',
                  color: '#000',
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  width: 'fit-content'
                }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>Play Statistics:</p>
                  <p style={{ margin: '0 0 2px 0' }}>Number of times Played: {playHistory.total_plays}</p>
                  <p style={{ margin: '0 0 2px 0' }}>Number of times Passed: {playHistory.total_pass}</p>
                  <p style={{ margin: '0 0 2px 0' }}>Number of Times Failed: {playHistory.total_fail}</p>
                  <p style={{ margin: '0 0 2px 0' }}>Number of times aborted: {playHistory.total_abort}</p>
                  <p style={{ margin: 0 }}>Best Score: {playHistory.best_score ?? '—'}%</p>
                </div>
              )}

              {/* Expiry / Error Message */}
              {isExpired ? (
                <p style={{ color: '#b91c1c', marginBottom: '15px', fontSize: '1.05rem' }}>
                 This Game Token has already been utilized for 3 days and has expired.
                 <br/>
                 You would have got a Topic Completion Certificate by email with Play Statistics.
                 <br/>
                 Thank you for using this Game Token for Gamified Learning.
                </p>
              ) : (
                <div style={{ fontSize: '1.05rem', color: '#222', marginBottom: '15px' }}>
                  Game Expiry time remaining: {getTimeRemaining(tokenData?.registeredAt)}
                </div>
              )}

              {/* Play Button */}
              <div style={{ marginTop: 'auto', width: '100%' }}>
                <button
                  onClick={handlePlayClick}
                  disabled={isExpired}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#6b7280', 
                    color: '#fff',
                    border: '2px solid #4b5563',
                    borderBottomWidth: '4px',
                    borderRightWidth: '4px',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    cursor: isExpired ? 'not-allowed' : 'pointer',
                    textTransform: 'uppercase',
                    opacity: isExpired ? 0.7 : 1,
                    letterSpacing: '1px'
                  }}
                >
                  PLAY
                </button>
              </div>
            </div>

            {/* Right Column: Game Card */}
            <div style={{ width: '220px', display: 'flex', flexDirection: 'column', flexShrink: 0, margin: '0 auto' }}>
              <div style={{
                background: '#fff9e6',
                border: '2px solid #e11d48',
                borderBottomWidth: '4px',
                borderRightWidth: '4px',
                borderRadius: '12px',
                padding: '4px',
                textAlign: 'center',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}>
                <img 
                  src={gameImage} 
                  alt={gameName} 
                  style={{ width: '100%', borderRadius: '8px', marginBottom: '12px', height: '160px', objectFit: 'cover' }} 
                />
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 8px 0', color: '#000', padding: '0 10px', fontWeight: 'bold' }}>
                  {gameName}
                </h3>
                <p style={{ fontSize: '0.85rem', margin: '0 0 10px 0', color: '#222', lineHeight: '1.4', padding: '0 10px' }}>
                  {shortDescription}
                </p>
              </div>
            </div>

          </div>

          <div style={{ textAlign: 'right', padding: '0 25px 12px 0', fontSize: '0.9rem', color: '#cc0000', fontWeight: 'bold' }}>
            Powered by AntizTech.com
          </div>

          {/* Bottom Segments */}
          <div style={{ display: 'flex', height: '14px', width: '100%' }}>
            <div style={{ flex: 1.5, backgroundColor: '#374151' }}></div>
            <div style={{ flex: 1, backgroundColor: '#e5e7eb' }}></div>
            <div style={{ flex: 1.5, backgroundColor: '#e11d48' }}></div>
          </div>
          
        </div>
      </div>
    );
  };

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
