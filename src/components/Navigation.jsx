import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isPartnerLoggedIn = !!localStorage.getItem('partnerUser');

  const navItems = [
    { path: '/home', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/store', label: 'Games Catalog' },
  ];

  const partnerItem = {
    path: isPartnerLoggedIn ? '/partner/home' : '/partner/login',
    label: isPartnerLoggedIn ? 'Partner Dashboard' : 'Partner Login',
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className={`nav-header${scrolled ? ' nav-scrolled' : ''}`}>
      <div className="nav-container">
        {/* Logo */}
        <NavLink to="/home" className="nav-brand">
          <span className="nav-brand-text">Gamified Learning</span>
        </NavLink>

        {/* Desktop nav */}
        <nav className="nav-desktop">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-desktop-link${isActive ? ' active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side: Partner CTA + Logo */}
        <div className="nav-right">
          <NavLink
            to={partnerItem.path}
            className={({ isActive }) => {
              const isOnPartnerRoute = location.pathname.startsWith('/partner');
              return `nav-cta${isActive || isOnPartnerRoute ? ' active' : ''}`;
            }}
          >
            {partnerItem.label}
          </NavLink>
          <img
            src={`${import.meta.env.BASE_URL}antiz-logo.png`}
            alt="Antiz Technologies"
            className="nav-company-logo"
          />
        </div>

        {/* Mobile hamburger */}
        <button
          className={`nav-hamburger${mobileMenuOpen ? ' open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="nav-mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
          <nav className="nav-mobile" onClick={(e) => e.stopPropagation()}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-mobile-link${isActive ? ' active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to={partnerItem.path}
              className={({ isActive }) => {
                const isOnPartnerRoute = location.pathname.startsWith('/partner');
                return `nav-mobile-link nav-mobile-cta${isActive || isOnPartnerRoute ? ' active' : ''}`;
              }}
            >
              {partnerItem.label}
            </NavLink>
            <div className="nav-mobile-logo">
              <img
                src={`${import.meta.env.BASE_URL}antiz-logo.png`}
                alt="Antiz Technologies"
                className="nav-company-logo"
              />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navigation;
