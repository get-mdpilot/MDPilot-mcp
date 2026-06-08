'use client';

const NODES = [
  {
    id: 1, name: 'README.md',       color: '#4FACFF',
    pX: 68,   pY: 272.5, pW: 80,  tX: 108,  tY: 280,
    path: 'M 148 280 H 582',
    dur: 4, begin: 0.5,
  },
  {
    id: 2, name: 'CONTEXT.md',      color: '#06B6D4',
    pX: 67.5, pY: 140.5, pW: 85,  tX: 110,  tY: 148,
    path: 'M 152 148 H 420 Q 428 148 428 156 V 274 Q 428 282 436 282 H 582',
    dur: 7, begin: 2,
  },
  {
    id: 3, name: 'AGENTS.md',       color: '#A855F7',
    pX: 182,  pY: 32.5,  pW: 76,  tX: 220,  tY: 40,
    path: 'M 220 47 V 200 Q 220 208 228 208 H 576 Q 584 208 584 216 V 262',
    dur: 6, begin: 1,
  },
  {
    id: 4, name: 'CLAUDE.md',       color: '#2DD4BF',
    pX: 562,  pY: 27.5,  pW: 76,  tX: 600,  tY: 35,
    path: 'M 600 42 V 262',
    dur: 3.5, begin: 3,
  },
  {
    id: 5, name: 'TASK.md',         color: '#818CF8',
    pX: 949,  pY: 32.5,  pW: 62,  tX: 980,  tY: 40,
    path: 'M 980 47 V 200 Q 980 208 972 208 H 624 Q 616 208 616 216 V 262',
    dur: 5.5, begin: 0,
  },
  {
    id: 6, name: 'SKILL.md',        color: '#FBBF24',
    pX: 1052, pY: 140.5, pW: 68,  tX: 1086, tY: 148,
    path: 'M 1052 148 H 780 Q 772 148 772 156 V 272 Q 772 280 764 280 H 618',
    dur: 8, begin: 4,
  },
  {
    id: 7, name: 'DESIGN.md',       color: '#FF6B6B',
    pX: 1052, pY: 412.5, pW: 74,  tX: 1089, tY: 420,
    path: 'M 1052 420 H 780 Q 772 420 772 412 V 296 Q 772 288 764 288 H 618',
    dur: 7, begin: 1.5,
  },
  {
    id: 8, name: 'CONTRIBUTING.md', color: '#34D399',
    pX: 541,  pY: 512,   pW: 118, tX: 600,  tY: 519.5,
    path: 'M 600 512 V 298',
    dur: 4, begin: 5,
  },
  {
    id: 9, name: 'SECURITY.md',     color: '#F97316',
    pX: 176,  pY: 386, pW: 88,  tX: 220,  tY: 393.5,
    path: 'M 264 393 H 440 Q 448 393 448 385 V 296 Q 448 288 456 288 H 582',
    dur: 6.5, begin: 2.5,
  },
];

const HUB_PINS = [
  { cx: 582, cy: 280, color: '#4FACFF' },
  { cx: 582, cy: 282, color: '#06B6D4' },
  { cx: 584, cy: 262, color: '#A855F7' },
  { cx: 600, cy: 262, color: '#2DD4BF' },
  { cx: 616, cy: 262, color: '#818CF8' },
  { cx: 618, cy: 280, color: '#FBBF24' },
  { cx: 618, cy: 288, color: '#FF6B6B' },
  { cx: 600, cy: 298, color: '#34D399' },
  { cx: 582, cy: 288, color: '#F97316' },
];

export default function HeroCircuitBg() {
  return (
    <svg
      viewBox="0 0 1200 560"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        {/* Path masks — clip orb glow to trace width */}
        {NODES.map(({ id, path }) => (
          <mask key={id} id={`hc-mask-${id}`}>
            <path d={path} stroke="white" fill="none" strokeWidth="2"/>
          </mask>
        ))}

        {/* Radial glow gradients for each orb */}
        {NODES.map(({ id, color }) => (
          <radialGradient key={id} id={`hc-grad-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={color} stopOpacity="1"/>
            <stop offset="28%"  stopColor={color} stopOpacity="0.8"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </radialGradient>
        ))}

        {/* Hub ambient glow */}
        <radialGradient id="hc-hub-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#4FACFF" stopOpacity="0.28"/>
          <stop offset="100%" stopColor="#4FACFF" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Circuit traces (dim PCB-style lines) */}
      <g stroke="rgba(79,172,255,0.13)" fill="none" strokeWidth="0.4">
        {NODES.map(({ id, path }) => (
          <path key={id} id={`hc-trace-${id}`} d={path}/>
        ))}
      </g>

      {/* Animated light orbs — travel from .md node → hub */}
      {NODES.map(({ id, dur, begin }) => (
        <g key={id} mask={`url(#hc-mask-${id})`}>
          <circle cx="0" cy="0" r="14" fill={`url(#hc-grad-${id})`}>
            <animateMotion
              dur={`${dur}s`}
              repeatCount="indefinite"
              begin={`${begin}s`}
              calcMode="linear"
            >
              <mpath href={`#hc-trace-${id}`}/>
            </animateMotion>
            <animate
              attributeName="opacity"
              dur={`${dur}s`}
              repeatCount="indefinite"
              begin={`${begin}s`}
              values="0;1;1;0.85;0"
              keyTimes="0;0.06;0.88;0.95;1"
              calcMode="linear"
            />
          </circle>
        </g>
      ))}

      {/* .md file node pills */}
      {NODES.map(({ id, name, color, pX, pY, pW, tX, tY }) => (
        <g key={id}>
          <rect
            x={pX} y={pY} width={pW} height="15" rx="3"
            fill="rgba(8,8,20,0.72)"
            stroke={color} strokeOpacity="0.22" strokeWidth="0.4"
          />
          <text
            x={tX} y={tY}
            textAnchor="middle" dominantBaseline="central"
            fontSize="6" fontFamily="'DM Mono', monospace"
            fill={color} fillOpacity="0.72"
          >
            {name}
          </text>
        </g>
      ))}

      {/* Hub pulse ring (animated via CSS class) */}
      <circle cx={600} cy={280} r={30} fill="url(#hc-hub-glow)" className="hc-hub-ring"/>

      {/* Hub body */}
      <circle
        cx={600} cy={280} r={20}
        fill="rgba(8,8,20,0.92)"
        stroke="rgba(79,172,255,0.38)"
        strokeWidth="0.7"
      />

      {/* Hub label */}
      <g transform="translate(600, 280)">
        <text
          y="-3" textAnchor="middle"
          fontSize="9" fontFamily="'Space Grotesk', sans-serif"
          fill="rgba(79,172,255,0.92)" fontWeight="700"
        >
          MD
        </text>
        <text
          y="8" textAnchor="middle"
          fontSize="5" fontFamily="'DM Mono', monospace"
          fill="rgba(255,255,255,0.3)"
        >
          Pilot
        </text>
      </g>

      {/* Hub connection pins */}
      {HUB_PINS.map(({ cx, cy, color }, i) => (
        <circle key={i} cx={cx} cy={cy} r="1.5" fill={color} fillOpacity="0.5"/>
      ))}
    </svg>
  );
}
