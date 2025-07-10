import React from 'react';
import Beams from './Beams';

interface BackgroundProps {
  children: React.ReactNode;
}

const Background: React.FC<BackgroundProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Mobile layout */}
      <div className="sm:hidden relative min-h-screen">
        <div className="absolute inset-0">
          <Beams
            beamWidth={2}
            beamHeight={15}
            beamNumber={12}
            lightColor="#4f46e5"
            speed={1.5}
            noiseIntensity={1.75}
            scale={0.2}
            rotation={45}
          />
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          {children}
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:flex min-h-screen w-full">
        {/* Dark left section */}
        <div className="w-[45%] bg-black relative z-10">
          {children}
        </div>
        
        {/* Animated right section */}
        <div className="flex-1 relative">
          <div className="absolute inset-0">
            <Beams
              beamWidth={2}
              beamHeight={15}
              beamNumber={12}
              lightColor="#4f46e5"
              speed={1.5}
              noiseIntensity={1.75}
              scale={0.2}
              rotation={45}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Background; 