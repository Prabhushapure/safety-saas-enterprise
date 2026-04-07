import React from 'react';
import { NavLink, useLocation } from "react-router-dom";
import './Navigation.css';

const InternalNavigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/internal/home', label: <>Portal<br />Setting</> },
    { path: '/internal/catalog-management', label: <>Catalog<br />Management</> },
    { path: '/internal/partner-management', label: <>Partner<br />Management</> },
    { path: '/internal/antiz-dashboard', label: <>Antiz<br />Dashboard</> },
  ];

  return (
    <header className="header">
      <div className="header-content1">
        <div className="logo-section">
          <h1 className="site-title">Gamified Learning</h1>
        </div>
        {/* ===== Center Section: Navigation ===== */}
        <nav className="navigation">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => {
                    const isCatalogSection =
                      location.pathname.startsWith("/internal/catalog-management") ||
                      location.pathname.startsWith("/internal/game-management");

                    const active =
                      item.path === "/internal/catalog-management"
                        ? isCatalogSection
                        : isActive;

                    return `nav-link ${active ? "active" : ""}`;
                  }}
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
            src="/GamifiedLearning/antiz-logo.png"
            alt="Antiz Technologies"
            className="logo-image"
          />
        </div>
      </div>
    </header>
  );
};

export default InternalNavigation;
