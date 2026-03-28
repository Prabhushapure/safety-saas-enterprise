import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import './PartnerAuth.css';

const PartnerConfirmPasswordReset = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) setError('Invalid reset link. Please request a new password reset.');
  }, [token]);

  const handleConfirm = async () => {
    if (!token) { setError('Invalid reset token'); return; }
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/AWE-SaaS/api/auth/confirm-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(data.message || 'Password has been reset successfully!');
        setTimeout(() => navigate('/partner/login'), 3000);
      } else {
        setError(data.message || 'Failed to confirm password reset.');
      }
    } catch (err) {
      console.error('Confirm password reset error:', err);
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
            <h1>Confirm Reset</h1>
            <p>Click below to activate your new password.</p>
          </div>

          {error && <div className="auth-error-banner">{error}</div>}
          {success && <div className="auth-success-banner">{success}</div>}

          {token && !success && (
            <div className="auth-form">
              <button onClick={handleConfirm} className="auth-submit" disabled={isLoading}>
                {isLoading ? 'Confirming...' : 'Confirm Password Reset'}
              </button>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', textAlign: 'center' }}>
                Your new password will be activated immediately.
              </p>
            </div>
          )}

          <div className="auth-footer">
            <Link to="/partner/login" className="auth-link">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerConfirmPasswordReset;
