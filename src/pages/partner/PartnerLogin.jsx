import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PartnerLogin.css';

const PartnerLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
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
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Store user data in localStorage for session management
          localStorage.setItem('partnerUser', JSON.stringify(data.data));
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
    <div className="partner-login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Partner Login</h1>
            <p>Access your partner dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {loginError && (
              <div className="error-message">
                {loginError}
              </div>
            )}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter your email"
              />
              {errors.email && (
                <div className="error-tooltip">
                  {errors.email}
                </div>
              )}
            </div>

            <div className="form-group">
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
              {errors.password && (
                <div className="error-tooltip">
                  {errors.password}
                </div>
              )}
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="login-options">
            <Link to="/partner/forgot-password" className="forgot-password-link">
              Forgot Password?
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

export default PartnerLogin;
