import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="hero-section">
        <h1 className="hero-title">Gamified Safety Training: A Smarter Way to Learn</h1>
        <p className="hero-subtitle">
          Gamified Learning combines <strong>Serious Games</strong> (realistic safety simulations) 
          and <strong>Gamification</strong> (points, badges, leaderboards) to make safety training 
          more <strong>engaging, interactive, and effective</strong>.
        </p>
      </div>

      <div className="benefits-section">
        <h2 className="section-title">Key Benefits:</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">🚀</div>
            <h3>Boosts Engagement and Retention</h3>
            <p>Interactive gameplay improves retention while competitive elements like leaderboards and achievements drive deeper engagement.</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">🎯</div>
            <h3>Reinforces Safe Practices Through Hands-on Learning</h3>
            <p>Realistic simulations allow workers to practice safety procedures in a risk-free environment before facing real situations.</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">⚡</div>
            <h3>Provides Instant Feedback for Improvement</h3>
            <p>Real-time scoring and feedback help learners understand mistakes immediately and improve their safety knowledge.</p>
          </div>
        </div>
      </div>

      <div className="impact-section">
        <div className="impact-content">
          <h2 className="impact-title">Building a Strong Safety Culture</h2>
          <p className="impact-description">
            It helps organizations build a <strong>strong safety culture</strong> and better prepare 
            workers for real-world risks. Our platform transforms traditional safety training from 
            a compliance checkbox into an engaging learning experience that workers actually want to complete.
          </p>
          
          <div className="features-list">
            <h3>Platform Features:</h3>
            <ul>
              <li>Realistic safety scenario simulations</li>
              <li>Interactive gamification elements</li>
              <li>Progress tracking and analytics</li>
              <li>Customizable training modules</li>
              <li>Multi-device accessibility</li>
              <li>Comprehensive reporting dashboard</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to Transform Your Safety Training?</h2>
        <p>Join organizations worldwide who are revolutionizing workplace safety through gamified learning.</p>
        <div className="cta-buttons">
          <button className="cta-primary">Get Started</button>
          <button className="cta-secondary">Learn More</button>
        </div>
      </div>
    </div>
  );
};

export default About;
