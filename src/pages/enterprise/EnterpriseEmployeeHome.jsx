import React, { useEffect, useState } from 'react';
import GameTitle from '../../components/GameTitle';
import CategoryFilter from '../../components/CategoryFilter';
import { getEnterpriseToken, useEnterpriseAuth } from '../../hooks/useEnterpriseAuth';
import '../Store.css';
import './EnterpriseEmployeeHome.css';

const API_BASE_URL = '/GamifiedLearning/api';

const CARD_COLORS = [
  '#fef3c7',
  '#e0f2fe',
  '#ecfeff',
  '#fce7f3',
  '#ede9fe',
  '#dcfce7'
];

const EnterpriseEmployeeHome = () => {
  const { userData, isLoading } = useEnterpriseAuth(['employee']);
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['all']);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    if (!userData) return;

    const loadGames = async () => {
      setLoadingGames(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/enterprise/me/games`, {
          headers: {
            Authorization: `Bearer ${getEnterpriseToken()}`
          }
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          setError(json.message || 'Failed to load games');
          return;
        }
        setGames(json.data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load games');
      } finally {
        setLoadingGames(false);
      }
    };

    loadGames();
  }, [userData]);

  if (isLoading || !userData) {
    return (
      <div className="employee-catalog-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  const filteredGames =
    selectedCategories.includes('all') || selectedCategories.length === 0
      ? games
      : games.filter((game) => {
          const gameCategories = Array.isArray(game.categories) ? game.categories : [];
          return selectedCategories.some((catId) => gameCategories.includes(Number(catId)));
        });

  return (
    <div className="employee-catalog-page">
      <div className="employee-catalog-toolbar">
        <CategoryFilter
          selectedCategories={selectedCategories}
          onChange={setSelectedCategories}
        />
      </div>

      {error && <p className="error-message">{error}</p>}

      {loadingGames ? (
        <div className="employee-catalog-loading">
          <div className="loading-spinner" />
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="no-games-message">
          <p>No games are assigned to your company catalog yet.</p>
        </div>
      ) : (
        <div className="store-grid-container">
          <div className="store-grid">
            {filteredGames.map((game, index) => (
              <GameTitle
                key={game.id}
                game={game}
                onDetails={setSelectedGame}
                showActions={false}
                bgColor={CARD_COLORS[index % CARD_COLORS.length]}
              />
            ))}
          </div>
        </div>
      )}

      {selectedGame && (
        <div className="modal-overlay" onClick={() => setSelectedGame(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button type="button" className="close-button" onClick={() => setSelectedGame(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <h1 className="modal-title">{selectedGame.title}</h1>
              <p className="modal-subtitle">{selectedGame.short_desc}</p>
              {selectedGame.long_desc && selectedGame.long_desc.trim() ? (
                <div
                  className="modal-description"
                  dangerouslySetInnerHTML={{ __html: selectedGame.long_desc }}
                />
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

export default EnterpriseEmployeeHome;
