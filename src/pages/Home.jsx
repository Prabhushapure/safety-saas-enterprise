import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import useScrollReveal from '../hooks/useScrollReveal';
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
  const pageRef = useRef(null);
  useScrollReveal(pageRef);

  return (
    <div className="home-page" ref={pageRef}>
      {/* Hero Section */}
      <section className="home-hero">
        <video autoPlay loop muted playsInline preload="auto" poster={homepage} className="home-hero-video">
          <source src={homeVideo} type="video/mp4" />
        </video>
        <div className="home-hero-overlay">
          <div className="home-hero-content">
            <h1 className="home-hero-title" data-reveal data-reveal-delay="100">
              Industrial Training,<br />
              <span className="home-hero-highlight">Reimagined Through Games</span>
            </h1>
            <p className="home-hero-subtitle" data-reveal data-reveal-delay="300">
              Engage your workforce with interactive serious games for safety,
              operations, and compliance training — measurable, scalable, and effective.
            </p>
            <div className="home-hero-actions" data-reveal data-reveal-delay="500">
              <Link to="/store" className="home-btn home-btn-primary">Browse Game Catalog</Link>
              <Link to="/about" className="home-btn home-btn-outline">Learn More</Link>
            </div>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="home-scroll-hint" data-reveal="fade" data-reveal-delay="800">
          <div className="home-scroll-mouse">
            <div className="home-scroll-wheel" />
          </div>
          <div className="home-scroll-chevrons">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </div>
        </div>
        <WaveDivider color="var(--color-gray-50)" />
      </section>

      {/* Features Section */}
      <section className="home-features">
        <div className="home-features-header" data-reveal>
          <h2>Why Gamified Training?</h2>
          <p>Four reasons trainers choose our platform over traditional methods.</p>
        </div>
        <div className="home-features-inner">
          {[
            { num: '01', title: 'Scenario-Based Learning', desc: 'Realistic workplace simulations where trainees identify hazards, make decisions, and learn by doing.' },
            { num: '02', title: 'Simple Token Distribution', desc: 'Send game access tokens to trainees via email. No app downloads, no complex setup — just click and play.' },
            { num: '03', title: 'Auto Certification', desc: 'Trainees receive completion certificates with their highest scores automatically after the training window ends.' },
            { num: '04', title: 'Track & Measure', desc: 'Monitor trainee engagement, scores, and completion rates through your partner dashboard.' },
          ].map((f, i) => (
            <div className="home-feature-card" key={f.num} data-reveal="scale" data-reveal-delay={i * 120}>
              <div className="home-feature-number">{f.num}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="home-cta-banner">
        <AngleDivider color="var(--color-gray-900)" flip />
        <div className="home-cta-inner" data-reveal="fade">
          <h2>Ready to transform your training program?</h2>
          <p>Register as a Partner to access the full catalog, pricing, and distribution tools.</p>
          <Link to="/partner/login" className="home-btn home-btn-primary">Get Started</Link>
        </div>
      </section>

      <footer className="site-footer">
        <p>Powered by <a href="https://antiztech.com" target="_blank" rel="noopener noreferrer">Antiz Technologies</a></p>
      </footer>
    </div>
  );
};

export default Home;
