import React from 'react';
import './HolographicTorus.css';

const HolographicTorus = () => {
  return (
    <div className="holographic-torus-wrapper">
      {/* Background ambient glow */}
      <div className="torus-glow"></div>
      
      {/* The main spinning rings */}
      <div className="torus-ring base-ring"></div>
      <div className="torus-ring overlay-ring"></div>

      {/* SVG Filter for noise, grain, and 3D bevel lighting */}
      <svg width="0" height="0" className="torus-svg-defs">
        <defs>
          <filter id="holographic-noise" x="-20%" y="-20%" width="140%" height="140%">
            {/* 1. Grain/Noise generation */}
            <feTurbulence type="fractalNoise" baseFrequency="1.5" numOctaves="2" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.12 0" in="noise" result="lightNoise" />
            
            {/* 2. 3D Bevel/Lighting generation from the alpha channel mask */}
            <feGaussianBlur in="SourceAlpha" stdDeviation="12" result="blur" />
            
            {/* Primary light source for metallic reflection */}
            <feSpecularLighting in="blur" surfaceScale="25" specularConstant="1.6" specularExponent="40" lightingColor="#ffffff" result="specLight1">
              <fePointLight x="50" y="-100" z="250" />
            </feSpecularLighting>
            
            {/* Secondary colored light source for iridescence */}
            <feSpecularLighting in="blur" surfaceScale="20" specularConstant="1.2" specularExponent="30" lightingColor="#00ffff" result="specLight2">
              <fePointLight x="300" y="300" z="150" />
            </feSpecularLighting>
            
            {/* Clip lights to the torus shape */}
            <feComposite in="specLight1" in2="SourceAlpha" operator="in" result="specLight1Clipped" />
            <feComposite in="specLight2" in2="SourceAlpha" operator="in" result="specLight2Clipped" />
            
            {/* Combine the two lights */}
            <feComposite in="specLight1Clipped" in2="specLight2Clipped" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="combinedLights" />
            
            {/* Blend lighting with the original gradient colors */}
            <feComposite in="SourceGraphic" in2="combinedLights" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litSource" />
            
            {/* Add the grain overlay on top */}
            <feBlend mode="screen" in="lightNoise" in2="litSource" result="final" />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default HolographicTorus;
