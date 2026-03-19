import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";

export default function Movingpartcle() {
  const ref = useRef();

  const particleCount = 2000;

  const positions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 200; // X
      arr[i * 3 + 1] = (Math.random() - 0.5) * 200; // Y
      arr[i * 3 + 2] = Math.random() * -200; // Z depth
    }

    return arr;
  }, []);

  useFrame((state) => {
    const positionsArray = ref.current.geometry.attributes.position.array;
  
    const time = state.clock.elapsedTime;
  
    for (let i = 0; i < particleCount; i++) {
  
      positionsArray[i * 3 + 2] += 0.6;
  
      if (positionsArray[i * 3 + 2] > 20) {
        positionsArray[i * 3 + 2] = -200;
      }
  
      // small floating movement
      positionsArray[i * 3 + 2] += 0.3 + Math.random() * 0.3;
    }
  
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
  size={0.7}
  color="#cbd5ff"
  transparent
  opacity={0.8}
  sizeAttenuation
/>
    </points>
  );
}