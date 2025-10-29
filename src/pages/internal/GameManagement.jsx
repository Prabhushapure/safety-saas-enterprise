import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GameManagement.css';

const GameManagement = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('internalUser');
    if (!stored) return;
  }, [navigate]);

  return (
    <div className="gm-page">
      <div className="gm-card">
        <h1 className="gm-title">Welcome to this page</h1>
        <p className="gm-subtitle">Game Management</p>
      </div>
    </div>
  );
};

export default GameManagement;


