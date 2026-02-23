import React, { useEffect, useState } from 'react';
import './GameManagement.css';
import { useNavigate } from "react-router-dom";

const API_BASE_URL = '/AWE-SaaS/api';

const ListManagement = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [gameList, setGameList] = useState([]);
  const [showGameDropdown, setShowGameDropdown] = useState(false);

  const [formData, setFormData] = useState({
    list_name: '',
    description: '',
    games: []
  });

  const navigate = useNavigate();

  // Fetch lists
  useEffect(() => {
    fetchLists();
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/games`);
        const json = await res.json();
  
        if (json.success) {
          setGameList(json.data);
        }
      } catch (err) {
        console.error("Error fetching games", err);
      }
    };
  
    fetchGames();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.gm-multi-dropdown')) {
        setShowGameDropdown(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchLists = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/games/lists`);
      const json = await res.json();

      if (json.success) {
        setLists(json.data);
      } else {
        setError('Failed to load lists');
      }
    } catch (err) {
      console.error(err);
      setError('Error fetching lists');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (list = null) => {

    if (list) {
      setEditMode(true);
      setEditId(list.id);
  
      // fetch games in this list
      const res = await fetch(`${API_BASE_URL}/games/lists/${list.id}/games`);
      const json = await res.json();
  
      let selectedGames = [];
  
      if (json.success) {
        selectedGames = json.data.map(g => Number(g.id));
      }
  
      setFormData({
        list_name: list.list_name,
        description: list.description || '',
        games: selectedGames
      });
  
    } else {
  
      setEditMode(false);
      setFormData({
        list_name: '',
        description: '',
        games: []
      });
  
    }
  
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSaveList = async () => {
    try {
      const url = editMode
        ? `${API_BASE_URL}/games/lists/${editId}`
        : `${API_BASE_URL}/games/lists`;

      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert(editMode ? 'List updated successfully!' : 'List created successfully!');
        handleCloseModal();
        fetchLists();
      } else {
        alert(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to save list');
    }
  };

  const handleDeleteList = async (id) => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      try {
        const res = await fetch(`${API_BASE_URL}/games/lists/${id}`, {
          method: 'DELETE'
        });

        const data = await res.json();

        if (data.success) {
          alert('List deleted successfully!');
          fetchLists();
        } else {
          alert(data.message || 'Failed to delete list');
        }
      } catch (error) {
        console.error(error);
        alert('Error deleting list');
      }
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

          <h1 className="gm-title gm-title-center">List Management</h1>

          <button
            className="gm-btn-primary"
            onClick={() => handleOpenModal()}
          >
            + Create List
          </button>
        </div>

        <p className="gm-subtitle">Available Game Lists</p>

        {loading ? (
          <p>Loading lists...</p>
        ) : error ? (
          <p className="gm-error">{error}</p>
        ) : (
          <div className="gm-table-container">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>List Name</th>
                  <th>Description</th>
                  <th>No. of Games</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lists.length > 0 ? (
                  lists.map((list) => (
                    <tr key={list.id}>
                      <td>{list.id}</td>
                      <td>{list.list_name}</td>
                      <td>{list.description}</td>
                      <td>{list.game_count}</td>
                      <td className="gm-actions">
                        <button
                          className="gm-btn-edit"
                          onClick={() => handleOpenModal(list)}
                        >
                          Edit
                        </button>
                        <button
                          className="gm-btn-delete"
                          onClick={() => handleDeleteList(list.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>
                      No lists found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="gm-modal-overlay" onClick={handleCloseModal}>
          <div className="gm-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="gm-modal-title">
              {editMode ? 'Edit List' : 'Create New List'}
            </h2>

            <div className="gm-form">
              <label>List Name</label>
              <input
                type="text"
                value={formData.list_name}
                onChange={(e) =>
                  setFormData({ ...formData, list_name: e.target.value })
                }
              />

              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              ></textarea>

<label>Select Games</label>

<div className="gm-multi-dropdown">
  <button
    type="button"
    className="gm-multi-dropdown-btn"
    onClick={() => setShowGameDropdown(!showGameDropdown)}
  >
    {formData.games.length > 0
      ? `${formData.games.length} selected`
      : "Select Games"}
    <span className="gm-dropdown-icon">▼</span>
  </button>

  {showGameDropdown && (
    <div className="gm-multi-dropdown-menu">
      {gameList.map((game) => {
        const gameId = Number(game.id);

        return (
          <label key={gameId} className="gm-multi-dropdown-item">
            <input
              type="checkbox"
              checked={formData.games.map(Number).includes(Number(game.id))}
              onChange={() => {
                const exists = formData.games.includes(gameId);

                setFormData({
                  ...formData,
                  games: exists
                    ? formData.games.filter((x) => x !== gameId)
                    : [...formData.games, gameId],
                });
              }}
            />
            <span>{game.title}</span>
          </label>
        );
      })}
    </div>
  )}
</div>

              <div className="gm-modal-actions">
                <button
                  className="gm-btn-secondary"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  className="gm-btn-primary"
                  onClick={handleSaveList}
                >
                  {editMode ? 'Update List' : 'Save List'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListManagement;