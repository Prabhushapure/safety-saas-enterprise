import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="hero-section">
        <h2 className="hero-title">Gamified Training: A Smarter Way to Learn.</h2>
        <p className="hero-subtitle">
          <strong>Gamified Learning</strong> provides the User with <strong>Serious Games</strong> to quickly Learn, gain valuable Experience using virtual environments, realistic simulations, and make training more <strong>engaging, interactive, and effective</strong>.
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
            <h3>Reinforces Operational Practices through Hands-on Learning</h3>
            <p>Realistic simulations allow workers to practice operational tasks in a risk-free environment before facing real situations.</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">⚡</div>
            <h3>Provides Instant Feedback for Improvement</h3>
            <p>Real-time scoring and feedback help learners understand mistakes immediately and improve their knowledge.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default About;
