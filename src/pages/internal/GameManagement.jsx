import React, { useEffect, useState } from 'react';
import './GameManagement.css';
import { useNavigate } from "react-router-dom";

const API_BASE_URL = '/GamifiedLearning/api';

const GameManagement = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [categoryList, setCategoryList] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    game_code: '',
    max_score: '',
    short_desc: '',
    long_desc: '',
    list_price: '',
    game_url: '',
    image_url: '',
    categories: [],
  });


  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.gm-multi-dropdown')) {
        setShowCategoryDropdown(false);
        setShowAddCategory(false);
        setNewCategoryName('');
        setNewCategoryDesc('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/games/categories`);
        const json = await res.json();

        if (json.success) {
          setCategoryList(json.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

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
        categories: game.categories || [],
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
        categories: [],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveGame = async () => {
    if (!formData.categories || formData.categories.length === 0) {
      alert('Please select at least one category');
      return;
    }
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
          <button
            className="gm-back-btn"
            onClick={() => navigate("/internal/catalog-management")}
          >
            ← Back
          </button>

          <h1 className="gm-title gm-title-center">Game Management</h1>

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

              <label>Categories</label>

              <div className="gm-multi-dropdown">
                <button
                  type="button"
                  className="gm-multi-dropdown-btn"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  {formData.categories.length > 0
                    ? `${formData.categories.length} selected`
                    : 'Select Categories'}
                  <span className="gm-dropdown-icon">▼</span>
                </button>

                {showCategoryDropdown && (
                  <div className="gm-multi-dropdown-menu">
                    {/* ✅ Category list */}
                    {categoryList.map((cat) => {
                      const catId = Number(cat.id);

                      return (
                        <label key={catId} className="gm-multi-dropdown-item">
                          <input
                            type="checkbox"
                            checked={formData.categories.includes(catId)}
                            onChange={() => {
                              const exists = formData.categories.includes(catId);

                              // ❌ stop if trying to remove last one
                              if (exists && formData.categories.length === 1) {
                                alert('At least one category must be selected');
                                return;
                              }

                              setFormData({
                                ...formData,
                                categories: exists
                                  ? formData.categories.filter((x) => x !== catId)
                                  : [...formData.categories, catId],
                              });
                            }}

                          />
                          <span>{cat.category_name}</span>
                        </label>
                      );
                    })}

                    {/* ✅ Footer (Add new category) */}
                    <div className="gm-dropdown-footer">
                      {!showAddCategory ? (
                        <button
                          type="button"
                          className="gm-add-category-btn"
                          onClick={() => setShowAddCategory(true)}
                        >
                          + Add New Category
                        </button>
                      ) : (
                        <div className="gm-add-category-form">
                          <input
                            type="text"
                            placeholder="Category name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                          />

                          <input
                            type="text"
                            placeholder="Description (optional)"
                            value={newCategoryDesc}
                            onChange={(e) => setNewCategoryDesc(e.target.value)}
                          />

                          <div className="gm-add-category-actions">
                            <button
                              type="button"
                              className="gm-add-category-cancel"
                              onClick={() => {
                                setShowAddCategory(false);
                                setNewCategoryName('');
                                setNewCategoryDesc('');
                              }}
                            >
                              Cancel
                            </button>

                            <button
                              type="button"
                              className="gm-add-category-save"
                              onClick={async () => {
                                if (!newCategoryName.trim()) return;

                                try {
                                  const res = await fetch(`${API_BASE_URL}/games/categories`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      category_name: newCategoryName.trim(),
                                      category_description: newCategoryDesc.trim(),
                                    }),
                                  });

                                  const json = await res.json();

                                  if (json.success) {
                                    // refresh categories
                                    const catRes = await fetch(`${API_BASE_URL}/games/categories`);
                                    const catJson = await catRes.json();
                                    if (catJson.success) setCategoryList(catJson.data);

                                    setShowAddCategory(false);
                                    setNewCategoryName('');
                                    setNewCategoryDesc('');
                                  } else {
                                    alert(json.message || 'Failed to create category');
                                  }
                                } catch (err) {
                                  console.error(err);
                                  alert('Error creating category');
                                }
                              }}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>





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
