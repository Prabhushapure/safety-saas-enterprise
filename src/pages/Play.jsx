import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Play.css';

const API_BASE_URL = 'api';

const Play = () => {
  const [currentStep, setCurrentStep] = useState('token');
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [token, setToken] = useState('');
  const [name, setName] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [playHistory, setPlayHistory] = useState(null);
  const autoInitDoneRef = useRef(false);

  const clearErrors = useCallback(() => {
    setError('');
    setTokenError('');
  }, []);

  const fetchPlayHistory = async (tokenToFetch) => {
    try {
      const response = await fetch(`${API_BASE_URL}/play/history?token=${encodeURIComponent(tokenToFetch)}`);
      const data = await response.json();
      if (data.success) setPlayHistory(data.data);
    } catch (err) {
      console.error('Error fetching play history:', err);
    }
  };

  const getTimeRemaining = (registeredAt) => {
    if (!registeredAt) return '3d 0h 0m';
    const registered = new Date(registeredAt);
    const expiry = new Date(registered.getTime() + 3 * 24 * 60 * 60 * 1000);
    const diffMs = expiry - new Date();
    if (diffMs <= 0) return 'Expired';
    const d = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const h = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${d}d ${h}h ${m}m`;
  };

  const validateTokenAndAdvance = useCallback(async (tokenToValidate) => {
    clearErrors();
    if (!tokenToValidate || !tokenToValidate.trim()) { setTokenError('Token is required'); return; }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/play/validate-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenToValidate.trim() }),
      });
      const data = await response.json();
      if (data.success) {
        setToken(tokenToValidate.trim());
        setTokenData(data.data);
        let expired = false;
        if (data.data.registeredAt) {
          expired = (new Date() - new Date(data.data.registeredAt)) > 3 * 24 * 60 * 60 * 1000;
        } else if (data.data.createdAt) {
          expired = (new Date() - new Date(data.data.createdAt)) > 5 * 24 * 60 * 60 * 1000;
        }
        setIsExpired(expired);
        if (String(data.data.status).toLowerCase() === 'assigned') {
          if (data.data.userName) setName(data.data.userName);
          setCurrentStep('ready');
          fetchPlayHistory(tokenToValidate.trim());
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });
      const data = await response.json();
      if (data.success) {
        if (tokenData?.userName) setName(tokenData.userName);
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
      const response = await fetch(`${API_BASE_URL}/play/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });
      const data = await response.json();
      if (!data.success) { alert(data.message || 'Failed to start play'); return; }
      const { play_no } = data.data;
      window.location.href = `${API_BASE_URL}/play/launch?token=${encodeURIComponent(token.trim())}&play_no=${play_no}`;
    } catch (err) {
      console.error('Error starting play:', err);
      alert('Failed to start play. Please try again.');
    }
  };

  const gameImage = tokenData?.imageUrl || '/images/game-placeholder.png';
  const gameName = tokenData?.gameTitle || 'Game';
  const providerCompany = tokenData?.providerCompany || '—';
  const providerName = tokenData?.providerName || '—';
  const shortDescription = tokenData?.shortDescription || '—';

  const GameSidebar = () => (
    <div className="play-game-card">
      <div className="play-game-card-inner">
        <img src={gameImage} alt={gameName} />
        <h3>{gameName}</h3>
        <p>{shortDescription}</p>
      </div>
    </div>
  );

  if (currentStep === 'token') {
    return (
      <div className="play-page">
        <div className="play-token-card">
          <h2>Enter Game Token</h2>
          <p>Enter your game access token to start playing</p>
          <form onSubmit={handleTokenSubmit} className="play-form">
            <div>
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
              {tokenError && <span className="play-error-text">{tokenError}</span>}
            </div>
            {error && <div className="play-error-banner">{error}</div>}
            <button type="submit" className="play-submit" disabled={loading}>
              {loading ? (<><div className="play-spinner" /> Validating...</>) : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (currentStep === 'details') {
    return (
      <div className="play-page">
        <div className="play-detail-card">
          <div className="play-detail-header">Game Token Registration</div>
          <div className="play-detail-body">
            <div className="play-detail-info">
              <h2>{gameName}</h2>
              <div className="play-detail-meta">
                <p><strong>Sponsored by</strong> {providerName}, {providerCompany}</p>
                <p><strong>User:</strong> {tokenData?.userName || '—'}</p>
                <p><strong>Organization:</strong> {tokenData?.userOrganization || '—'}</p>
              </div>
              {isExpired ? (
                <div className="play-detail-expired">
                  Sorry, this Game Token has expired since it was sent more than 5 days ago.
                  Please ask your provider to resend the Game Token.
                </div>
              ) : (
                <div className="play-detail-message">
                  Complete your registration to start playing. The game will be active for 3 days
                  after registration. You can play any number of times while active.
                </div>
              )}
              {error && <div className="play-error-banner">{error}</div>}
              <form onSubmit={handleCompleteRegistration}>
                <button type="submit" className="play-action-btn" disabled={loading || isExpired}>
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </form>
            </div>
            <GameSidebar />
          </div>
          <div className="play-detail-footer">Powered by AntizTech.com</div>
          <div className="play-detail-bar"><span /><span /><span /></div>
        </div>
      </div>
    );
  }

  // Ready step
  return (
    <div className="play-page">
      <div className="play-detail-card">
        <div className="play-detail-header">Game Statistics &amp; Play</div>
        <div className="play-detail-body">
          <div className="play-detail-info">
            <h2>{gameName}</h2>
            <div className="play-detail-meta">
              <p><strong>Sponsored by</strong> {providerName}, {providerCompany}</p>
              <p><strong>User:</strong> {name.trim() || tokenData?.userName || '—'}</p>
              <p><strong>Organization:</strong> {tokenData?.userOrganization || '—'}</p>
            </div>

            {!isExpired && playHistory && (
              <div className="play-stats">
                <p><strong>Play Statistics:</strong></p>
                <p>Times Played: {playHistory.total_plays}</p>
                <p>Times Passed: {playHistory.total_pass}</p>
                <p>Times Failed: {playHistory.total_fail}</p>
                <p>Times Aborted: {playHistory.total_abort}</p>
                <p>Best Score: {playHistory.best_score ?? '—'}%</p>
              </div>
            )}

            {isExpired ? (
              <div className="play-detail-expired">
                This Game Token has expired after 3 days of use.
                You should have received a Topic Completion Certificate by email with your play statistics.
                Thank you for using Gamified Learning.
              </div>
            ) : (
              <div className="play-time-remaining">
                Game expires in: {getTimeRemaining(tokenData?.registeredAt)}
              </div>
            )}

            <button onClick={handlePlayClick} className="play-action-btn" disabled={isExpired}>
              Play
            </button>
          </div>
          <GameSidebar />
        </div>
        <div className="play-detail-footer">Powered by AntizTech.com</div>
        <div className="play-detail-bar"><span /><span /><span /></div>
      </div>
    </div>
  );
};

export default Play;
