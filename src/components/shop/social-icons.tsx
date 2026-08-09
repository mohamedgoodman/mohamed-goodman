/**
 * Social glyphs. Lucide dropped its brand icons, so these are drawn inline
 * alongside the WhatsApp mark in `whatsapp-button.tsx`.
 */

export function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TiktokGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M16.5 3h-2.6v12.1a2.5 2.5 0 1 1-2.1-2.47V10a5.4 5.4 0 1 0 4.7 5.35V9.1a6.3 6.3 0 0 0 3.5 1.07V7.55A3.7 3.7 0 0 1 16.5 3z" />
    </svg>
  );
}
