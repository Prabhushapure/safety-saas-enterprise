import React from 'react';
import './PartnerDistribute.css';

const PartnerDistribute = () => {
  return (
    <div className="partner-distribute-page">
      <div className="distribute-container">
        <div className="distribute-header">
          <h1>Partner Distribution Dashboard</h1>
          <p>Manage and distribute safety games to your clients</p>
        </div>
        
        <div className="coming-soon">
          <div className="coming-soon-content">
            <div className="icon">🚧</div>
            <h2>Coming Soon</h2>
            <p>The distribution dashboard is currently under development. Check back soon for updates!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDistribute;
