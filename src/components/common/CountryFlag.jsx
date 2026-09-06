import React from 'react';

export const IndiaFlag = ({ className = "w-6 h-4", rounded = "rounded-xs" }) => (
  <svg 
    viewBox="0 0 640 480" 
    className={`inline-block overflow-hidden shadow-xs border border-black/10 flex-shrink-0 align-middle ${rounded} ${className}`} 
    aria-label="India Flag"
  >
    <path fill="#FF9933" d="M0 0h640v160H0z" />
    <path fill="#FFFFFF" d="M0 160h640v160H0z" />
    <path fill="#128807" d="M0 320h640v160H0z" />
    <g transform="translate(320,240)">
      <circle r="68" fill="none" stroke="#000080" strokeWidth="12" />
      <circle r="15" fill="#000080" />
      {[...Array(24)].map((_, i) => (
        <line
          key={i}
          x1="0"
          y1="0"
          x2="0"
          y2="-68"
          stroke="#000080"
          strokeWidth="4"
          transform={`rotate(${i * 15})`}
        />
      ))}
    </g>
  </svg>
);

export const UAEFlag = ({ className = "w-6 h-4", rounded = "rounded-xs" }) => (
  <svg 
    viewBox="0 0 640 480" 
    className={`inline-block overflow-hidden shadow-xs border border-black/10 flex-shrink-0 align-middle ${rounded} ${className}`} 
    aria-label="United Arab Emirates Flag"
  >
    <path fill="#00732F" d="M0 0h640v160H0z" />
    <path fill="#FFFFFF" d="M0 160h640v160H0z" />
    <path fill="#000000" d="M0 320h640v160H0z" />
    <path fill="#FF0000" d="M0 0h160v480H0z" />
  </svg>
);

export const ThailandFlag = ({ className = "w-6 h-4", rounded = "rounded-xs" }) => (
  <svg 
    viewBox="0 0 640 480" 
    className={`inline-block overflow-hidden shadow-xs border border-black/10 flex-shrink-0 align-middle ${rounded} ${className}`} 
    aria-label="Thailand Flag"
  >
    <path fill="#A51931" d="M0 0h640v80H0zm0 400h640v80H0z" />
    <path fill="#F4F5F8" d="M0 80h640v80H0zm0 240h640v80H0z" />
    <path fill="#2D2A4A" d="M0 160h640v160H0z" />
  </svg>
);

export const BangladeshFlag = ({ className = "w-6 h-4", rounded = "rounded-xs" }) => (
  <svg 
    viewBox="0 0 640 480" 
    className={`inline-block overflow-hidden shadow-xs border border-black/10 flex-shrink-0 align-middle ${rounded} ${className}`} 
    aria-label="Bangladesh Flag"
  >
    <path fill="#006A4E" d="M0 0h640v480H0z" />
    <circle cx="280" cy="240" r="160" fill="#F42A41" />
  </svg>
);

export const CountryFlag = ({ country = '', className = "w-5 h-3.5", rounded = "rounded-xs" }) => {
  const normalized = String(country).toLowerCase().trim();

  if (normalized.includes('ind') || normalized === 'in' || normalized.includes('inr') || country.includes('🇮🇳')) {
    return <IndiaFlag className={className} rounded={rounded} />;
  }
  if (normalized.includes('dubai') || normalized.includes('uae') || normalized.includes('emirates') || normalized === 'ae' || normalized.includes('aed') || country.includes('🇦🇪')) {
    return <UAEFlag className={className} rounded={rounded} />;
  }
  if (normalized.includes('thai') || normalized === 'th' || normalized.includes('thb') || country.includes('🇹🇭')) {
    return <ThailandFlag className={className} rounded={rounded} />;
  }
  if (normalized.includes('bangladesh') || normalized.includes('bd') || normalized.includes('bdt') || normalized.includes('dhaka') || country.includes('🇧🇩')) {
    return <BangladeshFlag className={className} rounded={rounded} />;
  }

  // Fallback if not matched
  return <span className="text-sm">🌐</span>;
};

export default CountryFlag;
