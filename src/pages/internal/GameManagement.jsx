import React, { useEffect, useState } from 'react';
import './GameManagement.css';

const API_BASE_URL = '/AWE-SaaS/api';

const GameManagement = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    game_code: '',
    max_score: '',
    short_desc: '',
    long_desc: '',
    list_price: '',
    game_url: '',
    image_url: '', 
    category: '',
  });

  // Fetch games
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/games`);
        const json = await res.json();

        if (json.success) {
          setGames(json.data);
        } else {
          setError('Failed to load games');
        }
      } catch (err) {
        console.error('Error fetching games:', err);
        setError('Error fetching games');
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const handleOpenModal = (game = null) => {
    if (game) {
      setEditMode(true);
      setEditId(game.id);
      setFormData({
        title: game.title,
        game_code: game.game_code,
        max_score: game.max_score,
        short_desc: game.short_desc,
        long_desc: game.long_desc,
        list_price: game.list_price || '',
        game_url: game.game_url || '',
        image_url: game.image_url || '',
        category: game.category || '',
      });
    } else {
      setEditMode(false);
      setFormData({
        title: '',
        game_code: '',
        max_score: '',
        short_desc: '',
        long_desc: '',
        list_price: '',
        game_url: '',
        image_url: '',
        category: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveGame = async () => {
    try {
      const url = editMode
        ? `${API_BASE_URL}/games/${editId}`
        : `${API_BASE_URL}/games`;
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert(editMode ? 'Game updated successfully!' : 'Game created successfully!');
        handleCloseModal();

        const res = await fetch(`${API_BASE_URL}/games`);
        const json = await res.json();
        if (json.success) setGames(json.data);
      } else {
        alert(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error saving game:', error);
      alert('Failed to save game');
    }
  };

  const handleDeleteGame = async (id) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      try {
        const res = await fetch(`${API_BASE_URL}/games/${id}`, { method: 'DELETE' });
        const data = await res.json();

        if (data.success) {
          alert('Game deleted successfully!');
          setGames(games.filter((game) => game.id !== id)); 
        } else {
          alert(data.message || 'Failed to delete game');
        }
      } catch (error) {
        console.error('Error deleting game:', error);
        alert('Error deleting game');
      }
    }
  };


  return (
    <div className="gm-page">
      <div className="gm-card">
        <div className="gm-header">
          <h1 className="gm-title">Game Management</h1>
          <button className="gm-btn-primary" onClick={() => handleOpenModal()}>
            + Create Game
          </button>
        </div>
        <p className="gm-subtitle">List of Available Games</p>

        {loading ? (
          <p>Loading games...</p>
        ) : error ? (
          <p className="gm-error">{error}</p>
        ) : (
          <div className="gm-table-container">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Game Title</th>
                  <th>Game Code</th>
                  <th>Short Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {games.length > 0 ? (
                  games.map((game) => (
                    <tr key={game.id}>
                      <td>{game.id}</td>
                      <td>{game.title}</td>
                      <td>{game.game_code}</td>
                      <td>{game.short_desc}</td>
                      <td className="gm-actions">
                        <button
                          className="gm-btn-edit"
                          onClick={() => handleOpenModal(game)}
                        >
                          Edit
                        </button>
                        <button
                          className="gm-btn-delete"
                          onClick={() => handleDeleteGame(game.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>
                      No games found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ===== Modal ===== */}
      {showModal && (
        <div className="gm-modal-overlay" onClick={handleCloseModal}>
          <div className="gm-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="gm-modal-title">
              {editMode ? 'Edit Game' : 'Create New Game'}
            </h2>

            <div className="gm-form">
              <label>Game Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter game title"
              />

              <label>Game Code</label>
              <input
                type="text"
                name="game_code"
                value={formData.game_code}
                onChange={handleInputChange}
                placeholder="Enter game code"
              />

              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="">Select Category</option>
                <option value="category1">Safety</option>
                <option value="category2">Quality</option>
                <option value="category3">Wherehousing</option>
                <option value="category4">HR</option>
                <option value="category5">Others</option>
              </select>


              <label>Max Possible Score</label>
              <input
                type="number"
                name="max_score"
                value={formData.max_score}
                onChange={handleInputChange}
                placeholder="Enter max score"
              />

<label>List Price</label>
<input
  type="number"
  name="list_price"
  value={formData.list_price}
  onChange={handleInputChange}
  placeholder="Enter game list price"
/>

              <label>Game URL</label>
              <input
                type="url"
                name="game_url"
                value={formData.game_url}
                onChange={handleInputChange}
                placeholder="Enter game URL (e.g., https://example.com)"
              />

              <label>Short Description</label>
              <textarea
                name="short_desc"
                value={formData.short_desc}
                onChange={handleInputChange}
                placeholder="Enter short description"
              ></textarea>

              <label>Long Description</label>
              <textarea
                name="long_desc"
                value={formData.long_desc}
                onChange={handleInputChange}
                placeholder="Enter detailed description"
              ></textarea>

              <label>Image URL</label>
              <input
                type="text"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="Enter image URL (e.g., /game_cards/game_name.png)"
              />

              {formData.image_url && (
                <div className="gm-img-preview">
                  <img src={formData.image_url} alt="Preview" />
                </div>
              )}

              <div className="gm-modal-actions">
                <button className="gm-btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button className="gm-btn-primary" onClick={handleSaveGame}>
                  {editMode ? 'Update Game' : 'Save Game'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameManagement;
