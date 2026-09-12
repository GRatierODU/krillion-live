export function Boat() {
  return (
    <svg className="boat-svg" viewBox="0 0 72 32" aria-hidden>
      <rect x="40" y="2" width="3" height="14" fill="#111318" />
      <rect x="43" y="2" width="7" height="3" fill="#ff3b6e" />
      <rect x="28" y="12" width="10" height="6" fill="#111318" />
      <rect x="14" y="18" width="44" height="5" fill="#111318" />
      <rect x="10" y="22" width="52" height="5" fill="#111318" />
      <rect x="8" y="25" width="56" height="3" fill="#0b0d12" />
    </svg>
  );
}

export function Krill() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <rect x="9" y="3" width="2" height="2" fill="#ff4d6d" />
      <rect x="6" y="5" width="7" height="3" fill="#ff3b7a" />
      <rect x="3" y="7" width="8" height="3" fill="#ff4d6d" />
      <rect x="1" y="9" width="4" height="2" fill="#ff6b9d" />
      <rect x="11" y="8" width="2" height="2" fill="#ff8eb3" />
    </svg>
  );
}

export function FishIcon({ glow = false }: { glow?: boolean }) {
  return (
    <svg width="28" height="16" viewBox="0 0 28 16" aria-hidden>
      <rect x="4" y="6" width="16" height="5" fill={glow ? "#7ee8ff" : "#111"} />
      <rect x="8" y="3" width="10" height="11" fill={glow ? "#7ee8ff" : "#111"} />
      <rect x="20" y="4" width="6" height="9" fill={glow ? "#5ec8ff" : "#111"} />
      <rect x="2" y="7" width="3" height="3" fill={glow ? "#bff6ff" : "#111"} />
    </svg>
  );
}

export function BubbleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
      <circle cx="11" cy="11" r="7" fill="none" stroke="#d7f4ff" strokeWidth="2" />
      <circle cx="8" cy="8" r="1.5" fill="#d7f4ff" />
    </svg>
  );
}

export function MenuIcon() {
  return (
    <svg className="bars" viewBox="0 0 18 14" aria-hidden>
      <rect width="18" height="3" fill="currentColor" />
      <rect y="5.5" width="18" height="3" fill="currentColor" />
      <rect y="11" width="18" height="3" fill="currentColor" />
    </svg>
  );
}

export function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg className="speaker" viewBox="0 0 18 14" aria-hidden>
      <rect x="0" y="4" width="5" height="6" fill="currentColor" />
      <rect x="5" y="2" width="4" height="10" fill="currentColor" />
      {!muted && (
        <>
          <rect x="11" y="3" width="2" height="8" fill="currentColor" />
          <rect x="15" y="1" width="2" height="12" fill="currentColor" />
        </>
      )}
    </svg>
  );
}
