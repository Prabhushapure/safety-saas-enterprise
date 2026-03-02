import React, { useState, useEffect } from 'react';
import GameTitle from '../components/GameTitle';
import CategoryFilter from '../components/CategoryFilter';
import './Store.css';

const API_BASE_URL = 'api';

const Store = () => {
  const [featuredGames, setFeaturedGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(['all']);
  
  // Fetch games data from API
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all games
        const response = await fetch(`${API_BASE_URL}/games/public`);
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

  const CARD_COLORS = [
    '#fef3c7', // amber
    '#e0f2fe', // sky
    '#ecfeff', // cyan
    '#fce7f3', // pink
    '#ede9fe', // violet
    '#dcfce7', // green
  ];

 

  const filteredGames =
  selectedCategories.includes('all') || selectedCategories.length === 0
    ? allGames
    : allGames.filter((game) => {
        const gameCategories = Array.isArray(game.categories) ? game.categories : [];
        return selectedCategories.some((catId) => gameCategories.includes(catId));
      });


  if (loading) {
    return (
      <div className="store-page">
        <div className="store-header">
          <div className="store-header-text">
          <p>Explore the comprehensive collection of interactive learning games in game catalog. Register as a Partner to get to know more details on modes of usage and pricing.
          </p>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="store-page">
      <div className="store-header">
      <div className="store-header-text">
        <p><strong>Explore</strong> the comprehensive collection of interactive learning games in game catalog. <strong>Register</strong> as a Partner (in the "<strong>Partner Login</strong>" above) to get full access to the Catalog, modes of usage & pricing.
        </p>
        </div>
        <CategoryFilter
          selectedCategories={selectedCategories}
          onChange={setSelectedCategories}
        />

        {error && (
          <div className="error-message" style={{color: '#e74c3c', marginTop: '10px', fontSize: '14px'}}>
            {error}
          </div>
        )}
      </div>


      {/* All Games Store Section */}
      {filteredGames.length > 0 && (
        <section className="store-section">
          <div className="store-grid-container">
            <div className="store-grid">
            {filteredGames.map((game, index) => (
  <GameTitle
    key={game.id}
    game={game}
    onDetails={handleGameClick}
    showActions={true}
    isDisabled={true}
    onSelect={() => {}}
    bgColor={CARD_COLORS[index % CARD_COLORS.length]}
  />
))}
            </div>
          </div>
        </section>
      )}

      {/* No games for selected category */}
      {filteredGames.length === 0 && (
        <div className="no-games-message" style={{textAlign: 'center', padding: '20px', color: '#666'}}>
          <p>No games found for the selected category.</p>
        </div>
      )}

      {/* Show message if no games found */}
      {!loading && featuredGames.length === 0 && allGames.length === 0 && (
        <div className="no-games-message" style={{textAlign: 'center', padding: '40px', color: '#666'}}>
          <p>No games found in the list.</p>
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