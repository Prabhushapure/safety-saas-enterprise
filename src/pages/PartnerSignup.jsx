import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PartnerSignup.css';

const PartnerSignup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal details
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Company details
    companyName: '',
    address: '',
    city: '',
    country: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

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

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name cannot be empty';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name cannot be empty';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email cannot be empty';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password cannot be empty';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name cannot be empty';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address cannot be empty';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City cannot be empty';
    }
    
    if (!formData.country.trim()) {
      newErrors.country = 'Country cannot be empty';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep2()) {
      setIsLoading(true);
      setSubmitError('');
      
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            companyName: formData.companyName,
            address: formData.address,
            city: formData.city,
            country: formData.country
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Store user data in localStorage for session management
          localStorage.setItem('partnerUser', JSON.stringify(data.data));
          navigate('/partner/distribute');
        } else {
          setSubmitError(data.message || 'Registration failed. Please try again.');
        }
      } catch (error) {
        console.error('Registration error:', error);
        setSubmitError('Network error. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setErrors({});
  };

  return (
    <div className="partner-signup-page">
      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <h1>Partner Registration</h1>
            <div className="step-indicator">
              <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                <span>1</span>
                <p>Personal Details</p>
              </div>
              <div className="step-connector"></div>
              <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                <span>2</span>
                <p>Company Details</p>
              </div>
            </div>
          </div>

          {currentStep === 1 && (
            <form onSubmit={handleNext} className="signup-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={errors.firstName ? 'error' : ''}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <div className="error-tooltip">
                      {errors.firstName}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={errors.lastName ? 'error' : ''}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <div className="error-tooltip">
                      {errors.lastName}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
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
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Create a password"
                />
                {errors.password && (
                  <div className="error-tooltip">
                    {errors.password}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Re-type your password"
                />
                {errors.confirmPassword && (
                  <div className="error-tooltip">
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              <button type="submit" className="next-button">
                Next Step
              </button>
            </form>
          )}

          {currentStep === 2 && (
            <form onSubmit={handleSubmit} className="signup-form">
              {submitError && (
                <div className="error-message">
                  {submitError}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="companyName">Company Name *</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className={errors.companyName ? 'error' : ''}
                  placeholder="Enter company name"
                />
                {errors.companyName && (
                  <div className="error-tooltip">
                    {errors.companyName}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="address">Address *</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={errors.address ? 'error' : ''}
                  placeholder="Enter company address"
                  rows="3"
                />
                {errors.address && (
                  <div className="error-tooltip">
                    {errors.address}
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={errors.city ? 'error' : ''}
                    placeholder="Enter city"
                  />
                  {errors.city && (
                    <div className="error-tooltip">
                      {errors.city}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="country">Country *</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={errors.country ? 'error' : ''}
                    placeholder="Enter country"
                  />
                  {errors.country && (
                    <div className="error-tooltip">
                      {errors.country}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleBack} className="back-button">
                  Back
                </button>
                <button type="submit" className="submit-button" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Submit Registration'}
                </button>
              </div>
            </form>
          )}

          <div className="signup-footer">
            <span>Already have an account? </span>
            <Link to="/partner/login" className="login-link">
              Login Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerSignup;
