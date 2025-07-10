import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-card backdrop-blur-sm border border-default rounded-lg p-6 transition-all hover:bg-card-hover ${className}`}>
      {children}
    </div>
  );
};

export default Card; 