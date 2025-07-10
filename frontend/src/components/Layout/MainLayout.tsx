import React from 'react';
import Squares from '../Background/Squares';
import Navbar from '../Navigation/Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative bg-black">
      {/* Background squares */}
      <div className="fixed inset-0 opacity-20">
        <Squares
          direction="diagonal"
          speed={0.5}
          borderColor="#ffffff"
          squareSize={50}
          hoverFillColor="#ffffff"
        />
      </div>
      
      {/* Navigation */}
      <Navbar />
      
      {/* Content */}
      <div className="relative z-10 pt-16">
        {children}
      </div>
    </div>
  );
};

export default MainLayout; 