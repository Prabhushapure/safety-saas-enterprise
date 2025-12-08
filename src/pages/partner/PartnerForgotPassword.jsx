import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PartnerLogin.css';

const PartnerForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    // Clear errors when user starts typing
    if (error) {
      setError('');
    }
    if (success) {
      setSuccess('');
    }
  };

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Email cannot be empty');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/AWE-SaaS/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message || 'Password reset email has been sent successfully. Please check your email.');
        setEmail('');
        // Optionally redirect to login after a delay
        setTimeout(() => {
          navigate('/partner/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to send password reset email. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="partner-login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Forgot Password</h1>
            <p>Enter your email to reset your password</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            {success && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#166534',
                padding: '1rem',
                borderRadius: '12px',
                fontSize: '0.875rem',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                {success}
              </div>
            )}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleInputChange}
                className={error ? 'error' : ''}
                placeholder="Enter your email"
                disabled={isLoading}
              />
              {error && (
                <div className="error-tooltip">
                  {error}
                </div>
              )}
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Email'}
            </button>
          </form>

          <div className="login-options">
            <Link to="/partner/login" className="forgot-password-link">
              Back to Login
            </Link>
            <div className="register-section">
              <span>Don't have an account? </span>
              <a
                href="https://antiz.saasifynow.com/surpaas/market?app=true&h=73a3a68c852cd63862b9b37cf3689c07&lang=en#"
                className="register-link"
              >
                Register Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerForgotPassword;

