import React, { useEffect, useState } from "react";
import "./GameManagement.css";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "/AWE-SaaS/api";

const Partners = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setError("");
        const res = await fetch(`${API_BASE_URL}/partners/summary`);
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        if (data.success) {
          setRows(data.data || []);
        } else {
          throw new Error(data.message || "Failed to load partners");
        }
      } catch {
        setRows([
          { id: 1, partner_name: "Alpha Safety Pvt Ltd", users_count: 24, tokens_sent: 120, tokens_used: 86 },
          { id: 2, partner_name: "Bravo Training Services", users_count: 12, tokens_sent: 60, tokens_used: 41 },
          { id: 3, partner_name: "Crest Industrial", users_count: 35, tokens_sent: 210, tokens_used: 173 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  return (
    <div className="gm-page">
      <div className="gm-card">
        <div className="gm-header">
          <button className="gm-back-btn" onClick={() => navigate("/internal/partner-management")}>
            ← Back
          </button>
          <h1 className="gm-title gm-title-center">Partner Management</h1>
          <div className="gm-partner-count">
            Total Partners: <strong>{rows.length}</strong>
          </div>
        </div>

        {error && <p style={{ color: "#b91c1c", marginBottom: 8 }}>{error}</p>}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="gm-table-container">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Partner Name</th>
                  <th>Subscription Plan</th>
                  <th>No. of Users</th>
                  <th>No. of Tokens Sent</th>
                  <th>No. of Tokens Used</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, index) => (
                  <tr key={r.id}>
                    <td>{index + 1}</td>
                    <td>{r.partner_name}</td>
                    <td>{r.subscription_id || "-"}</td>
                    <td>{r.users_count}</td>
                    <td>{r.tokens_sent}</td>
                    <td>{r.tokens_used}</td>
                    <td>
                      <span
                        style={{
                          color: r.is_active === 1 ? "green" : "red",
                          fontWeight: "600",
                        }}
                      >
                        {r.is_active === 1 ? "Active" : "Unsubscribed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Partners;
