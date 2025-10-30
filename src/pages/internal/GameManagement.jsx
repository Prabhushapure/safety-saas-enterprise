import React, { useEffect, useState } from 'react';
import './GameManagement.css';

const API_BASE_URL = '/api';

const GameManagement = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    game_code: '',
    max_score: '',
    short_desc: '',
    long_desc: '',
    image: null,
  });

  // Fetch game data from API
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

  // Handle opening and closing modal
  const handleOpenModal = () => {
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      title: '',
      game_code: '',
      max_score: '',
      short_desc: '',
      long_desc: '',
      image: null,
    });
    setPreviewImage(null);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Save new game (UI only for now)
  const handleSaveGame = () => {
    alert('Game created successfully (UI only)');
    handleCloseModal();
  };

  return (
    <div className="gm-page">
      <div className="gm-card">
        <div className="gm-header">
          <h1 className="gm-title">Game Management</h1>
          <button className="gm-btn-primary" onClick={handleOpenModal}>
            + Create Game
          </button>
        </div>
        <p className="gm-subtitle">List of Available Games</p>

        {loading ? (
          <p>Loading games...</p>
        ) : error ? (
          <p className="gm-error">{error}</p>
        ) : (
          <table className="gm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Game Title</th>
                <th>Game Code</th>
                <th>Short Description</th>
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>
                    No games found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ===== Create Game Modal ===== */}
      {showModal && (
        <div className="gm-modal-overlay" onClick={handleCloseModal}>
          <div className="gm-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="gm-modal-title">Create New Game</h2>

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

              <label>Max Possible Score</label>
              <input
                type="number"
                name="max_score"
                value={formData.max_score}
                onChange={handleInputChange}
                placeholder="Enter max score"
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

              <label>Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />

              {previewImage && (
                <div className="gm-img-preview">
                  <img src={previewImage} alt="Preview" />
                </div>
              )}

              <div className="gm-modal-actions">
                <button className="gm-btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button className="gm-btn-primary" onClick={handleSaveGame}>
                  Save Game
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
