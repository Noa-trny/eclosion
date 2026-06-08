import type { ActId } from "@/types/acts";

/** Pure inline-SVG vignettes — one gradient scene per act, zero assets. */
export function ActIllustration({ act }: { act: ActId }) {
  return (
    <svg viewBox="0 0 400 220" role="img" aria-hidden className="h-auto w-full rounded-xl">
      {SCENES[act]}
    </svg>
  );
}

const SCENES: Record<ActId, React.ReactNode> = {
  void: (
    <>
      <rect width="400" height="220" fill="#04060c" />
      {[...Array(40)].map((_, i) => (
        <circle key={i} cx={(i * 97) % 400} cy={(i * 53) % 220} r={(i % 3) * 0.5 + 0.4} fill="#9fb4ff" opacity={0.25 + (i % 5) * 0.12} />
      ))}
    </>
  ),
  seed: (
    <>
      <rect width="400" height="220" fill="#0a0705" />
      <ellipse cx="200" cy="200" rx="180" ry="30" fill="#140e08" />
      <ellipse cx="200" cy="140" rx="26" ry="36" fill="#2b1a0c" />
      <ellipse cx="200" cy="140" rx="10" ry="18" fill="#ffb85c" opacity="0.9" />
      <ellipse cx="200" cy="140" rx="60" ry="70" fill="url(#seedGlow)" />
      <defs>
        <radialGradient id="seedGlow">
          <stop offset="0%" stopColor="#ffb85c" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffb85c" stopOpacity="0" />
        </radialGradient>
      </defs>
    </>
  ),
  forest: (
    <>
      <rect width="400" height="220" fill="#04121a" />
      <circle cx="330" cy="45" r="22" fill="#dfe8ff" opacity="0.9" />
      {[...Array(9)].map((_, i) => (
        <polygon key={i} points={`${20 + i * 44},210 ${38 + i * 44},${90 + (i % 3) * 22} ${56 + i * 44},210`} fill="#0a2a1c" />
      ))}
      {[...Array(14)].map((_, i) => (
        <circle key={`f${i}`} cx={(i * 71 + 30) % 400} cy={140 + ((i * 37) % 60)} r="1.6" fill="#ffe08a" opacity="0.85" />
      ))}
    </>
  ),
  storm: (
    <>
      <rect width="400" height="220" fill="#11141b" />
      <ellipse cx="120" cy="40" rx="110" ry="26" fill="#1d222c" />
      <ellipse cx="280" cy="55" rx="130" ry="30" fill="#232936" />
      <polyline points="210,70 190,110 215,112 185,165" stroke="#cfe0ff" strokeWidth="3" fill="none" opacity="0.9" />
      {[...Array(24)].map((_, i) => (
        <line key={i} x1={(i * 37) % 400} y1={80 + ((i * 29) % 90)} x2={((i * 37) % 400) - 5} y2={97 + ((i * 29) % 90)} stroke="#6f85a8" strokeWidth="1.2" opacity="0.6" />
      ))}
    </>
  ),
  ocean: (
    <>
      <rect width="400" height="220" fill="#02202f" />
      <rect width="400" height="60" fill="#053146" />
      <path d="M0,60 Q50,50 100,60 T200,60 T300,60 T400,60 V0 H0 Z" fill="#07405c" opacity="0.7" />
      {[...Array(30)].map((_, i) => (
        <circle key={i} cx={(i * 67 + 15) % 400} cy={90 + ((i * 41) % 115)} r={1 + (i % 3) * 0.6} fill="#25e0e8" opacity="0.7" />
      ))}
      {[...Array(6)].map((_, i) => (
        <ellipse key={`p${i}`} cx={80 + i * 50} cy={130 + (i % 3) * 20} rx="9" ry="3.5" fill="#3b7a94" />
      ))}
    </>
  ),
  volcano: (
    <>
      <rect width="400" height="220" fill="#160a08" />
      <polygon points="60,220 200,50 340,220" fill="#241412" />
      <polygon points="185,60 200,50 215,60 207,80 193,80" fill="#ff5a10" />
      <path d="M200,60 C 210,110 190,150 205,220" stroke="#ff7b1f" strokeWidth="7" fill="none" opacity="0.9" />
      {[...Array(16)].map((_, i) => (
        <circle key={i} cx={170 + ((i * 23) % 70)} cy={40 - ((i * 13) % 32)} r={1.4} fill="#ffab52" opacity="0.8" />
      ))}
    </>
  ),
  bloom: (
    <>
      <rect width="400" height="220" fill="#171226" />
      <ellipse cx="200" cy="230" rx="230" ry="60" fill="#1e2b1c" />
      {[...Array(12)].map((_, i) => (
        <g key={i} transform={`translate(${30 + i * 31}, ${170 + (i % 4) * 9})`}>
          <line x1="0" y1="0" x2="0" y2="16" stroke="#2f5c34" strokeWidth="1.6" />
          <circle cx="0" cy="-3" r="5" fill={i % 2 ? "#e86fa4" : "#8f7ff0"} />
          <circle cx="0" cy="-3" r="1.8" fill="#ffc24d" />
        </g>
      ))}
      {[...Array(7)].map((_, i) => (
        <path key={`b${i}`} d={`M${50 + i * 48},${50 + (i % 3) * 16} q6,-7 12,0 q6,-7 12,0`} stroke="#3a3348" strokeWidth="2" fill="none" />
      ))}
    </>
  ),
  dawn: (
    <>
      <defs>
        <linearGradient id="dawnSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2e4d80" />
          <stop offset="70%" stopColor="#f2984f" />
          <stop offset="100%" stopColor="#ffd9a0" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#dawnSky)" />
      <circle cx="200" cy="165" r="34" fill="#fff3d6" />
      <rect y="185" width="400" height="35" fill="#233326" />
    </>
  ),
};
