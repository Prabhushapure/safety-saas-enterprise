import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';

const InternalNavigation = () => {
  const navItems = [
    { path: '/internal/home', label: 'Antiz_admin Home' },
    { path: '/internal/game-management', label: 'Game Management' },
    { path: '/internal/reports', label: 'Reports' }
  ];

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <h1 className="site-title">Antiz_admin</h1>
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
          <img src="/antiz-logo.png" alt="Antiz Technologies" className="logo-image" />
        </div>
      </div>
    </header>
  );
};

export default InternalNavigation;


