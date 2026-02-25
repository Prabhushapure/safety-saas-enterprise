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
      <div className="about-scroll">
      <div className="application-section">
  <h2 className="section-title">Application Brief & Usage Model</h2>

  <p>
  A collection of <strong>Serious Games</strong> for <strong>Industrial Skilling</strong> are delivered through this <strong>platform</strong>. These games are designed for <strong>Industrial Training programs and
workshops</strong>, enabling Trainers to complement their training with engaging, interactive, and assessment-driven learning experiences, in the areas of Safety, Quality, Production,
Factory Discipline, etc.
  </p>

  <p>
  Trainers select relevant serious games and distribute them to their trainees via <strong>Game Tokens</strong> sent by email. Each Token is valid for <strong>three days from first use</strong> the trainees may
play the game multiple times during this time while improving their scores. Upon Token expiry, a <strong>Topic Completion Certificate</strong> is emailed to the trainee, reflecting <strong>Highest
Scores</strong>.
  </p>

  <p>
  Trainer – <strong>Partners</strong> can use this Platform by <strong>subscribing</strong> to the either the <strong>Trial, Partner or Enterprise Plans</strong>. The Partner’s Company will be billed periodically based on Token
  usage.
  </p>
</div>

      <div className="benefits-section">
        <h2 className="section-title">Key Benefits:</h2>
        <div className="benefits-grid">
        
          <div className="benefit-card"> 
          <div className="benefit-header">
            <div className="benefit-icon">🚀</div>
            <h3>Boosts Engagement and Retention</h3>
            </div>
            <p>Interactive gameplay improves retention while competitive elements like leaderboards and achievements drive deeper engagement.</p>
          
          </div>

          <div className="benefit-card">
          <div className="benefit-header">
            <div className="benefit-icon">🎯</div>
            <h3>Reinforces Operational Practices through Hands-on Learning</h3>
            </div>
            <p>Realistic simulations allow workers to practice operational tasks in a risk-free environment before facing real situations.</p>
          </div>
          
          <div className="benefit-card">
          <div className="benefit-header">
            <div className="benefit-icon">⚡</div>
            <h3>Provides Instant Feedback for Improvement</h3>
            </div>
            <p>Real-time scoring and feedback help learners understand mistakes immediately and improve their knowledge.</p>
          </div>
          
        </div>
        </div>
      </div>
             

    </div>
  );
};

export default About;
