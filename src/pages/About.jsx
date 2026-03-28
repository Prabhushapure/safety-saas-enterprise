import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <h1>Gamified Training:<br />A Smarter Way to Learn</h1>
          <p>
            A cloud-based platform that uses interactive serious games to improve industrial
            training outcomes — making safety and operational training more engaging, measurable,
            and scalable.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="about-section">
        <div className="about-section-inner">
          <h2 className="about-section-title">How It Works</h2>
          <div className="about-steps">
            <div className="about-step">
              <div className="about-step-number">1</div>
              <h3>Browse &amp; Select</h3>
              <p>Trainers browse the game catalog and pick training modules relevant to their workforce needs.</p>
            </div>
            <div className="about-step-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </div>
            <div className="about-step">
              <div className="about-step-number">2</div>
              <h3>Distribute Tokens</h3>
              <p>Send game access tokens to trainees via email. Each token is valid for 3 days from first use.</p>
            </div>
            <div className="about-step-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </div>
            <div className="about-step">
              <div className="about-step-number">3</div>
              <h3>Play &amp; Improve</h3>
              <p>Trainees play the game multiple times, improving their scores during the validity window.</p>
            </div>
            <div className="about-step-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </div>
            <div className="about-step">
              <div className="about-step-number">4</div>
              <h3>Auto Certify</h3>
              <p>Upon token expiry, a completion certificate with the highest score is emailed automatically.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="about-section about-section-alt">
        <div className="about-section-inner">
          <h2 className="about-section-title">Key Benefits</h2>
          <div className="about-benefits">
            <div className="about-benefit">
              <div className="about-benefit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <h3>Higher Engagement</h3>
              <p>Interactive gameplay and competitive elements like scoring and achievements drive deeper learner engagement than traditional methods.</p>
            </div>
            <div className="about-benefit">
              <div className="about-benefit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <h3>Hands-On Practice</h3>
              <p>Realistic workplace simulations let workers practice operational tasks in a risk-free virtual environment before real situations.</p>
            </div>
            <div className="about-benefit">
              <div className="about-benefit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>
                </svg>
              </div>
              <h3>Instant Feedback</h3>
              <p>Real-time scoring helps learners understand mistakes immediately and track their improvement over multiple attempts.</p>
            </div>
            <div className="about-benefit">
              <div className="about-benefit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <h3>Scalable Distribution</h3>
              <p>Token-based email distribution scales training to any number of trainees without complex logistics or app installations.</p>
            </div>
            <div className="about-benefit">
              <div className="about-benefit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/>
                </svg>
              </div>
              <h3>Auto Certification</h3>
              <p>Completion certificates are generated and emailed automatically, eliminating manual tracking and paperwork for trainers.</p>
            </div>
            <div className="about-benefit">
              <div className="about-benefit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h3>Usage-Based Billing</h3>
              <p>Pay only for tokens used. Choose Trial, Partner, or Enterprise plans to match your organization's training needs and budget.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="about-section">
        <div className="about-section-inner">
          <h2 className="about-section-title">Who Is This For?</h2>
          <div className="about-audience">
            <div className="about-audience-item">Safety &amp; EHS Trainers</div>
            <div className="about-audience-item">Industrial Training Consultants</div>
            <div className="about-audience-item">Manufacturing &amp; Plant Managers</div>
            <div className="about-audience-item">L&amp;D Teams</div>
            <div className="about-audience-item">Technical Institutes</div>
            <div className="about-audience-item">Training Providers</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="about-cta-inner">
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
