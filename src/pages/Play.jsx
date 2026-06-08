import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Play.css';

const API_BASE_URL = 'api';
const PLAY_PROGRESS_URL = 'https://antiz-digital.com/api/play/progress';

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

        const successPlay = await handlePlayClick();
        if (!successPlay) {
          setCurrentStep('ready');
          fetchPlayHistory(token.trim());
        }
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

  const startNewPlay = async (userToken) => {
    const response = await fetch(`${API_BASE_URL}/play/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: userToken })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to start play');
    }

    return data.data.play_no;
  };

  const getLastPlayNo = async (userToken) => {
    if (playHistory?.last_play_no != null) {
      return Number(playHistory.last_play_no) || 0;
    }

    const historyResponse = await fetch(
      `${API_BASE_URL}/play/history?token=${encodeURIComponent(userToken)}`
    );
    const historyData = await historyResponse.json();

    if (!historyData.success) {
      throw new Error(historyData.message || 'Failed to load play history');
    }

    return Number(historyData.data?.last_play_no) || 0;
  };

  const resolvePlayNo = async (userToken) => {
    const lastPlayNo = await getLastPlayNo(userToken);

    if (lastPlayNo === 0) {
      return startNewPlay(userToken);
    }

    const progressResponse = await fetch(
      `${PLAY_PROGRESS_URL}?token=${encodeURIComponent(userToken)}&play_no=${encodeURIComponent(lastPlayNo)}`
    );

    if (progressResponse.status === 404) {
      return startNewPlay(userToken);
    }

    if (!progressResponse.ok) {
      const errData = await progressResponse.json().catch(() => ({}));
      throw new Error(errData.message || errData.error || 'Failed to check play progress');
    }

    const progressData = await progressResponse.json();
    const progress = progressData.data ?? progressData;
    const allCampsCompleted =
      progress.all_camps_completed ?? progress.allCampsCompleted;

    if (allCampsCompleted) {
      return startNewPlay(userToken);
    }

    const playNo = progress.play_no ?? progress.playNo ?? lastPlayNo;
    if (playNo == null || playNo === '') {
      throw new Error('Failed to load play progress');
    }

    return playNo;
  };

  const handlePlayClick = async () => {
    const userToken = token.trim();

    try {
      const play_no = await resolvePlayNo(userToken);
      const url = `${API_BASE_URL}/play/launch?token=${encodeURIComponent(userToken)}&play_no=${encodeURIComponent(play_no)}`;
      window.location.href = url;
      return true;
    } catch (err) {
      console.error('Error starting play:', err);
      alert(err.message || 'Failed to start play. Please try again.');
      return false;
    }
  };


  const renderTokenForm = () => (
    <div className="play-modal play-token-modal">
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

  const renderGameTile = (gameImage, gameName, shortDescription) => (
    <div className="play-game-tile">
      <img src={gameImage} alt={gameName} className="play-game-tile-image" />
      <h3 className="play-game-tile-title">{gameName}</h3>
      <p className="play-game-tile-desc">{shortDescription}</p>
    </div>
  );

  const renderColorBar = () => (
    <div className="play-color-bar" aria-hidden="true">
      <span className="play-color-bar-seg play-color-bar-seg-1" />
      <span className="play-color-bar-seg play-color-bar-seg-2" />
      <span className="play-color-bar-seg play-color-bar-seg-3" />
      <span className="play-color-bar-seg play-color-bar-seg-4" />
    </div>
  );

  const renderDetailsForm = () => {
    const gameImage = tokenData?.imageUrl || '/images/game-placeholder.png';
    const gameName = tokenData?.gameTitle || 'Game';
    const providerCompany = tokenData?.providerCompany || '—';
    const providerName = tokenData?.providerName || '—';
    const shortDescription = tokenData?.shortDescription || '—';

    return (
      <div className="play-modal play-game-modal">
        <div className="play-game-card">
          <div className="play-game-card-header">GAME TOKEN REGISTRATION</div>

          <div className="play-game-card-body">
            <div className="play-game-card-main">
              <h2 className="play-game-title">{gameName}</h2>

              <div className="play-game-meta">
                <p><b>Sponsored by</b> {providerName}, {providerCompany}.</p>
                <p><b>User Name:</b> {tokenData?.userName || '—'}</p>
                <p><b>Organization:</b> {tokenData?.userOrganization || '—'}</p>
              </div>

              <div className="play-game-message">
                {isExpired ? (
                  <p className="play-game-expired">
                    Sorry, this Game Token has expired since it was sent more than 5 days earlier.
                    <br /><br />
                    Please ask your provider to resend the Game Token.
                  </p>
                ) : (
                  <p>
                    Please complete Registration and start playing the Game. The Game will be active
                    for 3 days after Registration. You can play this Game on Windows PC, Android and
                    iOS smartphones &amp; Tablets. You can play this game any number of times while it is active.
                  </p>
                )}
              </div>

              <form onSubmit={handleCompleteRegistration} className="play-game-actions">
                {error && <div className="error-message">{error}</div>}
                {!isExpired && (
                  <button type="submit" className="play-action-btn" disabled={loading}>
                    {loading ? 'Registering & Launching...' : 'REGISTER & PLAY'}
                  </button>
                )}
              </form>
            </div>

            <div className="play-game-card-side">
              {renderGameTile(gameImage, gameName, shortDescription)}
            </div>
          </div>

          <div className="play-game-card-footer">Powered by AntizTech.com</div>
          {renderColorBar()}
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
    // Use stats API shape (same as completion email), not tokenData.gameId alone
    const showIncompleteStats =
      playHistory?.total_incomplete != null || Number(playHistory?.game_id) === 43;
    const bestScoreSuffix =
      playHistory?.score_display_percent === false || Number(playHistory?.game_id) === 43
        ? ''
        : '%';

    return (
      <div className="play-modal play-game-modal">
        <div className="play-game-card">
          <div className="play-game-card-header">GAME STATISTICS &amp; PLAY</div>

          <div className="play-game-card-body">
            <div className="play-game-card-main">
              <h2 className="play-game-title">{gameName}</h2>

              <div className="play-game-meta">
                <p><b>Sponsored by</b> {providerName}, {providerCompany}.</p>
                <p><b>User Name:</b> {name.trim() || tokenData?.userName || '—'}</p>
                <p><b>Organization:</b> {tokenData?.userOrganization || '—'}</p>
              </div>

              {!isExpired && playHistory && (
                <div className="play-game-stats">
                  <p className="play-game-stats-title">Play Statistics:</p>
                  <p>Number of times Played: {playHistory.total_plays}</p>
                  <p>Number of times Passed: {playHistory.total_pass}</p>
                  {showIncompleteStats ? (
                    <p>Number of times Incomplete: {playHistory.total_incomplete ?? 0}</p>
                  ) : (
                    <p>Number of Times Failed: {playHistory.total_fail ?? 0}</p>
                  )}
                  <p>Number of times aborted: {playHistory.total_abort}</p>
                  <p>Best Score: {playHistory.best_score ?? '—'}{bestScoreSuffix}</p>
                </div>
              )}

              {isExpired ? (
                <p className="play-game-expired">
                  This Game Token has already been utilized for 3 days and has expired.
                  <br /><br />
                  You would have got a Topic Completion Certificate by email with Play Statistics.
                  <br /><br />
                  Thank you for using this Game Token for Gamified Learning.
                </p>
              ) : (
                <p className="play-game-expiry">
                  Game Expiry time remaining: {getTimeRemaining(tokenData?.registeredAt)}
                </p>
              )}

              <div className="play-game-actions">
                {!isExpired && (
                  <button type="button" className="play-action-btn" onClick={handlePlayClick}>
                    PLAY
                  </button>
                )}
              </div>
            </div>

            <div className="play-game-card-side">
              {renderGameTile(gameImage, gameName, shortDescription)}
            </div>
          </div>

          <div className="play-game-card-footer">Powered by AntizTech.com</div>
          {renderColorBar()}
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
