import React from 'react';

// Official bKash Origami Bird Logo
export const BKashLogo = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* bKash Origami Bird Shape */}
    <path d="M5 2L42 12L38 48L5 2Z" fill="#D81B60" />
    <path d="M42 12L47 6L90 32L38 48L42 12Z" fill="#E91E63" />
    <path d="M90 32L99 41L87 42L90 32Z" fill="#D81B60" />
    <path d="M38 48L80 57L39 77L38 48Z" fill="#C2185B" />
    <path d="M80 57L87 42L81 55L80 57Z" fill="#E91E63" />
    <path d="M38 48L39 77L21 98L38 48Z" fill="#AD1457" />
    <path d="M5 2L18 27L5 15L5 2Z" fill="#AD1457" />
  </svg>
);

// Official Nagad Swirl Ribbon Logo
export const NagadLogo = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Nagad Spiral Ribbon Shape */}
    <path d="M50 12C62 12 74 22 74 36C74 39 72 43 70 46L92 32C86 16 70 5 50 5C32 5 17 15 10 30L29 42C33 24 40 12 50 12Z" fill="#F4511E" />
    <path d="M92 32L70 46C76 56 74 69 64 77C54 85 40 85 30 77C20 69 18 56 24 45L7 33C-2 50 1 73 17 88C34 103 60 104 78 90C95 76 99 51 92 32Z" fill="#FF6D00" />
    <path d="M30 20C40 20 49 26 53 35L75 22C66 7 50 0 32 0C25 0 18 2 12 6L26 21C27 20 29 20 30 20Z" fill="#FF8F00" />
    <path d="M75 22L53 35C58 43 55 52 48 58C41 64 30 63 24 57L8 72C21 85 42 86 58 74C73 62 78 41 75 22Z" fill="#E64A19" />
  </svg>
);

// Visa Logo
export const VisaLogo = ({ className = "w-7 h-4" }) => (
  <svg viewBox="0 0 48 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M18.5 1.5L13.8 14.5H10.6L7.1 4.5C6.9 3.7 6.7 3.4 6 3C4.9 2.4 2.8 1.9 1 1.5L1.1 1L6.7 1C7.8 1 8.8 1.8 9.1 2.9L10.8 11.2L15.3 1.5H18.5ZM34.8 10.4C34.8 6.4 29.3 6.2 29.3 4.4C29.3 3.8 29.9 3.1 31.1 3C31.7 2.9 33.3 2.9 35 3.7L35.7 1.2C34.7 0.8 33.4 0.4 31.7 0.4C26.7 0.4 23.2 3.1 23.2 6.9C23.2 9.7 25.7 11.3 27.6 12.2C29.6 13.2 30.3 13.8 30.3 14.7C30.3 16 28.7 16.6 27.2 16.6C25.3 16.6 24.1 16.1 22.8 15.5L22.1 18.2C23.5 18.8 25.2 19.3 27 19.3C32.3 19.3 35.8 16.7 35.8 12.8L34.8 10.4ZM45.2 14.5H48L45.5 1.5H43C42.1 1.5 41.3 2 41 2.8L35 14.5H38.3L38.9 12.8H43.1L45.2 14.5ZM39.9 10.2L41.7 4.9L42.7 10.2H39.9ZM23.8 1.5L21.2 14.5H18.2L20.8 1.5H23.8Z" fill="#1A1F71"/>
    <path d="M6 3C4.9 2.4 2.8 1.9 1 1.5L1.1 1L6.7 1C7.8 1 8.8 1.8 9.1 2.9L10.8 11.2L7.1 4.5C6.9 3.7 6.7 3.4 6 3Z" fill="#F7B600"/>
  </svg>
);

// Mastercard Overlapping Circles Logo
export const MastercardLogo = ({ className = "w-7 h-4" }) => (
  <svg viewBox="0 0 36 22" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="11" cy="11" r="11" fill="#EB001B" />
    <circle cx="25" cy="11" r="11" fill="#F79E1B" />
    <path d="M18 3.5C20.3 5.4 21.7 8.1 21.7 11C21.7 13.9 20.3 16.6 18 18.5C15.7 16.6 14.3 13.9 14.3 11C14.3 8.1 15.7 5.4 18 3.5Z" fill="#FF5F00" />
  </svg>
);
