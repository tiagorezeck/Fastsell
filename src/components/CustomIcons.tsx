import React from 'react';

interface IconProps {
  className?: string;
}

export const TableWithChairs: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <rect x="5" y="7" width="14" height="10" rx="1" />
    <path d="M7 3h4a1 1 0 0 1 1 1v2H6V4a1 1 0 0 1 1-1z" />
    <path d="M13 3h4a1 1 0 0 1 1 1v2h-6V4a1 1 0 0 1 1-1z" />
    <path d="M7 21h4a1 1 0 0 0 1-1v-2H6v2a1 1 0 0 0 1 1z" />
    <path d="M13 21h4a1 1 0 0 0 1-1v-2h-6v2a1 1 0 0 0 1 1z" />
    <path d="M1 10v4a1 1 0 0 0 1 1h2V9H2a1 1 0 0 0-1 1z" />
    <path d="M23 10v4a1 1 0 0 1-1 1h-2V9h2a1 1 0 0 1 1 1z" />
  </svg>
);

export const BarCounter: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* Tampo do Balcão */}
    <path d="M3 11h18" />
    <path d="M2 11v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2" />
    {/* Base do Balcão */}
    <path d="M4 15v4" />
    <path d="M20 15v4" />
    {/* Garrafas/Copos em cima */}
    <path d="M6 11V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4" />
    <path d="M14 11V9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2" />
  </svg>
);