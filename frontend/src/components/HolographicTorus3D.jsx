import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const IridescentRing = () => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.15;
    meshRef.current.rotation.y += delta * 0.25;
    meshRef.current.rotation.z += delta * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      {/* Squashing the Z-axis slightly gives it that ribbon-like Mobius feel */}
      {/* Scale squashes it flat, torus args make it a very thin wire */}
      <mesh ref={meshRef} scale={[1.2, 1.2, 0.2]}>
        {/* args: radius, tube thickness, radial segments, tubular segments */}
        <torusGeometry args={[2.0, 0.08, 128, 256]} />
        <meshPhysicalMaterial 
          color="#000000" // Dark base
          metalness={1}
          roughness={0.3} // High enough to blend colors smoothly into a gradient
          iridescence={1}
          iridescenceIOR={1.5}
          iridescenceThicknessRange={[100, 400]}
          clearcoat={1}
          clearcoatRoughness={0.1} // Keeps a glossy sharp reflection on top
        />
      </mesh>
    </Float>
  );
};

export default function HolographicTorus3D() {
  return (
    <div style={{ width: '100%', height: '100%', background: 'transparent' }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} gl={{ alpha: true }}>
        <ambientLight intensity={1.5} />
        
        {/* Powerful colored lights to "paint" the gradient onto the metallic surface */}
        <directionalLight position={[0, -5, 5]} color="#00ffaa" intensity={4} /> {/* Green bottom */}
        <directionalLight position={[-5, 5, 5]} color="#5500ff" intensity={4} /> {/* Purple top left */}
        <directionalLight position={[5, 5, 5]} color="#ff0055" intensity={4} /> {/* Pink top right */}
        <directionalLight position={[5, -5, 5]} color="#ffaa00" intensity={3} /> {/* Orange bottom right */}
        <directionalLight position={[-5, -5, 5]} color="#00ddff" intensity={3} /> {/* Cyan bottom left */}

        {/* Studio environment provides the sharp white highlights and realistic reflections */}
        <Environment preset="studio" />
        <OrbitControls enableZoom={false} enablePan={false} />
        <IridescentRing />
      </Canvas>
    </div>
  );
}
