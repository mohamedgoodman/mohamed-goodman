import { Instagram, MapPin, MessageCircle } from 'lucide-react';

const INSTAGRAM_URL = 'https://www.instagram.com/mohameed.dardari?igsh=MTE2ZDV0bTNuMjlpNA==';
const WHATSAPP_URL = 'https://wa.me/212641141355';

const stats = [
  { label: 'Posts', value: '28' },
  { label: 'Followers', value: '905' },
  { label: 'Following', value: '2,222' },
];

export default function App() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white antialiased">
      {/* blueprint grid background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        <div className="glow-blob absolute top-[-10%] left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-red-600/20 blur-[130px]" />
      </div>

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 py-14 sm:py-20">
        <div className="w-full max-w-sm">
          {/* card */}
          <div className="fade-in-up rounded-2xl border border-white/15 bg-white/[0.02] p-8 shadow-[0_0_80px_-20px_rgba(255,255,255,0.08)] backdrop-blur-xl sm:p-10">
            {/* avatar */}
            <div className="mx-auto mb-6 h-28 w-28 rounded-full p-[2px]" style={{ background: 'linear-gradient(135deg, #ffffff, #666666, #ff2d2d)' }}>
              <div className="h-full w-full overflow-hidden rounded-full border-4 border-black bg-black">
                <img
                  src="/assets/avatar-source.jpg"
                  alt="Mohamed Dardari"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* name + tagline */}
            <div className="text-center">
              <h1 className="text-2xl font-bold uppercase tracking-wide">
                Mohamed Dardari
              </h1>
              <p className="mt-1 text-sm text-white/40">@mohameed.dardari</p>

              <p className="mt-5 text-[13px] leading-relaxed text-white/60">
                Building my path, one step at a time.
                <br />
                Welcome to my corner of the internet.
              </p>

              <p className="mt-4 text-sm font-medium tracking-wide text-white/90">
                “1% Chance <span className="text-red-500">·</span> 99% Faith”
              </p>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs uppercase tracking-widest text-white/35">
                <MapPin className="h-3.5 w-3.5" />
                <span>Morocco</span>
              </div>
            </div>

            {/* stats */}
            <div className="mt-8 grid grid-cols-3 divide-x divide-white/10 border-y border-white/10 py-4">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-base font-bold">{s.value}</div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-widest text-white/35">
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
              className="mt-7 flex items-center justify-center gap-2.5 rounded-xl bg-white px-6 py-4 text-sm font-bold uppercase tracking-wide text-black transition-transform duration-200 active:scale-[0.98] sm:hover:scale-[1.02]"
            >
              <Instagram className="h-5 w-5" strokeWidth={2.2} />
              Follow on Instagram
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-transparent px-6 py-4 text-sm font-semibold uppercase tracking-wide text-white/85 transition-colors duration-200 active:scale-[0.98] sm:hover:border-red-500/60 sm:hover:text-white"
            >
              <MessageCircle className="h-5 w-5" strokeWidth={2.2} />
              Message on WhatsApp
            </a>
          </div>

          <p className="mt-8 text-center text-[11px] uppercase tracking-[0.2em] text-white/25">
            mohameed.dardari
          </p>
        </div>
      </main>
    </div>
  );
}
