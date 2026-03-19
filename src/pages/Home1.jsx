import React from "react";
import { Canvas } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import "./Home.css";

function FloatingObject({ position }) {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
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
        <Canvas className="three-canvas" camera={{ position: [0, 0, 6] }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 3, 5]} />

          {/* Multiple floating objects */}
          <FloatingObject position={[-3, 0, 0]} />
          <FloatingObject position={[3, 1, -1]} />
          <FloatingObject position={[0, -2, -2]} />
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