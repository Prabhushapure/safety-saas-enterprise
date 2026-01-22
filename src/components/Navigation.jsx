import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const isPartnerLoggedIn = !!localStorage.getItem('partnerUser');
  const navItems = [
    { path: '/home', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/store', label: 'Games Catalog' },
    {
      path: isPartnerLoggedIn ? '/partner/home' : '/partner/login',
      label: isPartnerLoggedIn ? 'Partner Dashboard' : 'Partner Dashboard'
    }
  ];

  return (
    <header className="header">
      <div className="header-content1">
        <div className="logo-section">
          <h1 className="site-title">Gamified Learning</h1>
        </div>
        
        <nav className="navigation">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="company-logo">
          <img src="/AWE-SaaS/antiz-logo.png" alt="Antiz Technologies" className="logo-image" />
        </div>
      </div>
    </header>
  );
};

export default Navigation;
