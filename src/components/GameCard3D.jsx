import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const images = [
  "fire.jpg",
  "5s_shopfloor.jpg",
  "building_eviction.jpg",
  "order_picking.jpg",
  "chemical.jpg",
  "compressed_air.jpg",
  "confined_space.jpg",
  "DragDropPPE.jpg",
  "electrical.jpg",
  "ergonomics.jpg",
  "fire_extinguisher.jpg",
  "first_aid.jpg",
  "forklift.jpg",
  "gas_cylinder.jpg",
  "heavy_lifting.jpg",
  "heights.jpg",
  "hot_work.jpg",
  "inspection_line.jpg",
];

export default function GameCarousel3D() {

  const radius = 10;
  const rotationSpeed = 0.008;

  const rotationRef = useRef(0);
  const meshRefs = useRef([]);

  const textures = useMemo(() => {
    return images.map((img) =>
      new THREE.TextureLoader().load(
        "/AWE-SaaS/game_cards/" + img
      )
    );
  }, []);

  useFrame((state) => {

    rotationRef.current += rotationSpeed;
    const time = state.clock.elapsedTime;

    const zValues = textures.map((_, index) => {
      const baseAngle = (index / textures.length) * Math.PI * 2;
      const dynamicAngle = baseAngle + rotationRef.current;
      return Math.cos(dynamicAngle) * radius;
    });

    const maxZ = Math.max(...zValues);

    meshRefs.current.forEach((mesh, index) => {

      if (!mesh) return;

      const baseAngle = (index / textures.length) * Math.PI * 2;
      const dynamicAngle = baseAngle + rotationRef.current;

      const x = Math.sin(dynamicAngle) * radius;
      const z = Math.cos(dynamicAngle) * radius;

      // 🌊 Floating Y movement
      const y = Math.sin(time + index) * 0.3;

      mesh.position.set(x, y, z);

      mesh.rotation.y = -dynamicAngle;

      const isFront = z === maxZ;
      const targetScale = isFront ? 1.5 : 0.9;

      // ✨ Smooth scaling
      mesh.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    });

  });

  return (
    <>
      {textures.map((texture, index) => (
        <group
          key={index}
          ref={(el) => (meshRefs.current[index] = el)}
        >
  
          {/* 💎 Diamond Glass Border */}
          <mesh>
            <boxGeometry args={[3.8, 2.8, 0.25]} />
            <meshPhysicalMaterial
              color="#ffffff"
              roughness={0}
              metalness={0}
              transmission={1}
              thickness={0.5}
              clearcoat={1}
              clearcoatRoughness={0}
              envMapIntensity={2}
              transparent
              opacity={0.35}
            />
          </mesh>
  
          {/* 🖼 Actual Card */}
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[3.5, 2.5, 0.2]} />
            <meshPhysicalMaterial
              map={texture}
              roughness={0.1}
              metalness={0}
              clearcoat={1}
              clearcoatRoughness={0.05}
            />
          </mesh>
  
        </group>
      ))}
    </>
  );
}