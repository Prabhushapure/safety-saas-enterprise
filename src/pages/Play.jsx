import React, { useState } from 'react';
import './Play.css';

const API_BASE_URL = '/api';

const Play = () => {
  const [currentStep, setCurrentStep] = useState('token'); // token, email, register, play
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form states
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  
  // Validation states
  const [tokenError, setTokenError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [organizationError, setOrganizationError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const clearErrors = () => {
    setError('');
    setTokenError('');
    setEmailError('');
    setNameError('');
    setOrganizationError('');
  };

  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    clearErrors();

    if (!token.trim()) {
      setTokenError('Token is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/play/validate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setTokenData(data.data);
        
        if (data.data.userId) {
          // Token already has a user assigned, ask for email verification
          setCurrentStep('email');
        } else {
          // Token is unassigned, ask for email to check if user exists
          setCurrentStep('email');
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
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    clearErrors();

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/play/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: token.trim(),
          email: email.trim(),
          hasUserId: !!tokenData.userId
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.userExists) {
          // User exists, assign token and proceed to play
          setCurrentStep('play');
        } else {
          // User doesn't exist, show registration form
          setCurrentStep('register');
        }
      } else {
        setError(data.message || 'Email verification failed');
      }
    } catch (err) {
      console.error('Error verifying email:', err);
      setError('Failed to verify email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
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
      const response = await fetch(`${API_BASE_URL}/play/register-and-assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: token.trim(),
          email: email.trim(),
          name: name.trim(),
          organization: organization.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setCurrentStep('play');
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

  const handlePlayClick = () => {
    // Here you would redirect to the actual game or show game interface
    alert(`Starting ${tokenData?.gameTitle} game! 🎮`);
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

  const renderEmailForm = () => (
    <div className="play-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Enter Email Address</h2>
          <p>
            {tokenData?.userId 
              ? 'Please verify your email address to continue'
              : 'Enter your email to check if you have an existing account'
            }
          </p>
        </div>

        <form onSubmit={handleEmailSubmit} className="play-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className={emailError ? 'error' : ''}
            />
            {emailError && <span className="error-text">{emailError}</span>}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button 
              type="button" 
              className="back-btn" 
              onClick={() => setCurrentStep('token')}
            >
              Back
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Verifying...
                </>
              ) : (
                'Next'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderRegisterForm = () => (
    <div className="play-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Complete Registration</h2>
          <p>Please provide your details to start playing</p>
        </div>

        <form onSubmit={handleRegisterSubmit} className="play-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
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
            <label htmlFor="organization">Organization *</label>
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
            <button 
              type="button" 
              className="back-btn" 
              onClick={() => setCurrentStep('email')}
            >
              Back
            </button>
            <button type="submit" className="submit-btn play-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Creating Account...
                </>
              ) : (
                'Play'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderPlayModal = () => (
    <div className="play-modal success">
      <div className="modal-content">
        <div className="modal-header">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
              <path d="M3 12c1 0 3-1-3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
            </svg>
          </div>
          <h2>Ready to Play!</h2>
          <p>You're now ready to play <strong>{tokenData?.gameTitle}</strong> safety game</p>
        </div>

        <div className="game-info">
          <div className="game-detail">
            <span className="label">Game:</span>
            <span className="value">{tokenData?.gameTitle}</span>
          </div>
          <div className="game-detail">
            <span className="label">License Type:</span>
            <span className="value">{tokenData?.tier}</span>
          </div>
        </div>

        <button onClick={handlePlayClick} className="submit-btn play-btn large">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5,3 19,12 5,21 5,3"/>
          </svg>
          Start Playing
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
      {currentStep === 'email' && renderEmailForm()}
      {currentStep === 'register' && renderRegisterForm()}
      {currentStep === 'play' && renderPlayModal()}
    </div>
  );
};

export default Play;
