import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useEnterpriseAuth } from '../../hooks/useEnterpriseAuth';
import '../partner/PartnerHome.css';

const PAGE_COPY = {
  employees: {
    title: 'Manage Employees',
    note: 'Add, import, edit and deactivate employees. This section will be built next.'
  },
  catalog: {
    title: 'Game Catalog',
    note: 'The games assigned to your company will appear here.'
  },
  reports: {
    title: 'Reports',
    note: 'Participation, passes and certificate reports will appear here.'
  },
  help: {
    title: 'Help & Support',
    note: 'Enterprise help content will be added here.'
  }
};

const EnterprisePlaceholder = ({ page }) => {
  const { slug } = useParams();
  const { userData, isLoading } = useEnterpriseAuth(['super_admin', 'unit_admin']);
  const copy = PAGE_COPY[page] || { title: 'Coming soon', note: '' };

  if (isLoading || !userData) {
    return (
      <div className="partner-home-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="partner-home-page">
      <div className="partner-home-container">
        <div className="partner-header">
          <div className="welcome-section">
            <Link to={`/e/${slug}/admin`} className="back-link">
              ← Back
            </Link>
            <h1>{copy.title}</h1>
            <p>{copy.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterprisePlaceholder;
