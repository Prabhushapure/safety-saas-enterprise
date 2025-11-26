import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';

const InternalNavigation = () => {
  const navItems = [
    { path: '/internal/game-management', label: <>Game<br />Management</> },
    { path: '/internal/partner-management', label: <>Partner<br />Management</> },
    { path: '/internal/user-management', label: <>User<br />Management</> },
    { path: '/internal/business-dashboard', label: <>Business<br />Dashboard</> },
    { path: '/internal/reports', label: <>Reports<br />Dashboard</> },
    { path: '/internal/portal-settings', label: <>Portal<br />Setting</> },
  ];

  return (
    <header className="header">
      <div className="header-content">
      <div className="logo-section">
          <h1 className="site-title">Admin</h1>
        </div>
        {/* ===== Center Section: Navigation ===== */}
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

        {/* ===== Right Section: Logo ===== */}
        <div className="company-logo">
          <img
            src="/AWE-SaaS/antiz-logo.png"
            alt="Antiz Technologies"
            className="logo-image"
          />
        </div>
      </div>
    </header>
  );
};

export default InternalNavigation;
