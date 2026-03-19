import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Planet() {
  const ref = useRef();

  useFrame(() => {
    ref.current.rotation.y += 0.01;
  });

  return (
    <mesh ref={ref} position={[2, 1, -30]}>
      <sphereGeometry args={[15, 54, 40]} />
      <meshStandardMaterial color="#dc2626" />
    </mesh>
  );
}