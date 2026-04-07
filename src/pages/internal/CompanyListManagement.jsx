import React, { useEffect, useState } from "react";
import "./GameManagement.css";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "/GamifiedLearning/api";

const CompanyListManagement = () => {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [lists, setLists] = useState([]);
  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [formData, setFormData] = useState({
    company_id: "",
    lists: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest(".gm-multi-dropdown")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const loadData = async () => {
    try {

      const compRes = await fetch(`${API_BASE_URL}/games/companies`);
      const compJson = await compRes.json();
      if (compJson.success) setCompanies(compJson.data);

      const listRes = await fetch(`${API_BASE_URL}/games/lists`);
      const listJson = await listRes.json();
      if (listJson.success) setLists(listJson.data);

      const res = await fetch(`${API_BASE_URL}/games/company-lists`);
      const json = await res.json();

      if (!json.success) return;

      const map = {};

      json.data.forEach((row) => {
        if (!map[row.company_id]) {
          map[row.company_id] = {
            company_id: row.company_id,
            company_name: row.company_name,
            lists: [],
          };
        }

        if (row.list_id) {
          map[row.company_id].lists.push({
            id: row.list_id,
            list_name: row.list_name,
          });
        }
      });

      setRows(Object.values(map));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setShowModal(false);

  const openModal = (row) => {
    setFormData({
      company_id: row.company_id,
      lists: row.lists.map((l) => l.id),
    });

    setShowModal(true);
  };

  const toggleList = (id) => {
    const exists = formData.lists.includes(id);

    setFormData({
      ...formData,
      lists: exists
        ? formData.lists.filter((x) => x !== id)
        : [...formData.lists, id],
    });
  };

  const handleSave = async () => {
    try {
      await fetch(`${API_BASE_URL}/games/companies/${formData.company_id}/lists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_list_ids: formData.lists
        })
      });

      alert("Lists updated successfully");
      closeModal();
      loadData();
    } catch {
      alert("Update failed");
    }
  };

  return (
    <div className="gm-page">
      <div className="gm-card">

        <div className="gm-header">
          <button
            className="gm-back-btn"
            onClick={() => navigate("/internal/catalog-management")}
          >
            ← Back
          </button>

          <h1 className="gm-title gm-title-center">
            Company List Management
          </h1>

          <div />
        </div>

        <p className="gm-subtitle">
          Manage company list assignments
        </p>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="gm-table-container">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Lists</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr key={row.company_id}>
                    <td>{row.company_name}</td>

                    <td>
                      {row.lists.map((l) => l.list_name).join(", ") || "-"}
                    </td>

                    <td>{row.lists.length}</td>

                    <td className="gm-actions">
                      <button
                        className="gm-btn-edit"
                        onClick={() => openModal(row)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {showModal && (
        <div className="gm-modal-overlay" onClick={closeModal}>
          <div
            className="gm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="gm-modal-title">
              Edit Company Lists
            </h2>

            <div className="gm-form">

              <label>Company</label>
              <input
                value={
                  companies.find(
                    (c) => c.id === formData.company_id
                  )?.company_name || ""
                }
                disabled
              />

              <label>Select Lists</label>

              <div className="gm-multi-dropdown">
                <button
                  type="button"
                  className="gm-multi-dropdown-btn"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {formData.lists.length
                    ? `${formData.lists.length} selected`
                    : "Select Lists"}
                </button>

                {showDropdown && (
                  <div className="gm-multi-dropdown-menu">
                    {lists.map((list) => (
                      <label
                        key={list.id}
                        className="gm-multi-dropdown-item"
                      >
                        <input
                          type="checkbox"
                          checked={formData.lists.includes(list.id)}
                          onChange={() => toggleList(list.id)}
                        />
                        {list.list_name}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="gm-modal-actions">
                <button
                  className="gm-btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  className="gm-btn-primary"
                  onClick={handleSave}
                >
                  Save Changes
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyListManagement;