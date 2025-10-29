import React, { useEffect, useState } from 'react';
import './GameManagement.css';

const API_BASE_URL = '/api';

const GameManagement = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch game data from API
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

  return (
    <div className="gm-page">
      <div className="gm-card">
        <h1 className="gm-title">Game Management</h1>
        <p className="gm-subtitle">List of Available Games</p>

        {loading ? (
          <p>Loading games...</p>
        ) : error ? (
          <p className="gm-error">{error}</p>
        ) : (
          <table className="gm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Game Title</th>
                <th>Game Code</th>
                <th>Short Description</th>
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>
                    No games found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GameManagement;
