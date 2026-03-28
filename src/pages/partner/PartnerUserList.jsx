import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePartnerAuth } from "../../hooks/usePartnerAuth";
import "./PartnerShared.css";

const API_BASE_URL = "/AWE-SaaS/api";

const PartnerUserList = () => {
  const { userData } = usePartnerAuth();
  const [rows, setRows] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (!userData?.id) return;
    fetch(`${API_BASE_URL}/play/partner/user-tokens?partnerId=${userData.id}`)
      .then(res => res.json())
      .then(data => { if (data.success) setRows(data.data); });
  }, [userData]);

  const getTokenStatus = (row) => {
    if (row.status === "used") return "Certified";
    if (row.status === "assigned") return "Active";
    if (row.status === "unassigned") {
      const expiry = new Date(row.sent_date);
      expiry.setDate(expiry.getDate() + 5);
      return expiry < new Date() ? "Unused" : "Awaiting";
    }
    return row.status;
  };

  const filteredRows = rows.filter((row) => {
    const sent = new Date(row.sent_date);
    if (fromDate && sent < new Date(fromDate)) return false;
    if (toDate && sent > new Date(toDate)) return false;
    if (statusFilter && getTokenStatus(row) !== statusFilter) return false;
    return true;
  });

  const filterStyle = { display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' };
  const inputStyle = { padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-300)', fontSize: 'var(--text-sm)' };

  return (
    <div className="partner-subpage">
      <div className="partner-subpage-inner">
        <div className="ps-header">
          <div className="ps-header-left">
            <Link to="/partner/dashboard" className="ps-back-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
              Back
            </Link>
            <h1 className="ps-title">Transactions & Utilization</h1>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={filterStyle}>
              <label style={{ color: 'var(--color-gray-500)' }}>From:</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={inputStyle} />
              <span style={{ color: 'var(--color-gray-400)' }}>to</span>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={inputStyle} />
            </div>
            <div style={filterStyle}>
              <label style={{ color: 'var(--color-gray-500)' }}>Status:</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={inputStyle}>
                <option value="">All</option>
                <option value="Certified">Certified</option>
                <option value="Active">Active</option>
                <option value="Awaiting">Awaiting</option>
                <option value="Unused">Unused</option>
              </select>
            </div>
          </div>
        </div>

        <div className="ps-card">
          <div className="ps-card-body">
            <div className="ps-table-wrap">
              <table className="ps-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Organization</th>
                    <th>Token</th>
                    <th>Game</th>
                    <th>Sent Date</th>
                    <th>Used Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, i) => (
                    <tr key={i}>
                      <td>{row.user_name}</td>
                      <td>{row.org_name}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{row.token}</td>
                      <td>{row.game_title}</td>
                      <td>{new Date(row.sent_date).toLocaleDateString()}</td>
                      <td>{row.used_date ? new Date(row.used_date).toLocaleDateString() : "—"}</td>
                      <td>
                        <span className="ps-badge">{getTokenStatus(row)}</span>
                      </td>
                    </tr>
                  ))}
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
