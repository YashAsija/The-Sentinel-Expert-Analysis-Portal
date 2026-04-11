import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const DataStream = ({ intensity, color }: { intensity: number; color: string }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particleCount = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < particleCount; i++) {
      const x = pos[i * 3];
      const y = pos[i * 3 + 1];
      const z = pos[i * 3 + 2];
      
      // Swirling motion
      const angle = time * 0.1 + (i * 0.01);
      const radius = Math.sqrt(x * x + z * z);
      
      // During analysis (intensity > 0), particles swirl faster and contract slightly but stay complex
      const speed = 0.001 + (intensity * 0.01);
      const swirlX = Math.cos(angle) * radius;
      const swirlZ = Math.sin(angle) * radius;
      
      pos[i * 3] += (swirlX - x) * speed;
      pos[i * 3 + 2] += (swirlZ - z) * speed;
      
      // Vertical drift
      pos[i * 3 + 1] += Math.sin(time * 0.5 + i) * 0.002;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y = time * 0.05;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={intensity > 0.5 ? color : "#52525b"}
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

const ConnectionLines = ({ intensity, color }: { intensity: number; color: string }) => {
  const linesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!linesRef.current) return;
    linesRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    linesRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
  });

  return (
    <group ref={linesRef}>
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10]}>
          <boxGeometry args={[0.01, 0.01, Math.random() * 5]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.1 + (intensity * 0.2)} 
          />
        </mesh>
      ))}
    </group>
  );
};

export const ThreeBackground = ({ intensity = 0, color = "#00ffcc" }: { intensity?: number; color?: string }) => {
  return (
    <div className="fixed inset-0 -z-10 bg-[var(--bg-primary)] transition-colors duration-500">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <DataStream intensity={intensity} color={color} />
        <ConnectionLines intensity={intensity} color={color} />
      </Canvas>
    </div>
  );
};
