import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PartnerHelp.css';

const PartnerHelp = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [activeSection, setActiveSection] = useState('faq');

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('partnerUser');
    if (!storedUser) {
      navigate('/partner/login');
      return;
    }
    
    try {
      const user = JSON.parse(storedUser);
      setUserData(user);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/partner/login');
    }
  }, [navigate]);

  if (!userData) {
    return (
      <div className="partner-help-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const faqData = [
    {
      question: "How do I purchase game licenses?",
      answer: "You can purchase game licenses through the Licenses section. Browse available games, select the ones you need, and complete the purchase process."
    },
    {
      question: "How do I distribute games to my team?",
      answer: "Once you have active licenses, go to the Distribute section to assign games to your team members. You can create user accounts and manage access permissions."
    },
    {
      question: "Can I track my team's progress?",
      answer: "Yes! The Metrics Dashboard provides comprehensive analytics including completion rates, performance scores, and usage statistics for all distributed games."
    },
    {
      question: "What happens when a license expires?",
      answer: "When a license expires, users will no longer have access to that game. You'll receive notifications 30 days before expiration to renew your licenses."
    },
    {
      question: "How do I add more users to my account?",
      answer: "You can add users through the Distribute section. Each user will receive login credentials to access their assigned safety games."
    }
  ];

  return (
    <div className="partner-help-page">
      <div className="partner-help-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <Link to="/partner/home" className="back-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5"/>
                <path d="M12 19l-7-7 7-7"/>
              </svg>
              Back to Home
            </Link>
            <h1>Help & Support</h1>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="action-card">
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3>Live Chat</h3>
            <p>Chat with our support team</p>
            <button className="action-button">Start Chat</button>
          </div>

          <div className="action-card">
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h3>Email Support</h3>
            <p>Send us a detailed message</p>
            <button className="action-button">Send Email</button>
          </div>

          <div className="action-card">
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <h3>Phone Support</h3>
            <p>Call us directly</p>
            <button className="action-button">Call Now</button>
          </div>
        </div>

        {/* Help Content */}
        <div className="help-content">
          <div className="help-navigation">
            <button 
              className={`nav-button ${activeSection === 'faq' ? 'active' : ''}`}
              onClick={() => setActiveSection('faq')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              FAQ
            </button>
            <button 
              className={`nav-button ${activeSection === 'guides' ? 'active' : ''}`}
              onClick={() => setActiveSection('guides')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              Guides
            </button>
            <button 
              className={`nav-button ${activeSection === 'contact' ? 'active' : ''}`}
              onClick={() => setActiveSection('contact')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 4L3 11l4 4 4-4 6 6-4 4"/>
              </svg>
              Contact
            </button>
          </div>

          <div className="help-section">
            {activeSection === 'faq' && (
              <div className="faq-section">
                <h2>Frequently Asked Questions</h2>
                <div className="faq-list">
                  {faqData.map((item, index) => (
                    <div key={index} className="faq-item">
                      <h3>{item.question}</h3>
                      <p>{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'guides' && (
              <div className="guides-section">
                <h2>User Guides</h2>
                <div className="guides-grid">
                  <div className="guide-card">
                    <h3>Getting Started</h3>
                    <p>Learn the basics of managing your safety games platform</p>
                    <button className="guide-button">Read Guide</button>
                  </div>
                  <div className="guide-card">
                    <h3>License Management</h3>
                    <p>How to purchase, renew, and manage your game licenses</p>
                    <button className="guide-button">Read Guide</button>
                  </div>
                  <div className="guide-card">
                    <h3>User Distribution</h3>
                    <p>Step-by-step guide to distributing games to your team</p>
                    <button className="guide-button">Read Guide</button>
                  </div>
                  <div className="guide-card">
                    <h3>Analytics & Reporting</h3>
                    <p>Understanding your metrics dashboard and reports</p>
                    <button className="guide-button">Read Guide</button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'contact' && (
              <div className="contact-section">
                <h2>Contact Information</h2>
                <div className="contact-info">
                  <div className="contact-item">
                    <div className="contact-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <div>
                      <h3>Email Support</h3>
                      <p>support@safetygames.com</p>
                      <span>Response within 24 hours</span>
                    </div>
                  </div>
                  <div className="contact-item">
                    <div className="contact-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </div>
                    <div>
                      <h3>Phone Support</h3>
                      <p>+1 (555) 123-4567</p>
                      <span>Mon-Fri, 9AM-6PM EST</span>
                    </div>
                  </div>
                  <div className="contact-item">
                    <div className="contact-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                    <div>
                      <h3>Office Address</h3>
                      <p>123 Safety Street<br/>Business District<br/>City, State 12345</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerHelp;
