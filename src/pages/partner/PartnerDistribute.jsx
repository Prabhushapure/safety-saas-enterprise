import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePartnerAuth } from '../../hooks/usePartnerAuth';
import './PartnerDistribute.css';

const API_BASE_URL = '/AWE-SaaS/api';

const PartnerDistribute = () => {
  const navigate = useNavigate();
  const { userData, isLoading: authLoading } = usePartnerAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    organization: '',
  });

  const [editingUser, setEditingUser] = useState(null); // Track user being edited

  // Disable User Management for Trial Plan
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('partnerUser'));
    if (storedUser?.subscription_plan_id === 'Trial Plan') {
      navigate('/partner/home');
    }
  }, [navigate]);


  // Fetch all users for the partner
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
    if (userData?.businessPartnerId || userData?.id) {
      fetchUsers();
    }
  }, [userData]);

  // Handle Add or Edit User
  const handleSaveUser = async () => {
    if (!userForm.name || !userForm.email) {
      setError('Name and email are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let response;
      if (editingUser) {
        const businessPartnerId = userData.businessPartnerId || userData.id;

        response = await fetch(`${API_BASE_URL}/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...userForm,
            business_partner_id: businessPartnerId, // REQUIRED
          }),
        });
      } else {
        // Add new user
        const businessPartnerId = userData.businessPartnerId || userData.id;
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
        fetchUsers(); // Refresh user list
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

  // Open modal to edit user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, organization: user.organization || '' });
    setShowUserModal(true);
  };

  if (authLoading || !userData) {
    return (
      <div className="partner-distribute-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="partner-distribute-page">
      <div className="distribute-container">
        <div className="page-header2">
        <div className="header-content2">
  <Link to="/partner/home" className="back-link">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
    Back
  </Link>

  <div className="title-block">
    <h1>Manage Your Users List</h1>
    <span className="overview-number">
      User Count  <strong>{users.length}</strong>
    </span>
  </div>

   {/* Right Action */}
   <button
      className="primary-button header-add-button"
      onClick={() => setShowUserModal(true)}
    >
      Add User
    </button>
</div>
        </div>

        <div className="page-scroll-area">
        <div className="user-content">
          

          {error && <div className="error-message">{error}</div>}

          {loading && (
            <div className="partner-distribute-loading">
              <div className="loading-spinner"></div>
            </div>
          )}

          <div className="user-list">
            {!loading && users.length === 0 ? (
              <div className="empty-state">
                <h3>No users yet</h3>
                <button className="secondary-button" onClick={() => setShowUserModal(true)}>
                  Invite Users
                </button>
              </div>
            ) : (
              <div className="user-table-wrapper">
              <table className="user-table">
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
                        <button className="edit-button" onClick={() => handleEditUser(user)}>
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
        </div>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
            <input
              type="text"
              placeholder="Name"
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Organization"
              value={userForm.organization}
              onChange={(e) => setUserForm({ ...userForm, organization: e.target.value })}
            />

            <div className="modal-actions">
              <button className="primary-button" onClick={handleSaveUser}>
                Save
              </button>
              <button
                className="secondary-button"
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                  setUserForm({ name: '', email: '', organization: '' });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerDistribute;
