import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { setEnterpriseSession } from '../../hooks/useEnterpriseAuth';
import '../partner/PartnerLogin.css';

const EnterpriseLogin = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (!slug) {
      setLoginError('Missing company URL.');
    }
  }, [slug]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    if (!slug || !validateForm()) return;

    setIsLoading(true);
    setLoginError('');

    try {
      const response = await fetch(`/GamifiedLearning/api/enterprise/${slug}/login`, {
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
        setEnterpriseSession(data.data);
        if (data.data.role === 'employee') {
          navigate(`/e/${slug}/my-games`);
        } else {
          navigate(`/e/${slug}/admin`);
        }
      } else {
        setLoginError(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Enterprise login error:', error);
      setLoginError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="partner-login-page">
      <div className="login-header-banner">
        <p>
          <strong>Enterprise login</strong> for {slug || 'your company'}.
        </p>
      </div>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Enterprise Login</h1>
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

            <button type="submit" className="login-button" disabled={isLoading || !slug}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseLogin;
