import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePartnerAuth } from "../../hooks/usePartnerAuth";
import "./PartnerUsers.css";

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
      .then(data => {
        if (data.success) setRows(data.data);
      });

  }, [userData]);  

  const getTokenStatus = (row) => {

    if (row.status === "used") {
      return "Certified";
    }
  
    if (row.status === "assigned") {
      return "Active";
    }
  
    if (row.status === "unassigned") {
      const sentDate = new Date(row.sent_date);
      const expiry = new Date(sentDate);
      expiry.setDate(expiry.getDate() + 5);
  
      const now = new Date();
  
      if (expiry < now) {
        return "Unused";
      } else {
        return "Awaiting";
      }
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

  return (
    <div className="partner-users-page">

<div className="page-header5">

<Link to="/partner/dashboard" className="back-link">Back</Link>

<h2>Partner Users</h2>

<div className="filters-container">

  <div className="date-filter">
    <input
      type="date"
      value={fromDate}
      onChange={(e) => setFromDate(e.target.value)}
    />

    <span>to</span>

    <input
      type="date"
      value={toDate}
      onChange={(e) => setToDate(e.target.value)}
    />
  </div>

  <div className="status-filter">
    <label>Status</label>
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
    >
      <option value="">All</option>
      <option value="Certified">Certified</option>
      <option value="Active">Active</option>
      <option value="Awaiting">Awaiting</option>
      <option value="Unused">Unused</option>
    </select>
  </div>

</div>

</div>

      <div className="table-container">
        <table className="partner-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Org</th>
              <th>Token</th>
              <th>Game</th>
              <th>Sent Date</th>
              <th>Used Date</th>
              <th>Token Status</th>
            </tr>
          </thead>

          <tbody>
  {filteredRows.map((row, index) => (
    <tr key={index}>
      <td>{row.user_name}</td>
      <td>{row.org_name}</td>
      <td>{row.token}</td>
      <td>{row.game_title}</td>
      <td>{new Date(row.sent_date).toLocaleDateString()}</td>
      <td>{row.used_date ? new Date(row.used_date).toLocaleDateString() : "-"}</td>
      <td
  className={`status-${getTokenStatus(row)
    .toLowerCase()
    .trim()
    .replace(/\s/g, "-")}`}
>
  {getTokenStatus(row)}
</td>
</tr>
  ))}
</tbody>
        </table>
      </div>

    </div>
  );
};

export default PartnerUserList;