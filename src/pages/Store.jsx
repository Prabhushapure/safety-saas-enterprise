import React, { useState, useEffect, useRef } from 'react';
import GameTitle from '../components/GameTitle';
import CategoryFilter from '../components/CategoryFilter';
import useScrollReveal from '../hooks/useScrollReveal';
import './Store.css';

const API_BASE_URL = 'api';

const Store = () => {
  const pageRef = useRef(null);
  useScrollReveal(pageRef);
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
          setFeaturedGames(data.data.filter(game => game.is_featured));
          setAllGames(data.data.filter(game => !game.is_featured));
        } else {
          setError('Failed to load games');
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
          const gc = Array.isArray(game.categories) ? game.categories : [];
          return selectedCategories.some((catId) => gc.includes(Number(catId)));
        });

  // Parse long_desc HTML into structured sections
  const parseDescription = (html) => {
    if (!html) return null;
    const sections = [];
    const parts = html.split(/<br\s*\/?>\s*<br\s*\/?>/gi).map(p => p.replace(/<br\s*\/?>/gi, '\n').trim()).filter(Boolean);
    parts.forEach(part => {
      const lines = part.split('\n').map(l => l.replace(/<[^>]*>/g, '').trim()).filter(Boolean);
      if (lines.length === 0) return;
      // Check if first line is a header-like (all caps or ends with colon)
      const firstLine = lines[0];
      if (firstLine.match(/^[A-Z\s&:]+$/) || firstLine.endsWith(':')) {
        sections.push({ heading: firstLine.replace(/:$/, ''), items: lines.slice(1) });
      } else {
        sections.push({ heading: null, items: lines });
      }
    });
    return sections;
  };

  if (loading) {
    return (
      <div className="store-page">
        <div className="store-loading"><div className="store-spinner" /><p>Loading game catalog...</p></div>
      </div>
    );
  }

  return (
    <div className="store-page" ref={pageRef}>
      <section className="store-hero">
        <div className="store-hero-inner">
          <div className="store-hero-text" data-reveal>
            <h1>Game Catalog</h1>
            <p>Explore our collection of interactive training games. <strong>Register as a Partner</strong> to access pricing and distribute games to your trainees.</p>
          </div>
          <div className="store-hero-controls">
            {companyName && <span className="store-company-badge">{companyName}</span>}
            <CategoryFilter selectedCategories={selectedCategories} onChange={setSelectedCategories} />
          </div>
        </div>
        {error && <p className="store-error">{error}</p>}
      </section>

      <section className="store-catalog">
        <div className="store-catalog-inner">
          {filteredGames.length > 0 ? (
            <div className="store-grid">
              {filteredGames.map((game, i) => (
                <div key={game.id} data-reveal="scale" data-reveal-delay={Math.min(i * 60, 400)}>
                  <GameTitle game={game} onDetails={handleGameClick} showActions={true} isDisabled={true} onSelect={() => {}} />
                </div>
              ))}
            </div>
          ) : (
            <div className="store-empty"><p>No games found for the selected category.</p></div>
          )}
        </div>
      </section>

      {/* Game Detail Modal — centered popup with image + structured text */}
      {selectedGame && (
        <div className="gd-overlay" onClick={closeDetails}>
          <div className="gd-modal" onClick={(e) => e.stopPropagation()}>
            <button className="gd-close" onClick={closeDetails} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
            <div className="gd-layout">
              {/* Left — Image */}
              <div className="gd-image-col">
                <img
                  src={`${import.meta.env.BASE_URL}${selectedGame.image_url.replace(/^\//, '')}`}
                  alt={selectedGame.title}
                  className="gd-image"
                />
              </div>
              {/* Right — Content */}
              <div className="gd-content-col">
                <h2 className="gd-title">{selectedGame.title}</h2>
                <p className="gd-subtitle">{selectedGame.short_desc}</p>

                {/* Structured description */}
                {selectedGame.long_desc && selectedGame.long_desc.trim() ? (
                  <div className="gd-sections">
                    {parseDescription(selectedGame.long_desc)?.map((section, idx) => (
                      <div className="gd-section" key={idx}>
                        {section.heading && <h4 className="gd-section-heading">{section.heading}</h4>}
                        {section.items.map((item, j) => (
                          <p className="gd-section-item" key={j}>{item}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="gd-coming-soon">Detailed description coming soon...</p>
                )}
              </div>
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
