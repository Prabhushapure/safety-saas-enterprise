import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePartnerAuth } from '../../hooks/usePartnerAuth';
import './PartnerShared.css';

const API_BASE_URL = '/AWE-SaaS/api';

const PartnerDistribute = () => {
  const navigate = useNavigate();
  const { userData, isLoading: authLoading } = usePartnerAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', organization: '' });
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('partnerUser'));
    if (storedUser?.subscription_plan_id === 'Trial Plan') {
      navigate('/partner/home');
    }
  }, [navigate]);

  const fetchUsers = async () => {
    const partnerUser = JSON.parse(localStorage.getItem('partnerUser') || '{}');
    const businessPartnerId = partnerUser.businessPartnerId || partnerUser.id;
    if (!businessPartnerId) {
      setError('Business Partner ID is missing. Please log in again.');
      navigate('/partner/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/users?businessPartnerId=${businessPartnerId}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setUsers(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('An error occurred while fetching users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.businessPartnerId || userData?.id) fetchUsers();
  }, [userData]);

  const handleSaveUser = async () => {
    if (!userForm.name || !userForm.email) { setError('Name and email are required'); return; }
    setLoading(true);
    setError('');
    try {
      const businessPartnerId = userData.businessPartnerId || userData.id;
      let response;
      if (editingUser) {
        response = await fetch(`${API_BASE_URL}/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...userForm, business_partner_id: businessPartnerId }),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...userForm, business_partner_id: businessPartnerId }),
        });
      }
      const data = await response.json();
      if (response.ok && data.success) {
        setShowUserModal(false);
        setUserForm({ name: '', email: '', organization: '' });
        setEditingUser(null);
        fetchUsers();
      } else {
        setError(data.message || 'Failed to save user');
      }
    } catch (err) {
      setError('An error occurred while saving user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, organization: user.organization || '' });
    setShowUserModal(true);
  };

  if (authLoading || !userData) {
    return <div className="ps-loading"><div className="ps-spinner" /></div>;
  }

  return (
    <div className="partner-subpage">
      <div className="partner-subpage-inner">
        <div className="ps-header">
          <div className="ps-header-left">
            <Link to="/partner/home" className="ps-back-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
              Back
            </Link>
            <div>
              <h1 className="ps-title">
                Manage Users
                <span className="ps-badge">{users.length} users</span>
              </h1>
            </div>
          </div>
          <button className="ps-btn ps-btn-primary" onClick={() => { setEditingUser(null); setUserForm({ name: '', email: '', organization: '' }); setShowUserModal(true); }}>
            + Add User
          </button>
        </div>

        {error && <div className="ps-error">{error}</div>}

        <div className="ps-card">
          <div className="ps-card-body">
            {loading ? (
              <div className="ps-loading"><div className="ps-spinner" /></div>
            ) : users.length === 0 ? (
              <div className="ps-empty">
                <h3>No users yet</h3>
                <p>Add your first user to get started with distributing games.</p>
                <button className="ps-btn ps-btn-secondary" onClick={() => setShowUserModal(true)}>Add User</button>
              </div>
            ) : (
              <div className="ps-table-wrap">
                <table className="ps-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Organization</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.organization || '—'}</td>
                        <td>
                          <button className="ps-btn ps-btn-secondary ps-btn-sm" onClick={() => handleEditUser(user)}>Edit</button>
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

      {showUserModal && (
        <div className="ps-modal-overlay" onClick={() => { setShowUserModal(false); setEditingUser(null); }}>
          <div className="ps-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
            <div className="ps-modal-fields">
              <input type="text" placeholder="Name" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
              <input type="email" placeholder="Email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
              <input type="text" placeholder="Organization (optional)" value={userForm.organization} onChange={(e) => setUserForm({ ...userForm, organization: e.target.value })} />
            </div>
            <div className="ps-modal-actions">
              <button className="ps-btn ps-btn-primary" onClick={handleSaveUser}>Save</button>
              <button className="ps-btn ps-btn-secondary" onClick={() => { setShowUserModal(false); setEditingUser(null); setUserForm({ name: '', email: '', organization: '' }); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerDistribute;
