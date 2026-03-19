import React from 'react';
import homepage from '../assets/Home-page.jpg';
import homeVideo from '../assets/Home-page1.mp4';
import './Home.css';

const Home = () => {
  return (
    <div className="home_page-content">
      <div className="background-image">
        <video autoPlay loop muted playsInline preload="auto" poster={homepage} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, }} > <source src={homeVideo} type="video/mp4" /> </video> <div className="overlay"> <h1 className="overlay-title"> Gamified Training: A Smarter Way to Learn </h1> <p className="overlay-text"> Engage your Workforce through interactive and effective Serious games tailored for industrial and corporate environments </p> </div> </div> </div>);
};

export default Home;