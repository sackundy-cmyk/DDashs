// ============================================================
//  DDashLogo.jsx — D-DASH brand icon and wordmark components
// ============================================================

// The D-DASH icon: stylised D letterform with a rising bar chart
// and coloured trend dots inside the hollow of the D.
// Used in the sidebar, login page, and lesson header.

export function DDashIcon({ size = 48, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* D shape — compound path with hollow interior, evenodd fill */}
      <path
        d="M6 4 L6 52 L26 52 C42 52 52 42 52 28 C52 14 42 4 26 4 Z
           M12 11 L12 45 L24 45 C36 45 45 38 45 28 C45 18 36 11 24 11 Z"
        fill="white"
        fillRule="evenodd"
      />

      {/* Speed-motion dots left of D */}
      <circle cx="2" cy="20" r="1.8" fill="white" opacity="0.45" />
      <circle cx="2" cy="28" r="2.2" fill="white" opacity="0.65" />
      <circle cx="2" cy="36" r="1.8" fill="white" opacity="0.45" />

      {/* Bar chart — 3 bars inside the D hollow */}
      <rect x="15" y="34" width="4.5" height="8" rx="1.5" fill="white" opacity="0.9" />
      <rect x="21" y="28" width="4.5" height="14" rx="1.5" fill="white" opacity="0.9" />
      <rect x="27" y="21" width="4.5" height="21" rx="1.5" fill="white" opacity="0.9" />

      {/* Trend line connecting bar tops */}
      <polyline
        points="17.25,34 23.25,28 29.25,21"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.7"
      />

      {/* Coloured trend dots */}
      <circle cx="17.25" cy="34" r="3" fill="#CE82FF" />
      <circle cx="23.25" cy="28" r="3" fill="#FFC800" />
      <circle cx="29.25" cy="21" r="3" fill="#58CC02" />
    </svg>
  );
}

// Standalone icon on a gradient background badge — used where a
// rounded-square logo badge is needed without an external container.
export function DDashBadge({ size = 48 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="badge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1565C0" />
          <stop offset="100%" stopColor="#00B4D8" />
        </linearGradient>
      </defs>
      <rect width="56" height="56" rx="14" fill="url(#badge-grad)" />
      {/* D shape */}
      <path
        d="M8 6 L8 50 L26 50 C40 50 49 40 49 28 C49 16 40 6 26 6 Z
           M13 12 L13 44 L24 44 C34 44 43 37 43 28 C43 19 34 12 24 12 Z"
        fill="white"
        fillRule="evenodd"
      />
      <rect x="16" y="33" width="4" height="8" rx="1.5" fill="white" opacity="0.9" />
      <rect x="21.5" y="27" width="4" height="14" rx="1.5" fill="white" opacity="0.9" />
      <rect x="27" y="21" width="4" height="20" rx="1.5" fill="white" opacity="0.9" />
      <polyline
        points="18,33 23.5,27 29,21"
        stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.7"
      />
      <circle cx="18" cy="33" r="2.5" fill="#CE82FF" />
      <circle cx="23.5" cy="27" r="2.5" fill="#FFC800" />
      <circle cx="29" cy="21" r="2.5" fill="#58CC02" />
    </svg>
  );
}

// Large decorative version for the login/splash panel — shows the
// full brand mark with gradient, bigger bars, and more detail.
export function DDashSplashMark({ size = 120 }) {
  const r = size / 120;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="splash-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1A7FEB" />
          <stop offset="100%" stopColor="#00C6E0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* D outer */}
      <path
        d="M14 10 L14 110 L58 110 C88 110 108 90 108 60 C108 30 88 10 58 10 Z
           M26 24 L24 24 L24 96 L56 96 C80 96 94 81 94 60 C94 39 80 24 56 24 Z"
        fill="url(#splash-grad)"
        fillRule="evenodd"
      />

      {/* Speed dots */}
      <circle cx="6" cy="42" r="3.5" fill="#1A7FEB" opacity="0.5" />
      <circle cx="6" cy="60" r="4.5" fill="#1A7FEB" opacity="0.7" />
      <circle cx="6" cy="78" r="3.5" fill="#1A7FEB" opacity="0.5" />

      {/* Bars inside D */}
      <rect x="32" y="72" width="10" height="20" rx="3" fill="white" opacity="0.85" />
      <rect x="47" y="58" width="10" height="34" rx="3" fill="white" opacity="0.85" />
      <rect x="62" y="44" width="10" height="48" rx="3" fill="white" opacity="0.85" />

      {/* Trend line */}
      <polyline
        points="37,72 52,58 67,44"
        stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        fill="none" opacity="0.6" filter="url(#glow)"
      />

      {/* Coloured trend dots */}
      <circle cx="37" cy="72" r="6" fill="#CE82FF" filter="url(#glow)" />
      <circle cx="52" cy="58" r="6" fill="#FFC800" filter="url(#glow)" />
      <circle cx="67" cy="44" r="6" fill="#58CC02" filter="url(#glow)" />
    </svg>
  );
}
