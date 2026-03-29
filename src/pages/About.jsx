import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import useScrollReveal from '../hooks/useScrollReveal';
import './About.css';

const WaveDivider = ({ color = '#ffffff', flip = false }) => (
  <div className={`about-wave ${flip ? 'about-wave-flip' : ''}`}>
    <svg viewBox="0 0 1440 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} d="M0,30 C320,90 720,10 1080,70 C1200,90 1380,30 1440,50 L1440,100 L0,100 Z" />
    </svg>
  </div>
);

const About = () => {
  const pageRef = useRef(null);
  useScrollReveal(pageRef);

  const steps = [
    { n: '1', title: 'Browse & Select', desc: 'Trainers browse the game catalog and pick training modules relevant to their workforce needs.' },
    { n: '2', title: 'Distribute Tokens', desc: 'Send game access tokens to trainees via email. Each token is valid for 3 days from first use.' },
    { n: '3', title: 'Play & Improve', desc: 'Trainees play the game multiple times, improving their scores during the validity window.' },
    { n: '4', title: 'Auto Certify', desc: 'Upon token expiry, a completion certificate with the highest score is emailed automatically.' },
  ];

  const benefits = [
    { icon: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>, title: 'Higher Engagement', desc: 'Interactive gameplay and competitive elements like scoring and achievements drive deeper learner engagement than traditional methods.' },
    { icon: <><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></>, title: 'Hands-On Practice', desc: 'Realistic workplace simulations let workers practice operational tasks in a risk-free virtual environment before real situations.' },
    { icon: <><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></>, title: 'Instant Feedback', desc: 'Real-time scoring helps learners understand mistakes immediately and track their improvement over multiple attempts.' },
    { icon: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>, title: 'Scalable Distribution', desc: 'Token-based email distribution scales training to any number of trainees without complex logistics or app installations.' },
    { icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></>, title: 'Auto Certification', desc: 'Completion certificates are generated and emailed automatically, eliminating manual tracking and paperwork for trainers.' },
    { icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>, title: 'Usage-Based Billing', desc: 'Pay only for tokens used. Choose Trial, Partner, or Enterprise plans to match your organization\'s training needs and budget.' },
  ];

  const audiences = [
    { title: 'Safety & EHS Trainers', icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></> },
    { title: 'Industrial Training Consultants', icon: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></> },
    { title: 'Manufacturing & Plant Managers', icon: <><path d="M2 20h20"/><path d="M5 20V8l5 4V4l5 4V8l5 4v8"/></> },
    { title: 'L&D Teams', icon: <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></> },
    { title: 'Technical Institutes', icon: <><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 6 3 12 0v-5"/></> },
    { title: 'Training Providers', icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
  ];

  return (
    <div className="about-page" ref={pageRef}>
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <span className="about-hero-label" data-reveal="fade" data-reveal-delay="0">About the Platform</span>
          <h1 data-reveal data-reveal-delay="150">Gamified Training:<br />A Smarter Way to Learn</h1>
          <p data-reveal data-reveal-delay="300">
            A cloud-based platform that uses interactive serious games to improve industrial
            training outcomes — making safety and operational training more engaging, measurable,
            and scalable.
          </p>
        </div>
        <WaveDivider color="var(--color-white)" />
      </section>

      {/* How It Works */}
      <section className="about-section about-how">
        <div className="about-section-inner">
          <h2 className="about-section-title" data-reveal>How It Works</h2>
          <div className="about-steps">
            {steps.map((s, i) => (
              <React.Fragment key={s.n}>
                {i > 0 && <div className="about-step-connector" />}
                <div className="about-step" data-reveal="scale" data-reveal-delay={i * 150}>
                  <div className="about-step-number">{s.n}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="about-section about-benefits-section">
        <WaveDivider color="var(--color-gray-900)" flip />
        <div className="about-section-inner">
          <h2 className="about-section-title about-title-light" data-reveal="fade">Key Benefits</h2>
          <div className="about-benefits">
            {benefits.map((b, i) => (
              <div className="about-benefit" key={b.title} data-reveal="scale" data-reveal-delay={i * 100}>
                <div className="about-benefit-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{b.icon}</svg>
                </div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <WaveDivider color="var(--color-white)" />
      </section>

      {/* Target Audience */}
      <section className="about-section about-audience-section">
        <div className="about-section-inner">
          <h2 className="about-section-title" data-reveal>Who Is This For?</h2>
          <div className="about-audience">
            {audiences.map((a, i) => (
              <div className="about-audience-card" key={a.title} data-reveal="scale" data-reveal-delay={i * 100}>
                <div className="about-audience-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{a.icon}</svg>
                </div>
                <span>{a.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="about-cta-inner" data-reveal="fade">
          <h2>Start Using Gamified Training Today</h2>
          <p>Register as a Partner to browse the full catalog, send tokens, and track trainee progress.</p>
          <div className="about-cta-buttons">
            <Link to="/store" className="about-btn about-btn-primary">Browse Catalog</Link>
            <Link to="/partner/login" className="about-btn about-btn-outline">Partner Login</Link>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <p>Powered by <a href="https://antiztech.com" target="_blank" rel="noopener noreferrer">Antiz Technologies</a></p>
      </footer>
    </div>
  );
};

export default About;
