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
  const [selectedCategory, setSelectedCategory] = useState('category1'); // default Safety

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

  const CARD_COLORS = [
    '#fef3c7', // amber
    '#e0f2fe', // sky
    '#ecfeff', // cyan
    '#fce7f3', // pink
    '#ede9fe', // violet
    '#dcfce7', // green
  ];

  const GameTile = ({ game, isFeatured = false, bgColor }) => (
    <div className={`game-tile ${isFeatured ? 'featured' : ''}`}>
      <div className="game-image">
        <img src={game.image_url} alt={game.title} />
        <div className="game-overlay">
          <button className="details-button" onClick={() => handleGameClick(game)}>
            Details
          </button>
        </div>
      </div>
  
      <div
        className="game-content"
        style={{ backgroundColor: bgColor }}
      >
        <h3 className="game-title">{game.title}</h3>
        <p className="game-short-desc">{game.short_desc}</p>
      </div>
    </div>
  );

  // Filter games by selected category (supports both 'category' and 'game_category' fields)
  const CATEGORY_MAP = {
    category1: ['category1', 'safety'],
    category2: ['category2', 'quality'],
    category3: ['category3', 'wharehousing'],
    category4: ['category4', 'hr'],
  };

  const matchesCategory = (game, selectedCat) => {
    const raw = (game.category ?? game.game_category ?? '').toString().toLowerCase().trim();
    const allowed = CATEGORY_MAP[selectedCat] || [];

    // Direct match against known values (code or label)
    if (raw && allowed.includes(raw)) return true;

    // Fallback for Safety: infer from game_code when category field is empty
    if (!raw && selectedCat === 'category1') {
      const code = (game.game_code ?? '').toString().toUpperCase();
      if (code.startsWith('SAFETY_') || code.includes('SAFETY')) return true;
    }

    return false;
  };

  const filteredGames =
  selectedCategory === 'category5'
    ? allGames
    : allGames.filter((game) => matchesCategory(game, selectedCategory));


  if (loading) {
    return (
      <div className="store-page">
        <div className="store-header">
          <p>Explore the comprehensive collection of interactive learning games in game catalog. Register as a Partner to get to know more details on modes of usage and pricing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="store-page">
      <div className="store-header">
        <p><strong>Explore</strong> the comprehensive collection of interactive learning games in game catalog. <strong>Register as a Partner</strong> to get to know more details on modes of usage and pricing.
        </p>
        {/* Category Filter (right side of header) */}
        <div className="store-filter">
          <label htmlFor="category-filter">Category:</label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '6px 8px' }}
          >
            <option value="category1">Safety</option>
            <option value="category2">Quality</option>
            <option value="category3">Warehousing</option>
            <option value="category4">HR</option>
            <option value="category5">All</option>
          </select>
        </div>
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
  <GameTile
    key={game.id}
    game={game}
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