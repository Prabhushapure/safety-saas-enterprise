import React from 'react';
import '../pages/Store.css';

const GameTile = ({ game, isFeatured = false, onDetails }) => (
  <div className={`game-tile ${isFeatured ? 'featured' : ''}`}>
    <div className="game-image">
      <img src={game.image_url} alt={game.title} />
      <div className="game-overlay">
        <button
          className="details-button"
          onClick={() => onDetails(game)}
        >
          Details
        </button>
      </div>
    </div>

    <div className="game-content">
      <h3 className="game-title">{game.title}</h3>
      <p className="game-short-desc">{game.short_desc}</p>
    </div>
  </div>
);

export default GameTile;
