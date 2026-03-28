import React from 'react';
import { Link } from 'react-router-dom';
import homepage from '../assets/Home-page.jpg';
import homeVideo from '../assets/Home-page1.mp4';
import './Home.css';

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
      </section>

      {/* Features Section */}
      <section className="home-features">
        <div className="home-features-inner">
          <div className="home-feature-card">
            <div className="home-feature-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <h3>Scenario-Based Learning</h3>
            <p>Realistic workplace simulations where trainees identify hazards, make decisions, and learn by doing.</p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3>Simple Token Distribution</h3>
            <p>Send game access tokens to trainees via email. No app downloads, no complex setup — just click and play.</p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <h3>Auto Certification</h3>
            <p>Trainees receive completion certificates with their highest scores automatically after the training window ends.</p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <h3>Track &amp; Measure</h3>
            <p>Monitor trainee engagement, scores, and completion rates through your partner dashboard.</p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="home-cta-banner">
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
