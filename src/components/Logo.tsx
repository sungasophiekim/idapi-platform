// src/components/Logo.tsx — iDAPI institution mark (issue-paper design)
export default function Logo({ size = 34, onDark = false }: { size?: number; onDark?: boolean }) {
  const box = onDark ? '#FFFFFF' : '#1F3A2E';
  const bar = onDark ? '#1F3A2E' : '#FFFFFF';
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label="IDAPI" style={{ display: 'block', flexShrink: 0 }}>
      <rect width="40" height="40" rx="5" fill={box} />
      <rect x="8" y="10.5" width="24" height="2.8" fill={bar} />
      <rect x="8" y="27.5" width="24" height="2.8" fill={bar} />
      <rect x="11.4" y="15" width="3.4" height="10" fill={bar} opacity="0.62" />
      <rect x="18.3" y="15" width="3.4" height="10" fill={bar} />
      <rect x="25.2" y="15" width="3.4" height="10" fill={bar} opacity="0.62" />
    </svg>
  );
}
