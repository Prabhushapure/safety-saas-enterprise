import React from 'react';
import homepage from '../assets/Home-page.jpg';
import './Home.css';

const Home = () => {
  return (
    <div className="home_page-content">
       <div 
        className="background-image"
        style={{ backgroundImage: `url(${homepage})` }}
      >
        <div className="overlay">
          <h1 className="overlay-title">Gamified Safety Training: A Smarter Way to Learn</h1>
          <p className="overlay-text">
          Engage your Workforce through interactive and effective Serious games 
          tailored for industrial and corporate environments
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
