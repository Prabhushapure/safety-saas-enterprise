import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setLoginTimestamp } from '../../hooks/usePartnerAuth';
import './PartnerAuth.css';

const PartnerLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email cannot be empty';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password cannot be empty';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      setLoginError('');
      try {
        const response = await fetch('/AWE-SaaS/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('partnerUser', JSON.stringify(data.data));
          setLoginTimestamp();
          navigate('/partner/home');
        } else {
          setLoginError(data.message || 'Login failed. Please try again.');
        }
      } catch (error) {
        console.error('Login error:', error);
        setLoginError('Network error. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1>Partner Login</h1>
            <p>Sign in to manage your training games and trainees.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {loginError && (
              <div className="auth-error-banner">{loginError}</div>
            )}

            <div className="auth-field">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="you@company.com"
              />
              {errors.email && <span className="auth-field-error">{errors.email}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'error' : ''}
                placeholder="Enter your password"
              />
              {errors.password && <span className="auth-field-error">{errors.password}</span>}
            </div>

            <button type="submit" className="auth-submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/partner/forgot-password" className="auth-link">
              Forgot Password?
            </Link>
            <div className="auth-divider" />
            <p className="auth-alt">
              Don't have an account?{' '}
              <a
                href="https://antiz.saasifynow.com/surpaas/market?app=true&h=73a3a68c852cd63862b9b37cf3689c07&lang=en#"
                className="auth-link-strong"
              >
                Register Now
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerLogin;
