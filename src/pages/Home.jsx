import React from "react";
import { Canvas } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import GameCard3D from "../components/GameCard3D";
import Movingpartcle from "../components/Movingpartcle";
import Planet from "../components/Planet";
import "./Home.css";

function FloatingObject({ position }) {
  return (
    <Float speed={0.5} rotationIntensity={2} floatIntensity={2}>
      <mesh position={position}>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>
    </Float>
  );
}

const Home = () => {
  return (
    <div className="home_page-content">
      <div className="background-image">

        {/* 3D Canvas */}
        <Canvas camera={{ position: [0, 0, 18], fov: 50 }}>
  <ambientLight intensity={0.6} />
  <directionalLight position={[5, 5, 5]} intensity={2} />
  <directionalLight position={[-5, 3, 5]} intensity={1} />

  <Environment preset="city" />

  <Planet />

  <Movingpartcle />
  <GameCard3D />
</Canvas>

        {/* Overlay Text */}
        <div className="overlay">
          <h1 className="overlay-title">
            Gamified Training: A Smarter Way to Learn
          </h1>
          <p className="overlay-text">
            Engage your Workforce through interactive and effective Serious games
            tailored for industrial and corporate environments
          </p>
        </div>

      </div>
    </div>
  );
};

export default Home;