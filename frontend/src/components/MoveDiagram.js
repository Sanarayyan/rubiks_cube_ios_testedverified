import React from 'react';

const FACE_COLOR = {
  U: '#FFFFFF',
  D: '#FFD500',
  R: '#FF5800', // Orange per your scheme
  L: '#C41E3A', // Red per your scheme
  F: '#0051BA',
  B: '#009E60',
};

// Arrow path presets (clockwise vs counterclockwise)
function Arrow({ cw }) {
  return (
    <g stroke="#1f2937" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {cw ? (
        <>
          <path d="M 70 30 A 40 40 0 1 1 30 70" />
          <path d="M 30 70 L 20 45" />
          <path d="M 30 70 L 55 60" />
        </>
      ) : (
        <>
          <path d="M 30 30 A 40 40 0 1 0 70 70" />
          <path d="M 70 70 L 45 60" />
          <path d="M 70 70 L 80 45" />
        </>
      )}
    </g>
  );
}

const MoveDiagram = ({ notation = 'U' }) => {
  const face = notation[0];
  const isPrime = notation.includes("'");
  const isDouble = notation.includes('2');
  const faceColor = FACE_COLOR[face] || '#ddd';

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-64 h-64">
        {/* Face square */}
        <rect x="10" y="10" width="80" height="80" fill={faceColor} stroke="#000" strokeWidth="4" rx="6" />
        {/* Arrow(s) */}
        {!isDouble ? (
          <Arrow cw={!isPrime} />
        ) : (
          <>
            <Arrow cw={true} />
            <g transform="translate(0,18)">
              <Arrow cw={true} />
            </g>
          </>
        )}
        {/* Label */}
        <text x="50" y="95" textAnchor="middle" fontSize="14" fill="#111" fontFamily="sans-serif">
          {face} {isDouble ? '2' : isPrime ? '′' : ''}
        </text>
      </svg>
    </div>
  );
};

export default MoveDiagram;
