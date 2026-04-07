import React, { useEffect, useState } from "react";
import "./GameManagement.css";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "/GamifiedLearning/api";

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    company_name: "",
    address: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/games/companies`);
      const json = await res.json();

      if (json.success) {
        setCompanies(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (company = null) => {
    if (company) {
      setEditMode(true);
      setEditId(company.id);
      setFormData({
        company_name: company.company_name,
        address: company.address || "",
      });
    } else {
      setEditMode(false);
      setFormData({
        company_name: "",
        address: "",
      });
    }

    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSaveCompany = async () => {
    try {
      const url = editMode
        ? `${API_BASE_URL}/games/companies/${editId}`
        : `${API_BASE_URL}/games/companies`;

      const method = editMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        alert(editMode ? "Company updated!" : "Company created!");
        handleCloseModal();
        fetchCompanies();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save company");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this company?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/games/companies/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        fetchCompanies();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="gm-page">
      <div className="gm-card">

        <div className="gm-header">
          <button
            className="gm-back-btn"
            onClick={() => navigate("/internal/partner-management")}
          >
            ← Back
          </button>

          <h1 className="gm-title gm-title-center">
            Company Management
          </h1>

          <button
            className="gm-btn-primary"
            onClick={() => handleOpenModal()}
          >
            + Add Company
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="gm-table-container">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Company Name</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {companies.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.company_name}</td>
                    <td>{c.address}</td>
                    <td className="gm-actions">
                      <button
                        className="gm-btn-edit"
                        onClick={() => handleOpenModal(c)}
                      >
                        Edit
                      </button>

                      <button
                        className="gm-btn-delete"
                        onClick={() => handleDelete(c.id)}
                      >
                        Delete
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
        <div className="gm-modal-overlay" onClick={handleCloseModal}>
          <div
            className="gm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="gm-modal-title">
              {editMode ? "Edit Company" : "Create Company"}
            </h2>

            <div className="gm-form">
              <label>Company Name</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    company_name: e.target.value,
                  })
                }
              />

              <label>Address</label>
              <textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: e.target.value,
                  })
                }
              />

              <div className="gm-modal-actions">
                <button
                  className="gm-btn-secondary"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>

                <button
                  className="gm-btn-primary"
                  onClick={handleSaveCompany}
                >
                  {editMode ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyManagement;