import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePartnerAuth } from "../../hooks/usePartnerAuth";
import "./PartnerShared.css";

const API_BASE_URL = "/AWE-SaaS/api";

const PartnerUserList = () => {
  const { userData } = usePartnerAuth();
  const [rows, setRows] = useState([]);
  const [orgFilter, setOrgFilter] = useState("");

  const orgList = [...new Set(rows.map(r => r.org_name))];

  useEffect(() => {
    if (!userData?.id) return;
    fetch(`${API_BASE_URL}/play/partner/user-summary?partnerId=${userData.id}`)
      .then(res => res.json())
      .then(data => { if (data.success) setRows(data.data); });
  }, [userData]);

  const filteredRows = rows.filter((row) => {
    if (orgFilter && row.org_name !== orgFilter) return false;
    return true;
  });

  return (
    <div className="partner-subpage">
      <div className="partner-subpage-inner">
        <div className="ps-header">
          <div className="ps-header-left">
            <Link to="/partner/dashboard" className="ps-back-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
              Back
            </Link>
            <h1 className="ps-title">User Summary</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>Org:</label>
            <select value={orgFilter} onChange={(e) => setOrgFilter(e.target.value)}
              style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-300)', fontSize: 'var(--text-sm)' }}>
              <option value="">All</option>
              {orgList.map((org, i) => <option key={i} value={org}>{org}</option>)}
            </select>
          </div>
        </div>

        <div className="ps-card">
          <div className="ps-card-body">
            <div className="ps-table-wrap">
              <table className="ps-table">
                <thead>
                  <tr>
                    <th>Organization</th>
                    <th>User</th>
                    <th>Tokens Sent</th>
                    <th>Active</th>
                    <th>Certified</th>
                    <th>Unused</th>
                    <th>Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, i) => {
                    const utilization = row.token_sent > 0
                      ? ((row.token_certified / row.token_sent) * 100).toFixed(1)
                      : 0;
                    return (
                      <tr key={i}>
                        <td>{row.org_name}</td>
                        <td>{row.user_name}</td>
                        <td>{row.token_sent}</td>
                        <td>{row.token_active}</td>
                        <td>{row.token_certified}</td>
                        <td>{row.token_unused}</td>
                        <td>{utilization}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerUserList;
