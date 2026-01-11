import React, { useState, useEffect } from 'react';
import './Store.css';

const API_BASE_URL = 'api';

const Store = () => {
  const [featuredGames, setFeaturedGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showSidePanel, setShowSidePanel] = useState(false);

  // Fetch games data from API
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all games
        const response = await fetch(`${API_BASE_URL}/games`);
        const data = await response.json();

        if (data.success) {
          // Separate featured and non-featured games
          const featured = data.data.filter(game => game.is_featured);
          const nonFeatured = data.data.filter(game => !game.is_featured);
          
          setFeaturedGames(featured);
          setAllGames(nonFeatured);
        } else {
          setError('Failed to load games from database');
        }
      } catch (err) {
        console.error('Error fetching games:', err);
        setError('Failed to connect to the server. Please make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const handleGameClick = (game) => {
    setSelectedGame(game);
    setShowSidePanel(true);
  };

  const closeSidePanel = () => {
    setShowSidePanel(false);
    setSelectedGame(null);
  };

  const GameTile = ({ game, isFeatured = false }) => (
    <div className={`game-tile ${isFeatured ? 'featured' : ''}`}>
      <div className="game-image">
        <img src={game.image_url} alt={game.title} />
        <div className="game-overlay">
          <button className="details-button" onClick={() => handleGameClick(game)}>Details</button>
        </div>
      </div>
      <div className="game-content">
        <h3 className="game-title">{game.title}</h3>
        <p className="game-short-desc">{game.short_desc}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="store-page">
        <div className="store-header">
          <p>Explore the comprehensive collection of interactive safety training games here. Register as a Partner to get to know more details on modes of usage and pricing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="store-page">
      <div className="store-header">
        <p><strong>Explore</strong> the comprehensive collection of interactive safety training games here. <strong>Register as a Partner</strong> to get to know more details on modes of usage and pricing.
        </p>
        {error && (
          <div className="error-message" style={{color: '#e74c3c', marginTop: '10px', fontSize: '14px'}}>
            {error}
          </div>
        )}
      </div>

      {/* Featured Games Section */}
      {featuredGames.length > 0 && (
        <section className="featured-section">
          <h2 className="section-title">
            <span className="title-accent">Featured</span> Games
          </h2>
          <div className="featured-grid">
            {featuredGames.map(game => (
              <GameTile key={game.id} game={game} isFeatured={true} />
            ))}
          </div>
        </section>
      )}

      {/* All Games Store Section */}
      {allGames.length > 0 && (
        <section className="store-section">
          <div className="store-grid-container">
            <div className="store-grid">
              {allGames.map(game => (
                <GameTile key={game.id} game={game} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Show message if no games found */}
      {!loading && featuredGames.length === 0 && allGames.length === 0 && (
        <div className="no-games-message" style={{textAlign: 'center', padding: '40px', color: '#666'}}>
          <p>No games found in the database.</p>
        </div>
      )}

      {/* Game Details Modal */}
      {showSidePanel && selectedGame && (
        <div className="modal-overlay" onClick={closeSidePanel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="close-button" onClick={closeSidePanel}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <h1 className="modal-title">{selectedGame.title}</h1>
              <p className="modal-subtitle">{selectedGame.short_desc}</p>
              {selectedGame.long_desc && selectedGame.long_desc.trim() ? (
                <div className="modal-description" dangerouslySetInnerHTML={{ __html: selectedGame.long_desc }}></div>
              ) : (
                <div className="modal-coming-soon">Game description coming soon ...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Store;