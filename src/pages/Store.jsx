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
  const [selectedCategories, setSelectedCategories] = useState(['all']);
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/games/public`);
        const data = await response.json();
        if (data.success) {
          setCompanyName(data.company_name);
          const featured = data.data.filter(game => game.is_featured);
          const nonFeatured = data.data.filter(game => !game.is_featured);
          setFeaturedGames(featured);
          setAllGames(nonFeatured);
        } else {
          setError('Failed to load games from database');
        }
      } catch (err) {
        console.error('Error fetching games:', err);
        setError('Failed to connect to the server.');
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const handleGameClick = (game) => setSelectedGame(game);
  const closeDetails = () => setSelectedGame(null);

  const filteredGames =
    selectedCategories.includes('all') || selectedCategories.length === 0
      ? allGames
      : allGames.filter((game) => {
          const gameCategories = Array.isArray(game.categories) ? game.categories : [];
          return selectedCategories.some((catId) =>
            gameCategories.includes(Number(catId))
          );
        });

  if (loading) {
    return (
      <div className="store-page">
        <div className="store-loading">
          <div className="store-spinner" />
          <p>Loading game catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="store-page">
      {/* Header */}
      <section className="store-hero">
        <div className="store-hero-inner">
          <div className="store-hero-text">
            <h1>Game Catalog</h1>
            <p>
              Explore our collection of interactive training games.
              <strong> Register as a Partner</strong> to access pricing and distribute games to your trainees.
            </p>
          </div>
          <div className="store-hero-controls">
            {companyName && (
              <span className="store-company-badge">{companyName}</span>
            )}
            <CategoryFilter
              selectedCategories={selectedCategories}
              onChange={setSelectedCategories}
            />
          </div>
        </div>
        {error && <p className="store-error">{error}</p>}
      </section>

      {/* Games Grid */}
      <section className="store-catalog">
        <div className="store-catalog-inner">
          {filteredGames.length > 0 ? (
            <div className="store-grid">
              {filteredGames.map((game) => (
                <GameTitle
                  key={game.id}
                  game={game}
                  onDetails={handleGameClick}
                  showActions={true}
                  isDisabled={true}
                  onSelect={() => {}}
                />
              ))}
            </div>
          ) : (
            <div className="store-empty">
              <p>No games found for the selected category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Game Details Slide-over */}
      {selectedGame && (
        <div className="store-detail-overlay" onClick={closeDetails}>
          <div className="store-detail-panel" onClick={(e) => e.stopPropagation()}>
            <div className="store-detail-header">
              <button className="store-detail-close" onClick={closeDetails} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="store-detail-body">
              <img
                src={`${import.meta.env.BASE_URL}${selectedGame.image_url.replace(/^\//, '')}`}
                alt={selectedGame.title}
                className="store-detail-image"
              />
              <h2 className="store-detail-title">{selectedGame.title}</h2>
              <p className="store-detail-short">{selectedGame.short_desc}</p>
              {selectedGame.long_desc && selectedGame.long_desc.trim() ? (
                <div className="store-detail-desc" dangerouslySetInnerHTML={{ __html: selectedGame.long_desc }} />
              ) : (
                <p className="store-detail-coming-soon">Detailed description coming soon...</p>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="site-footer">
        <p>Powered by <a href="https://antiztech.com" target="_blank" rel="noopener noreferrer">Antiz Technologies</a></p>
      </footer>
    </div>
  );
};

export default Store;
