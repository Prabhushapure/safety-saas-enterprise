import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePartnerAuth, clearLoginTimestamp } from '../../hooks/usePartnerAuth';
import './PartnerHelp.css';


const API_BASE_URL = '/AWE-SaaS/api';

const PartnerHelp = () => {
  const navigate = useNavigate();
  const { userData, isLoading } = usePartnerAuth();
  const [activeSection, setActiveSection] = useState('faq');
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);

  if (isLoading || !userData) {
    return (
      <div className="partner-help-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const faqData = [
    {
      question: "Who can become a Partner on the platform?",
      answer: "Independent Safety Trainers, Safety Consultants, Safety Training Institutes, and enterprise-employed EHS or Safety Trainers can register as Partners."
    },
    {
      question: "What does a Partner get access to after registration?",
      answer: "Partners can access the game catalogue, review available safety games, use a Trial Plan, and distribute selected games to trainees."
    },
    {
      question: "Is there a trial option before committing as a Partner?",
      answer: "Yes. Partners can review and experience the games through a Trial Plan before making a purchase commitment."
    },
    {
      question: "What type of safety topics do the games cover?",
      answer: "Topics include Electrical Safety, Machine Safety, Fire Safety, PPE Compliance, and other workplace safety scenarios."
    },
    {
      question: "How are the safety games delivered to trainees?",
      answer: "Games are delivered via unique, time-bound game licenses (Game Tokens) sent to trainees by email."
    },
    {
      question: "What is a Game Token?",
      answer: "GA Game Token is a unique license generated for each trainee and each game, enabling access to the selected safety game."
    },
    {
      question: "When does a Game Token become active?",
      answer: "The Game Token activates when the trainee uses it for the first time."
    },
    {
      question: "How long is a Game Token valid?",
      answer: "Each Game Token is valid for three (3) days from the first use."
    },
    {
      question: "Can trainees play the game multiple times within the validity period?",
      answer: "Yes. Trainees can replay the game multiple times during the 3-day active period."
    },
    {
      question: "What happens after the Game Token expires?",
      answer: "The game access expires automatically, and a Game Completion Certificate is emailed to the trainee."
    },
    {
      question: "How is trainee performance assessed in the game?",
      answer: "Trainees identify hazards and answer three quiz questions per hazard. Scores are calculated as a percentage."
    },
    {
      question: "What is the pass criteria for the game?",
      answer: "A score of 80% or above is considered a pass. Scores below 80% are marked as fail."
    },
    {
      question: "Does the certificate reflect the best attempt?",
      answer: "Yes. The Game Completion Certificate reflects the highest score achieved during the validity period."
    },
    {
      question: "Are learning resources available inside the game?",
      answer: "Yes. Games include an in-game toolbar with safety guidelines, SOPs, learning videos, PPE mini-games, and reference documents."
    },
    {
      question: "Is any software installation required for Partners or trainees?",
      answer: "No. The platform is cloud-based and accessed via a secure web portal."
    },
    {
      question: "How do Partners select and distribute games?",
      answer: "Partners choose games from the catalogue and distribute them by assigning Game Tokens to trainee email IDs."
    },
    {
      question: "How is Partner billing handled?",
      answer: "Partners are periodically invoiced based on the number of Game Tokens used by trainees."
    },
    {
      question: "Is pricing visible before purchase?",
      answer: "Yes. The Games Catalogue displays available games along with their pricing."
    },
    {
      question: "Can these games be used alongside existing safety training programs?",
      answer: "Yes. The serious games are designed to complement classroom training, workshops, and other safety learning initiatives."
    },
    {
      question: "What value do these games add for Partners?",
      answer: "They provide engaging, immersive, assessment-driven training, automated certification, measurable results, and scalable delivery without logistical complexity."
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
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <h1>Help & Support</h1>
            {/* Right-side Unsubscribe */}
            <a
              href="#"
              className="unsubscribe-link"
              style={{
                pointerEvents: isUnsubscribing ? "none" : "auto",
                opacity: isUnsubscribing ? 0.6 : 1
              }}
              onClick={async (e) => {
                e.preventDefault();

                if (isUnsubscribing) return;

                if (!window.confirm("Are you sure you want to unsubscribe?")) return;

                try {
                  setIsUnsubscribing(true);

                  // ✅ force UI update
                  await new Promise(resolve => setTimeout(resolve, 100));

                  const res = await fetch(`${API_BASE_URL}/auth/unsubscribe`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      businessPartnerId: userData.id
                    })
                  });

                  const data = await res.json();

                  if (!data.success) {
                    console.log("Error:", data.message);
                    return;
                  }

                  // ✅ SUCCESS (no alert blocking)
                  console.log("Unsubscribed successfully");

                  setTimeout(() => {
                    localStorage.removeItem("partnerUser");
                    clearLoginTimestamp();
                    navigate("/partner/login");

                    // ✅ stop loading AFTER redirect
                    setIsUnsubscribing(false);
                  }, 1000);

                } catch (err) {
                  console.error(err);
                  setIsUnsubscribing(false); // only here
                }
              }}
            >
              {isUnsubscribing ? "Unsubscribing..." : "Unsubscribe"}
            </a>

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
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Partner FAQs
            </button>
            <button
              className={`nav-button ${activeSection === 'guides' ? 'active' : ''}`}
              onClick={() => setActiveSection('guides')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              Guides
            </button>
            <button
              className={`nav-button ${activeSection === 'contact' ? 'active' : ''}`}
              onClick={() => setActiveSection('contact')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 4L3 11l4 4 4-4 6 6-4 4" />
              </svg>
              Contact
            </button>
          </div>

          <div className="help-section">
            {activeSection === 'faq' && (
              <div className="faq-section">
                <h2>Partner FAQs</h2>
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
                <h2>Partner Onboarding Guide</h2>

                <section className="guide-block">
                  <h3>Welcome</h3>
                  <p>
                    Welcome to the <strong>Safety Serious Games Platform</strong>. This onboarding guide
                    is designed to help Safety Trainers, Consultants, Institutes, and EHS professionals
                    quickly understand the platform, set up their Partner account, and start delivering
                    impactful, scenario-based safety training using serious games.
                  </p>
                </section>

                <section className="guide-block">
                  <h3>1. About the Platform</h3>
                  <p>
                    The Safety Serious Games Platform is a cloud-based SaaS solution offering immersive,
                    3D, scenario-driven safety games. These games complement traditional safety training
                    programs by improving engagement, knowledge retention, and assessment effectiveness.
                  </p>
                  <ul>
                    <li>Deliver interactive safety training remotely or in blended programs</li>
                    <li>Assess trainee understanding through gameplay and quizzes</li>
                    <li>Automatically issue completion certificates</li>
                  </ul>
                </section>

                <section className="guide-block">
                  <h3>2. Who Can Become a Partner</h3>
                  <ul>
                    <li>Independent Safety Trainers and Safety Consultants</li>
                    <li>Safety Training Institutes</li>
                    <li>Enterprise Safety Trainers and EHS Professionals</li>
                  </ul>
                </section>

                <section className="guide-block">
                  <h3>3. Partner Registration Process</h3>
                  <ol>
                    <li>Visit the platform website</li>
                    <li>Register as a Partner with professional and organizational details</li>
                    <li>Verify your email address</li>
                    <li>Log in to access the Partner dashboard</li>
                  </ol>
                  <p>Once registered, you can explore the game catalogue and activate a Trial Plan.</p>
                </section>

                <section className="guide-block">
                  <h3>4. Trial Plan Access</h3>
                  <ul>
                    <li>Experience gameplay and learning flow</li>
                    <li>Review hazard scenarios and assessment logic</li>
                    <li>Evaluate suitability for trainees or clients</li>
                  </ul>
                </section>

                <section className="guide-block">
                  <h3>5. Game Catalogue Overview</h3>
                  <ul>
                    <li>Safety topic (Electrical, Machine, Fire, PPE, etc.)</li>
                    <li>Scenario description</li>
                    <li>Pricing per game token</li>
                  </ul>
                </section>

                <section className="guide-block">
                  <h3>6. Understanding the Game Experience</h3>
                  <ul>
                    <li>Third-person character in a realistic 3D workplace</li>
                    <li>Multiple embedded safety hazards</li>
                    <li>Hazard identification tasks</li>
                    <li>Three quiz questions per hazard</li>
                  </ul>
                  <p>Points are awarded for correct hazard identification and quiz responses.</p>
                </section>

                <section className="guide-block">
                  <h3>7. Game Tokens & Licensing Model</h3>
                  <ul>
                    <li>One token per trainee per game</li>
                    <li>Token sent via email</li>
                    <li>Activates on first use</li>
                    <li>Valid for 3 days from first use</li>
                    <li>Multiple attempts allowed</li>
                    <li>Expires automatically</li>
                  </ul>
                </section>

                <section className="guide-block">
                  <h3>8. Assigning Games to Trainees</h3>
                  <ol>
                    <li>Select a game from the catalogue</li>
                    <li>Enter trainee email IDs</li>
                    <li>Generate and distribute Game Tokens</li>
                    <li>Track usage via Partner dashboard</li>
                  </ol>
                </section>

                <section className="guide-block">
                  <h3>9. Assessment & Scoring</h3>
                  <ul>
                    <li>Fixed game duration</li>
                    <li>Final score calculated as percentage</li>
                    <li>Pass: 80% and above</li>
                    <li>Fail: Below 80%</li>
                    <li>Highest score is recorded</li>
                  </ul>
                </section>

                <section className="guide-block">
                  <h3>10. Certification</h3>
                  <ul>
                    <li>Certificate generated after token expiry</li>
                    <li>Emailed automatically to trainee</li>
                    <li>Reflects highest score achieved</li>
                  </ul>
                </section>

                <section className="guide-block">
                  <h3>11. In-Game Learning Resources</h3>
                  <ul>
                    <li>Safety guidelines & SOPs</li>
                    <li>Learning videos</li>
                    <li>PPE mini-game</li>
                    <li>Reference documents</li>
                  </ul>
                </section>

                <section className="guide-block">
                  <h3>12. Delivery Models</h3>
                  <ul>
                    <li>Classroom training reinforcement</li>
                    <li>Virtual / remote safety training</li>
                    <li>Blended learning programs</li>
                    <li>Pre or post training assessment</li>
                  </ul>
                </section>

                <section className="guide-block">
                  <h3>13. Platform Access & Technical Requirements</h3>
                  <ul>
                    <li>Cloud-based, browser accessible</li>
                    <li>No software installation required</li>
                    <li>Supports Windows, Android, iOS, tablets & kiosks</li>
                  </ul>
                </section>

                <section className="guide-block">
                  <h3>14. Partner Billing & Invoicing</h3>
                  <ul>
                    <li>Usage-based billing</li>
                    <li>Invoices generated periodically</li>
                    <li>Based on Game Tokens used</li>
                  </ul>
                </section>

                <section className="guide-block">
                  <h3>15. Best Practices</h3>
                  <ul>
                    <li>Align games with training objectives</li>
                    <li>Brief trainees before gameplay</li>
                    <li>Encourage multiple attempts</li>
                    <li>Use certificates for training records</li>
                  </ul>
                </section>

                <section className="guide-block">
                  <h3>16. Support & Assistance</h3>
                  <p>
                    For technical support, onboarding help, or commercial queries, Partners can contact
                    the Antiz support team through the platform.
                  </p>
                </section>

                <section className="guide-block checklist">
                  <h3>17. Getting Started Checklist</h3>
                  <ul>
                    <li>Register as a Partner</li>
                    <li>Explore games via Trial Plan</li>
                    <li>Select relevant safety games</li>
                    <li>Assign Game Tokens to trainees</li>
                    <li>Review results and certificates</li>
                  </ul>
                </section>

                <section className="guide-block closing">
                  <h3>We’re Glad to Have You Onboard</h3>
                  <p>
                    The Safety Serious Games Platform empowers you to deliver modern, engaging, and
                    measurable safety training. We look forward to supporting your training success.
                  </p>
                </section>
              </div>
            )}

            {activeSection === 'contact' && (
              <div className="contact-section">
                <h2>Contact Information</h2>
                <div className="contact-info">
                  <div className="contact-item">
                    <div className="contact-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <div>
                      <h3>Email Support</h3>
                      <p>Contact us at   <a href="mailto:support@antiztech.com" className="support-email">
                        support@antiztech.com
                      </a> for any clarifications and support queries.
                      </p>

                    </div>
                  </div>
                  <div className="contact-item">
                    <div className="contact-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>

                  </div>
                  <div className="contact-item">
                    <div className="contact-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
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
