import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PartnerAuth.css';

const PartnerForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateEmail = () => {
    if (!email.trim()) { setError('Email cannot be empty'); return false; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/AWE-SaaS/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(data.message || 'Password reset email has been sent. Please check your email.');
        setEmail('');
        setTimeout(() => navigate('/partner/login'), 3000);
      } else {
        setError(data.message || 'Failed to send password reset email.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1>Forgot Password</h1>
            <p>Enter your email and we'll send you a reset link.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error-banner">{error}</div>}
            {success && <div className="auth-success-banner">{success}</div>}

            <div className="auth-field">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleInputChange}
                className={error ? 'error' : ''}
                placeholder="you@company.com"
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="auth-submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/partner/login" className="auth-link">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerForgotPassword;
