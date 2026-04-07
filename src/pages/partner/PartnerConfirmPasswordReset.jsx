import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import './PartnerLogin.css';

const PartnerConfirmPasswordReset = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleConfirm = async () => {
    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/GamifiedLearning/api/auth/confirm-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message || 'Password has been reset successfully!');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/partner/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to confirm password reset. Please try again.');
      }
    } catch (error) {
      console.error('Confirm password reset error:', error);
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
            <h1>Confirm Password Reset</h1>
            <p>Click the button below to activate your new password</p>
          </div>

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

          {token && !success && (
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <button
                onClick={handleConfirm}
                className="login-button"
                disabled={isLoading}
                style={{ marginBottom: '1rem' }}
              >
                {isLoading ? 'Confirming...' : 'Confirm Password Reset'}
              </button>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '1rem' }}>
                By clicking confirm, your new password will be activated and you can log in immediately.
              </p>
            </div>
          )}

          <div className="login-options">
            <Link to="/partner/login" className="forgot-password-link">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerConfirmPasswordReset;

