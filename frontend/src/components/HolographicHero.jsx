import React from 'react';
import HolographicTorus3D from './HolographicTorus3D';
import './HolographicHero.css';

export default function HolographicHero() {
  return (
    <div className="hero-container">
      {/* Authentic Photoshop transparent checkerboard background */}
      <div className="checkerboard-bg"></div>
      
      {/* 2D Typography Layer (Behind the 3D ring) */}
      <div className="hero-text-container">
        <div className="hero-text-wrapper">
          <span className="subtitle">ISOLATED ON</span>
          <h1 className="title-outline">TRANSPARENT</h1>
          <h1 className="title-filled">BACKGROUND</h1>
        </div>
      </div>

      {/* 3D Holographic Torus Layer (In front of the text) */}
      <div className="hero-3d-overlay">
        <HolographicTorus3D />
      </div>
    </div>
  );
}
