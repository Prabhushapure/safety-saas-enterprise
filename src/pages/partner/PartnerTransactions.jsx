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

  useEffect(() => {

    if (!userData?.id) return;

    fetch(`${API_BASE_URL}/play/partner/user-summary?partnerId=${userData.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setRows(data.data);
      });

  }, [userData]);


  const filteredRows = rows.filter((row) => {

    const sent = new Date(row.sent_date);

    if (fromDate && sent < new Date(fromDate)) return false;
    if (toDate && sent > new Date(toDate)) return false;

    return true;
  });

  return (
    <div className="partner-users-page">

      <div className="page-header5">

        <Link to="/partner/dashboard" className="back-link">
          Back
        </Link>

        <h2>User List</h2>

        <div className="filters-container">

          

        </div>

      </div>

      <div className="table-container">

        <table className="partner-table">

          <thead>
            <tr>
              <th>Org</th>
              <th>User</th>
              <th>Token Sent</th>
              <th>Token Active</th>
              <th>Token Certified</th>
              <th>Token Unused</th>
              <th>Utilization %</th>
            </tr>
          </thead>

          <tbody>

            {filteredRows.map((row, index) => {

              const utilization =
                row.token_sent > 0
                  ? ((row.token_certified / row.token_sent) * 100).toFixed(1)
                  : 0;

              return (
                <tr key={index}>

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
  );
};

export default PartnerUserList;