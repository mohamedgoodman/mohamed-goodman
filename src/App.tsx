import { Instagram, MapPin, Sparkles } from 'lucide-react';

const INSTAGRAM_URL = 'https://www.instagram.com/mohameed.dardari?igsh=MTE2ZDV0bTNuMjlpNA==';

const stats = [
  { label: 'Posts', value: '28' },
  { label: 'Followers', value: '905' },
  { label: 'Following', value: '2,222' },
];

export default function App() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07070a] text-white antialiased">
      {/* ambient background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="glow-blob absolute -top-32 -left-24 h-80 w-80 rounded-full bg-indigo-600/30 blur-[100px]" />
        <div className="glow-blob-delayed absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-violet-600/25 blur-[110px]" />
        <div className="glow-blob absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-amber-500/10 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 py-14 sm:py-20">
        <div className="w-full max-w-sm">
          {/* card */}
          <div className="fade-in-up rounded-[28px] border border-white/10 bg-white/[0.04] p-8 shadow-[0_8px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-10">
            {/* avatar */}
            <div className="mx-auto mb-6 h-28 w-28 rounded-full p-[3px]" style={{ background: 'conic-gradient(from 180deg, #f0b429, #a855f7, #6366f1, #f0b429)' }}>
              <div className="h-full w-full overflow-hidden rounded-full border-4 border-[#07070a] bg-black">
                <img
                  src="/assets/avatar-source.jpg"
                  alt="Mohamed Dardari"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* name + tagline */}
            <div className="text-center">
              <h1 className="flex items-center justify-center gap-1.5 text-2xl font-semibold tracking-tight">
                Mohamed Dardari
                <Sparkles className="h-4 w-4 text-amber-400" strokeWidth={2.5} />
              </h1>
              <p className="mt-1 text-sm text-white/50">@mohameed.dardari</p>

              <p className="mt-4 font-serif text-lg italic text-white/85">
                “1% Chance · 99% Faith”
              </p>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-white/40">
                <MapPin className="h-3.5 w-3.5" />
                <span>Morocco</span>
              </div>
            </div>

            {/* stats */}
            <div className="mt-7 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-black/20 py-4">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-base font-semibold">{s.value}</div>
                  <div className="mt-0.5 text-[11px] uppercase tracking-wide text-white/40">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-7 flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 px-6 py-4 text-sm font-semibold text-black shadow-[0_10px_30px_-8px_rgba(240,180,41,0.5)] transition-transform duration-200 active:scale-[0.98] sm:hover:scale-[1.02]"
            >
              <Instagram className="h-5 w-5" strokeWidth={2.2} />
              Follow on Instagram
            </a>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2.5 rounded-2xl border border-white/15 bg-white/[0.03] px-6 py-4 text-sm font-medium text-white/80 transition-colors duration-200 active:scale-[0.98] sm:hover:border-white/30 sm:hover:bg-white/[0.06]"
            >
              View Full Profile
            </a>
          </div>

          <p className="mt-8 text-center text-xs text-white/25">
            mohameed.dardari
          </p>
        </div>
      </main>
    </div>
  );
}
