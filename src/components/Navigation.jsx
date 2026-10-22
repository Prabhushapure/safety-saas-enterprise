import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Navigation.css';

const getEnterpriseUser = () => {
  try {
    if (!localStorage.getItem('enterpriseToken')) return null;
    return JSON.parse(localStorage.getItem('enterpriseUser') || 'null');
  } catch {
    return null;
  }
};

const Navigation = () => {
  const location = useLocation();
  const isPartnerLoggedIn = !!localStorage.getItem('partnerUser');
  const [enterpriseUser, setEnterpriseUser] = useState(getEnterpriseUser);

  useEffect(() => {
    const sync = () => setEnterpriseUser(getEnterpriseUser());
    sync();
    window.addEventListener('enterprise-auth-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('enterprise-auth-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, [location.pathname]);

  const isEnterpriseRoute = location.pathname.startsWith('/e/');
  const slugFromPath = location.pathname.match(/^\/e\/([^/]+)/)?.[1];
  const enterpriseSlug = slugFromPath || enterpriseUser?.companySlug;
  const isEnterpriseLoggedIn = !!enterpriseUser;
  const isEmployee = enterpriseUser?.role === 'employee';

  const accountItem = isEnterpriseRoute
    ? {
        path: isEnterpriseLoggedIn && enterpriseSlug
          ? (isEmployee ? `/e/${enterpriseSlug}/my-games` : `/e/${enterpriseSlug}/admin`)
          : `/e/${enterpriseSlug || ''}/login`,
        label: isEnterpriseLoggedIn
          ? (isEmployee ? 'My Games' : 'Admin Dashboard')
          : 'Login',
        highlightOn: 'enterprise'
      }
    : {
        path: isPartnerLoggedIn ? '/partner/home' : '/partner/login',
        label: isPartnerLoggedIn ? 'Partner Dashboard' : 'Partner Login',
        highlightOn: 'partner'
      };

  const navItems = [
    { path: '/home', label: 'Home' },
    { path: '/about', label: 'About' },
    ...(!isEnterpriseRoute ? [{ path: '/store', label: 'Games Catalog' }] : []),
    accountItem
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
              <li key={`${item.highlightOn}-${item.label}`} className="nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => {
                    const isPartnerLink = item.highlightOn === 'partner';
                    const isEnterpriseLink = item.highlightOn === 'enterprise';
                    const isOnPartnerRoute = location.pathname.startsWith('/partner');
                    const shouldBeActive = isEnterpriseLink
                      ? isEnterpriseRoute
                      : isPartnerLink
                        ? isOnPartnerRoute
                        : isActive;
                    return `nav-link ${shouldBeActive ? 'active' : ''}`;
                  }}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="company-logo">
          <img src="/GamifiedLearning/antiz-logo.png" alt="Antiz Technologies" className="logo-image" />
        </div>
      </div>
    </header>
  );
};

export default Navigation;
