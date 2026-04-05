import React from "react";
import { useNavigate } from "react-router-dom";
import "./PortalManagement.css";

const PartnerManagement = () => {
  const navigate = useNavigate();

  const menuLinks = [
    {
      title: "Partner Management",
      note: "List of registered Partners",
      disabled: false,
      path: "/internal/partners",
    },
    {
      title: "User Management",
      note: "Coming Soon",
      disabled: true,
      path: "/internal/users",
    },
    {
      title: "Company Management",
      note: "Assign List to Company",
      disabled: false,
      path: "/internal/company-management",
    },
  ];

  return (
    <div className="portal-page">
      <div className="portal-container">
        {/* Header */}
        <div className="portal-header">
          <div className="portal-header-content">
            <h1>ANTIZ Admin</h1>
            <p>SaaS Portal Administration & Management Functions</p>
          </div>
        </div>

        {/* Single Card */}
        <div className="portal-single-card">
          <h2 className="portal-single-title">Partner Management</h2>

          <div className="portal-link-list">
            {menuLinks.map((item, index) => (
              <button
                key={index}
                className={`portal-link-item ${item.disabled ? "disabled" : ""}`}
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) navigate(item.path);
                }}
              >
                <div className="portal-link-left">
                  <span className="portal-link-title">{item.title}</span>
                  <span className="portal-link-note">{item.note}</span>
                </div>

                <div className="portal-link-arrow">›</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="portal-powered-by">
        Powered by{" "}
        <a href="https://antiztech.com/" target="_blank" rel="noopener noreferrer">
          <strong>Antiztech.com</strong>
        </a>
      </div>
    </div>
  );
};

export default PartnerManagement;
