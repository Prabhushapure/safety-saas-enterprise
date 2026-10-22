import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getEnterpriseToken, useEnterpriseAuth } from '../../hooks/useEnterpriseAuth';
import '../partner/PartnerDistribute.css';
import './EnterpriseEmployees.css';

const API_BASE_URL = '/GamifiedLearning/api';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  department: '',
  employee_code: ''
};

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getEnterpriseToken()}`
});

const parseCsv = (text) => {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const idx = (key) => header.indexOf(key);

  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((col) => col.trim());
    return {
      name: cols[idx('name')] || '',
      email: cols[idx('email')] || '',
      password: cols[idx('password')] || '',
      department: cols[idx('department')] || '',
      employee_code: cols[idx('employee_code')] || ''
    };
  });
};

const EnterpriseEmployees = () => {
  const { slug } = useParams();
  const { userData, isLoading: authLoading } = useEnterpriseAuth(['super_admin', 'unit_admin']);
  const fileInputRef = useRef(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/enterprise/employees`, {
        headers: authHeaders()
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || 'Failed to load employees');
        return;
      }
      setEmployees(json.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData) fetchEmployees();
  }, [userData]);

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.name || !form.email || (!editing && !form.password)) {
      setError('Name, email and password are required for new employees');
      return;
    }

    setLoading(true);
    setError('');
    setNotice('');

    try {
      const url = editing
        ? `${API_BASE_URL}/enterprise/employees/${editing.id}`
        : `${API_BASE_URL}/enterprise/employees`;
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || 'Failed to save employee');
        return;
      }
      closeModal();
      setNotice(json.message || 'Saved');
      fetchEmployees();
    } catch (err) {
      console.error(err);
      setError('Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (employee) => {
    const nextActive = employee.active ? 0 : 1;
    const action = nextActive ? 'activate' : 'deactivate';
    if (!window.confirm(`${action} ${employee.name}?`)) return;

    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/enterprise/employees/${employee.id}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ active: nextActive })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || 'Failed to update status');
        return;
      }
      fetchEmployees();
    } catch (err) {
      console.error(err);
      setError('Failed to update status');
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError('');
    setNotice('');
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length === 0) {
        setError('CSV must include a header row: name,email,password,department,employee_code');
        return;
      }

      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/enterprise/employees/import`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ employees: rows })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || 'Import failed');
        return;
      }
      const skipped = json.data?.skippedCount || 0;
      setNotice(`${json.message}${skipped ? `. ${skipped} row(s) skipped.` : ''}`);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      setError('Import failed');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !userData) {
    return (
      <div className="partner-distribute-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="partner-distribute-page">
      <div className="distribute-container">
        <div className="page-header2">
          <div className="header-content2">
            <Link to={`/e/${slug}/admin`} className="back-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Back
            </Link>

            <div className="title-block">
              <h1>Manage Employees</h1>
              <span className="overview-number">
                Employee Count <strong>{employees.length}</strong>
              </span>
            </div>

            <div className="header-add-button employee-header-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden-file-input"
                onChange={handleImport}
              />
              <button
                type="button"
                className="secondary-button"
                onClick={() => fileInputRef.current?.click()}
              >
                Import CSV
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  setEditing(null);
                  setForm(emptyForm);
                  setShowModal(true);
                  setError('');
                }}
              >
                Add Employee
              </button>
            </div>
          </div>
        </div>

        <div className="page-scroll-area">
          <div className="user-content">
            {error && <div className="error-message">{error}</div>}
            {notice && <div className="success-message">{notice}</div>}

            {loading && (
              <div className="partner-distribute-loading">
                <div className="loading-spinner" />
              </div>
            )}

            <div className="user-list">
              {!loading && employees.length === 0 ? (
                <div className="empty-state">
                  <h3>No employees yet</h3>
                  <p>Add one employee or import a CSV with columns name, email, password.</p>
                  <button type="button" className="secondary-button" onClick={() => setShowModal(true)}>
                    Add Employee
                  </button>
                </div>
              ) : (
                <div className="user-table-wrapper">
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((employee) => (
                        <tr key={employee.id}>
                          <td>{employee.name}</td>
                          <td>{employee.email}</td>
                          <td>{employee.department || '—'}</td>
                          <td>{employee.active ? 'Active' : 'Inactive'}</td>
                          <td>
                            <button
                              type="button"
                              className="edit-button"
                              onClick={() => {
                                setEditing(employee);
                                setForm({
                                  name: employee.name || '',
                                  email: employee.email || '',
                                  password: '',
                                  department: employee.department || '',
                                  employee_code: employee.employee_code || ''
                                });
                                setShowModal(true);
                                setError('');
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className={`status-button ${employee.active ? 'deactivate' : 'activate'}`}
                              onClick={() => handleStatus(employee)}
                            >
                              {employee.active ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editing ? 'Edit Employee' : 'Add Employee'}</h2>
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="password"
              placeholder={editing ? 'New password (optional)' : 'Password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <input
              type="text"
              placeholder="Department (optional)"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />
            <input
              type="text"
              placeholder="Employee code (optional)"
              value={form.employee_code}
              onChange={(e) => setForm({ ...form, employee_code: e.target.value })}
            />
            <div className="modal-actions">
              <button type="button" className="primary-button" onClick={handleSave}>
                Save
              </button>
              <button type="button" className="secondary-button" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseEmployees;
