import React from 'react';
import { Link } from 'react-router-dom';
import homepage from '../assets/Home-page.jpg';
import homeVideo from '../assets/Home-page1.mp4';
import './Home.css';

const WaveDivider = ({ color = '#ffffff', flip = false, className = '' }) => (
  <div className={`wave-divider ${flip ? 'wave-flip' : ''} ${className}`}>
    <svg viewBox="0 0 1440 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} d="M0,40 C360,100 1080,0 1440,60 L1440,100 L0,100 Z" />
    </svg>
  </div>
);

const AngleDivider = ({ color = '#ffffff', flip = false }) => (
  <div className={`angle-divider ${flip ? 'angle-flip' : ''}`}>
    <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <polygon fill={color} points="0,60 1440,0 1440,60" />
    </svg>
  </div>
);

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="home-hero">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={homepage}
          className="home-hero-video"
        >
          <source src={homeVideo} type="video/mp4" />
        </video>

        <div className="home-hero-overlay">
          <div className="home-hero-content">
            <h1 className="home-hero-title">
              Industrial Training,<br />
              <span className="home-hero-highlight">Reimagined Through Games</span>
            </h1>
            <p className="home-hero-subtitle">
              Engage your workforce with interactive serious games for safety,
              operations, and compliance training — measurable, scalable, and effective.
            </p>
            <div className="home-hero-actions">
              <Link to="/store" className="home-btn home-btn-primary">
                Browse Game Catalog
              </Link>
              <Link to="/about" className="home-btn home-btn-outline">
                Learn More
              </Link>
            </div>
          </div>
        </div>
        <WaveDivider color="var(--color-gray-50)" />
      </section>

      {/* Features Section */}
      <section className="home-features">
        <div className="home-features-header">
          <h2>Why Gamified Training?</h2>
          <p>Four reasons trainers choose our platform over traditional methods.</p>
        </div>
        <div className="home-features-inner">
          <div className="home-feature-card">
            <div className="home-feature-number">01</div>
            <h3>Scenario-Based Learning</h3>
            <p>Realistic workplace simulations where trainees identify hazards, make decisions, and learn by doing.</p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-number">02</div>
            <h3>Simple Token Distribution</h3>
            <p>Send game access tokens to trainees via email. No app downloads, no complex setup — just click and play.</p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-number">03</div>
            <h3>Auto Certification</h3>
            <p>Trainees receive completion certificates with their highest scores automatically after the training window ends.</p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-number">04</div>
            <h3>Track &amp; Measure</h3>
            <p>Monitor trainee engagement, scores, and completion rates through your partner dashboard.</p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="home-cta-banner">
        <AngleDivider color="var(--color-gray-900)" flip />
        <div className="home-cta-inner">
          <h2>Ready to transform your training program?</h2>
          <p>Register as a Partner to access the full catalog, pricing, and distribution tools.</p>
          <Link to="/partner/login" className="home-btn home-btn-primary">
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <p>Powered by <a href="https://antiztech.com" target="_blank" rel="noopener noreferrer">Antiz Technologies</a></p>
      </footer>
    </div>
  );
};

export default Home;
