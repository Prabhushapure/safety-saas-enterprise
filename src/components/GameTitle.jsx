import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/Store.css';

const GameTile = ({ game, isFeatured = false, onDetails, showActions = false, onSelect }) => {
  const navigate = useNavigate();

  return (
    <div className={`game-tile ${isFeatured ? 'featured' : ''}`}>
      <div className="game-image">
        <img src={game.image_url} alt={game.title} />
        <div className="game-overlay">
          <button className="details-button" onClick={() => onDetails(game)}>
            Details
          </button>
        </div>
      </div>

      <div className="game-content">
        <h3 className="game-title">{game.title}</h3>
        <p className="game-short-desc">{game.short_desc}</p>
      </div>

      {/* Action buttons for Partner License page */}
      {showActions && (
        <div className="game-actions">
          <button
            className="nav-button secondary"
            // onClick={() => navigate(`/game/${game.slug || game.id}`)}
          >
            Play Game
          </button>
          <button
            className="nav-button primary"
            onClick={() => onSelect(game)}
          >
            Select Game
          </button>
        </div>
      )}
    </div>
  );
};

export default GameTile;
