import React from 'react';

export default function BrandLogo({ title = 'PARVATI', subtitle = 'TEXTILES CENTRE' }) {
  return (
    <div className="brand-logo-wrap">
      <svg className="brand-mark-svg" viewBox="0 0 120 120" width="68" height="68" role="img" aria-label="Parvati logo">
        <defs>
          <linearGradient id="petalStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#d1d5db" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="56" fill="#0a0a0a" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <g key={angle} transform={`translate(60 60) rotate(${angle})`}>
            <path d="M0 -46 C14 -46 22 -36 22 -24 C22 -12 14 -2 0 -2 C-6 -2 -10 -6 -10 -12 C-10 -18 -6 -22 0 -22 C4 -22 7 -19 7 -15" fill="#f3e117" stroke="url(#petalStroke)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}
        <circle cx="60" cy="60" r="16" fill="#f8fafc" />
      </svg>
      <div className="brand-texts">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}
