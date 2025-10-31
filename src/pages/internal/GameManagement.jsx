import React, { useEffect, useState } from 'react';
import './GameManagement.css';

const API_BASE_URL = '/api';

const GameManagement = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    game_code: '',
    max_score: '',
    short_desc: '',
    long_desc: '',
    game_url: '', // ✅ added new field
    image: null,
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

  // Modal open/close
  const handleOpenModal = (game = null) => {
    if (game) {
      // Edit mode
      setEditMode(true);
      setEditId(game.id);
      setFormData({
        title: game.title,
        game_code: game.game_code,
        max_score: game.max_score,
        short_desc: game.short_desc,
        long_desc: game.long_desc,
        game_url: game.game_url || '', // ✅ load existing URL
        image: null,
      });
    } else {
      // Create mode
      setEditMode(false);
      setFormData({
        title: '',
        game_code: '',
        max_score: '',
        short_desc: '',
        long_desc: '',
        game_url: '', // ✅ empty for new
        image: null,
      });
      setPreviewImage(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPreviewImage(null);
  };

  // Input handling
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Save game (Create or Edit)
  const handleSaveGame = async () => {
    try {
      let imageUrl = formData.game_url; // existing image url if editing
  
      // 🔹 Step 1: Upload image (if a new one is selected)
      if (formData.image) {
        const reader = new FileReader();
  
        reader.onloadend = async () => {
          const base64String = reader.result.split(',')[1]; // remove prefix
  
          // 🔹 Send Base64 to backend (no multer)
          const uploadRes = await fetch(`${API_BASE_URL}/upload-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: `${formData.game_code}.png`, // e.g., GAME123.png
              fileData: base64String,
            }),
          });
  
          const uploadJson = await uploadRes.json();
          if (uploadJson.success) {
            imageUrl = uploadJson.imageUrl;
            await saveGameData(imageUrl);
          } else {
            alert('Image upload failed');
          }
        };
  
        reader.readAsDataURL(formData.image);
        return; // Wait for reader to finish
      }
  
      // 🔹 Step 2: If no new image, just save the game
      await saveGameData(imageUrl);
  
    } catch (error) {
      console.error('Error saving game:', error);
      alert('Failed to save game');
    }
  };
  
  // helper function to save game details
  const saveGameData = async (imageUrl) => {
    const url = editMode
      ? `${API_BASE_URL}/games/${editId}`
      : `${API_BASE_URL}/games`;
    const method = editMode ? 'PUT' : 'POST';
  
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.title,
        game_code: formData.game_code,
        max_score: formData.max_score,
        short_desc: formData.short_desc,
        long_desc: formData.long_desc,
        game_url: imageUrl, // ✅ save uploaded image URL
      }),
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
  };  
  

  // Delete game
  const handleDeleteGame = (id) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      alert(`Game with ID ${id} deleted (UI only)`);
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
                  <td colSpan="6" style={{ textAlign: 'center' }}>
                    No games found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

              <label>Max Possible Score</label>
              <input
                type="number"
                name="max_score"
                value={formData.max_score}
                onChange={handleInputChange}
                placeholder="Enter max score"
              />

              <label>Game URL</label> {/* ✅ new input */}
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

              <label>Upload Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />

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
