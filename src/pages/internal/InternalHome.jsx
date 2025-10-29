import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const InternalHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('internalUser');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('internalUser');
    // login removed; keep user on page or navigate to internal home
    navigate('/internal/home');
  };

  if (!user) {
    return <div style={{ padding: 32 }}>Loading...</div>;
  }

  return (
    <div className="page" style={{ padding: 24 }}>
      <h1>Antiz_admin Console</h1>
      <p>Welcome, {user.email}</p>
      <div style={{ marginTop: 16 }}>
        <button onClick={logout}>Logout</button>
      </div>
      <div style={{ marginTop: 24 }}>
        <ul>
          <li><Link to="/partner/dashboard">Go to Partner Dashboard (for reference)</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default InternalHome;


