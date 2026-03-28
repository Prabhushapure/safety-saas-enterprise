import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/Store.css';

const GameTile = ({
  game,
  isFeatured = false,
  onDetails,
  showActions = false,
  onSelect,
  showPrice = false,
  isTrialPlan = false,
  isDisabled = false,
}) => {
  const navigate = useNavigate();

  const handlePlayGame = () => {
    if (isDisabled || !game.game_url) return;
    if (game.game_url.startsWith('http')) {
      window.location.href = game.game_url;
    } else {
      navigate(game.game_url);
    }
  };

  return (
    <div className={`game-tile ${isFeatured ? 'featured' : ''}`}>
      <div className="game-image">
        <img
          src={`${import.meta.env.BASE_URL}${game.image_url.replace(/^\//, '')}`}
          alt={game.title}
        />
      </div>

      <div className="game-content">
        <h3 className="game-title">{game.title}</h3>
        <p className="game-short-desc">{game.short_desc}</p>
        {showPrice && <div className="game-price">US$ {game.list_price}</div>}
        <button className="details-button" onClick={() => onDetails(game)}>
          View Details
        </button>
      </div>

      {showActions && (
        <div className="game-actions">
          <button
            className={`nav-button primary ${isDisabled ? 'disabled' : ''}`}
            disabled={isDisabled || !game.game_url}
            title={
              isDisabled
                ? 'Game inactive'
                : !game.game_url
                ? 'Game not available'
                : 'Play Game'
            }
            onClick={handlePlayGame}
          >
            Play Game
          </button>
          <button
            className={`nav-button primary ${(isDisabled || isTrialPlan) ? 'disabled' : ''}`}
            disabled={isDisabled || isTrialPlan}
            title={
              isDisabled
                ? 'Game inactive'
                : isTrialPlan
                ? 'Upgrade plan to send licenses'
                : 'Select & Send'
            }
            onClick={() => !isDisabled && !isTrialPlan && onSelect(game)}
          >
            Select & Send
          </button>
        </div>
      )}
    </div>
  );
};

export default GameTile;
