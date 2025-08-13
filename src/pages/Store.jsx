import React from 'react';
import './Store.css';

const Store = () => {
  // Mock data for games (in production, this would come from MySQL)
  const featuredGames = [
    {
      id: 1,
      title: "Chemical Safety Fundamentals",
      description: "Learn proper handling and storage of hazardous chemicals in workplace environments.",
      image: "/game-placeholder.svg"
    },
    {
      id: 2,
      title: "Fire Emergency Response",
      description: "Master fire prevention techniques and emergency evacuation procedures.",
      image: "/game-placeholder.svg"
    },
    {
      id: 3,
      title: "Construction Site Safety",
      description: "Navigate construction hazards and implement proper safety protocols.",
      image: "/game-placeholder.svg"
    },
    {
      id: 4,
      title: "Electrical Safety Training",
      description: "Understand electrical hazards and safe working practices around electricity.",
      image: "/game-placeholder.svg"
    }
  ];

  const allGames = [
    {
      id: 5,
      title: "Personal Protective Equipment",
      description: "Learn when and how to use PPE effectively in various work environments.",
      image: "/game-placeholder.svg"
    },
    {
      id: 6,
      title: "Workplace Ergonomics",
      description: "Prevent musculoskeletal injuries through proper workplace setup.",
      image: "/game-placeholder.svg"
    },
    {
      id: 7,
      title: "Hazard Communication",
      description: "Understand safety data sheets and chemical labeling systems.",
      image: "/game-placeholder.svg"
    },
    {
      id: 8,
      title: "Machine Safety",
      description: "Safe operation and maintenance of industrial machinery.",
      image: "/game-placeholder.svg"
    },
    {
      id: 9,
      title: "Confined Space Entry",
      description: "Procedures for safe entry and work in confined spaces.",
      image: "/game-placeholder.svg"
    },
    {
      id: 10,
      title: "Fall Protection",
      description: "Prevention and protection systems for working at heights.",
      image: "/game-placeholder.svg"
    },
    {
      id: 11,
      title: "Respiratory Protection",
      description: "Selection and use of respiratory protective equipment.",
      image: "/game-placeholder.svg"
    },
    {
      id: 12,
      title: "Emergency Action Plans",
      description: "Develop and implement workplace emergency response procedures.",
      image: "/game-placeholder.svg"
    },
    {
      id: 13,
      title: "Forklift Operation Safety",
      description: "Safe operation and maintenance of powered industrial trucks.",
      image: "/game-placeholder.svg"
    },
    {
      id: 14,
      title: "Ladder Safety",
      description: "Proper selection, inspection, and use of ladders.",
      image: "/game-placeholder.svg"
    },
  ];

  const GameTile = ({ game, isFeatured = false }) => (
    <div className={`game-tile ${isFeatured ? 'featured' : ''}`}>
      <div className="game-image">
        <img src={game.image} alt={game.title} />
        <div className="game-overlay">
          <button className="play-button">Play Now</button>
        </div>
      </div>
      <div className="game-content">
        <h3 className="game-title">{game.title}</h3>
        <p className="game-description">{game.description}</p>
      </div>
    </div>
  );

  return (
    <div className="store-page">
      <div className="store-header">
        <h1>Game Store</h1>
        <p>Explore our comprehensive collection of interactive safety training games</p>
      </div>

      {/* Featured Games Section */}
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

      {/* All Games Store Section */}
      <section className="store-section">
        <h2 className="section-title">
          <span className="title-accent">All</span> Store Games
        </h2>
        <div className="store-grid-container">
          <div className="store-grid">
            {allGames.map(game => (
              <GameTile key={game.id} game={game} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Store;