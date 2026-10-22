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
    partners_count: 0,
    account_type: "partner",
    company_slug: "",
    super_admin_email: "",
  });
  const [adminForm, setAdminForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [savingAdmin, setSavingAdmin] = useState(false);

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
        partners_count: company.partners_count ?? 0,
        account_type: company.account_type || "partner",
        company_slug: company.company_slug || "",
        super_admin_email: company.super_admin_email || "",
      });
    } else {
      setEditMode(false);
      setEditId(null);
      setFormData({
        company_name: "",
        address: "",
        partners_count: 0,
        account_type: "partner",
        company_slug: "",
        super_admin_email: "",
      });
    }
    setAdminForm({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    });

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
        body: JSON.stringify({
          company_name: formData.company_name,
          address: formData.address,
          account_type: formData.account_type,
          company_slug: formData.company_slug,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(editMode ? "Company updated!" : "Company created!");
        handleCloseModal();
        fetchCompanies();
      } else {
        alert(data.message || "Failed to save company");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save company");
    }
  };

  const handleCreateSuperAdmin = async () => {
    if (!editId) return;

    setSavingAdmin(true);
    try {
      const res = await fetch(`${API_BASE_URL}/games/companies/${editId}/super-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adminForm),
      });

      const data = await res.json();

      if (data.success) {
        alert(`Super Admin created. Login at ${data.data.loginUrl}`);
        setAdminForm({
          first_name: "",
          last_name: "",
          email: "",
          password: "",
        });
        fetchCompanies();
        setFormData((prev) => ({
          ...prev,
          super_admin_email: data.data.email,
        }));
      } else {
        alert(data.message || "Failed to create Super Admin");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create Super Admin");
    } finally {
      setSavingAdmin(false);
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
                  <th>Type</th>
                  <th>Slug</th>
                  <th>Address</th>
                  <th>No. of Partners</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {companies.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.company_name}</td>
                    <td>{c.account_type || "partner"}</td>
                    <td>{c.company_slug || "-"}</td>
                    <td>{c.address}</td>
                    <td>{c.partners_count ?? 0}</td>
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

              <label>Account Type</label>
              <select
                value={formData.account_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    account_type: e.target.value,
                  })
                }
              >
                <option value="partner">Partner</option>
                <option value="enterprise">Enterprise</option>
              </select>

              {formData.account_type === "enterprise" && (
                <>
                  <label>Company Slug</label>
                  <input
                    type="text"
                    value={formData.company_slug}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        company_slug: e.target.value.toLowerCase(),
                      })
                    }
                    placeholder="acme"
                  />
                  <p className="gm-form-hint">
                    Login URL: /e/{formData.company_slug || "slug"}/login
                  </p>
                </>
              )}

              <label>No. of Partners</label>
              <input
                type="text"
                value={formData.partners_count ?? 0}
                disabled
                readOnly
              />

              {editMode && formData.account_type === "enterprise" && (
                <>
                  <div className="gm-form-divider">Super Admin</div>
                  {formData.super_admin_email && (
                    <p className="gm-form-hint">
                      Current Super Admin: {formData.super_admin_email}
                    </p>
                  )}
                  <label>First Name</label>
                  <input
                    type="text"
                    value={adminForm.first_name}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, first_name: e.target.value })
                    }
                  />
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={adminForm.last_name}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, last_name: e.target.value })
                    }
                  />
                  <label>Email</label>
                  <input
                    type="email"
                    value={adminForm.email}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, email: e.target.value })
                    }
                  />
                  <label>Password</label>
                  <input
                    type="password"
                    value={adminForm.password}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="gm-btn-secondary"
                    onClick={handleCreateSuperAdmin}
                    disabled={savingAdmin}
                  >
                    {savingAdmin ? "Creating..." : "Create Super Admin"}
                  </button>
                </>
              )}

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