'use client';

import { useEffect, useMemo, useState } from 'react';

type Letter = 'H' | 'O' | 'M' | 'E';
const LETTERS: Letter[] = ['H', 'O', 'M', 'E'];

export default function Home() {
  // --- Newsletter (public) ---
  const [signedUp, setSignedUp] = useState(false);
  const [nudge, setNudge] = useState(false);

  function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSignedUp(true);
    setNudge(true); // gentle FOMO nudge
  }

  // --- Puzzle state ---
  const [found, setFound] = useState<Letter[]>([]);
  const [showGate, setShowGate] = useState(false);
  const [answer, setAnswer] = useState('');
  const [solverOpen, setSolverOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Debug view for you while testing: append ?debug=1 to the URL.
  const debug = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('debug') === '1';
  }, []);

  // Load/save progress locally so refresh doesn’t wipe it
  useEffect(() => {
    try {
      const raw = localStorage.getItem('fs_found_letters');
      if (raw) {
        const arr = JSON.parse(raw) as Letter[];
        const valid = arr.filter((x) => LETTERS.includes(x));
        if (valid.length) setFound(valid);
      }
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem('fs_found_letters', JSON.stringify(found));
  }, [found]);

  function mark(letter: Letter) {
    if (!LETTERS.includes(letter)) return;
    if (found.includes(letter)) return;
    const next = [...found, letter];
    setFound(next);
    setToast(`Found ${letter} (${next.length}/4)`);
    setTimeout(() => setToast(null), 1500);
    if (next.length === 4) {
      setTimeout(() => setShowGate(true), 400);
    }
  }

  function submitRiddle(e: React.FormEvent) {
    e.preventDefault();
    if (answer.trim().toUpperCase() === 'HOME') {
      setShowGate(false);
      setSolverOpen(true);
    } else {
      setToast('Not quite. Look closer.');
      setTimeout(() => setToast(null), 1400);
    }
  }

  // Fake claim (for now) – we’ll wire the real API next step
  const [claimMsg, setClaimMsg] = useState<string | null>(null);
  function handleClaim(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') || '').trim();
    if (!email) return;
    setClaimMsg(
      `Nice. Your unique code will be emailed once we connect Stripe (you entered: ${email}).`
    );
  }

  // Slightly eerie, but privacy-safe
  const timeCopy = useMemo(() => {
    const d = new Date();
    return `We noticed you at ${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes()
    ).padStart(2, '0')}.`;
  }, []);

  return (
    <main className="min-h-screen bg-black text-zinc-100 selection:bg-zinc-700/60">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-black/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="font-semibold tracking-widest">FINDSOLIN</div>
          <nav className="hidden gap-6 text-sm md:flex">
            <a href="#about" className="opacity-80 hover:opacity-100">About</a>
            <a href="#how" className="opacity-80 hover:opacity-100">How it works</a>
            <a href="#signup" className="opacity-80 hover:opacity-100">Join</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_10%,rgba(255,255,255,0.08),transparent)]" />
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl">
              T
              <span
                onClick={() => mark('H')}
                onKeyDown={(e) => e.key === 'Enter' && mark('H')}
                tabIndex={0}
                aria-label="Something feels off"
                className="inline-block select-none outline-none"
                style={{ fontWeight: 500, letterSpacing: debug ? '0.2em' : undefined, borderBottom: debug ? '1px dotted rgba(255,255,255,0.35)' : undefined }}
                title={debug ? 'H hotspot' : undefined}
              >
                h
              </span>
              e adventure begins here.
            </h1>
            <p className="mt-4 max-w-prose text-zinc-300">
              A gritty, real-world puzzle experience. Watch closely. Most people only see the surface.
            </p>
            <div className="mt-2 text-xs text-zinc-500">{timeCopy}</div>
            <div className="mt-8 flex gap-3">
              <a href="#signup" className="rounded-xl bg-white px-4 py-2 text-black">
                Join the experience
              </a>
              <a href="#how" className="rounded-xl border border-white/20 px-4 py-2">
                How it works
              </a>
            </div>
          </div>

          {/* Visual placeholder */}
          <div className="relative h-64 w-full rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-800 md:h-auto">
            <div className="absolute inset-0 grid place-items-center text-zinc-500">
              <span className="text-sm opacity-80">[ Visual / teaser video here ]</span>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold">What is FindSolin?</h2>
          <p className="mt-4 max-w-prose text-zinc-300">
            An immersive, time-boxed mystery that blends physical clues, digital trails, and collective problem-solving.
            Built to be discovered—not announced.
          </p>

          {/* O hotspot: a blinking “eye” dot inside this card title */}
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <li className="rounded-xl border border-white/10 p-4">
              <div className="font-medium flex items-center gap-2">
                Team Play
                <button
                  aria-label="A watchful eye"
                  title={debug ? 'O hotspot' : undefined}
                  onClick={() => mark('O')}
                  onKeyDown={(e) => e.key === 'Enter' && mark('O')}
                  tabIndex={0}
                  className={`h-2 w-2 rounded-full ${debug ? 'ring-1 ring-white/40' : ''}`}
                  style={{
                    background: 'rgba(255,255,255,0.7)',
                    animation: 'pulse 2.3s infinite',
                  }}
                />
              </div>
              <div className="mt-1 text-sm text-zinc-400">
                Work together or go alone. Everyone sees something different.
              </div>
            </li>

            <li className="rounded-xl border border-white/10 p-4">
              <div className="font-medium">Exploration</div>
              <div className="mt-1 text-sm text-zinc-400">
                City streets, hidden URLs, and strange transmissions.
              </div>
            </li>

            <li className="rounded-xl border border-white/10 p-4">
              <div className="font-medium">Story First</div>
              <div className="mt-1 text-sm text-zinc-400">
                Every clue matters. No red herrings for the sake of it.
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ['Receive your first clue', 'Start with a message most people ignore.'],
              ['Work with your team', 'You’ll need different eyes to see it all.'],
              ['Unravel the mystery', 'Every end loops back to where it began.'],
            ].map(([title, body], i) => (
              <li key={title} className="rounded-xl border border-white/10 p-4">
                <div className="text-sm text-zinc-400">
                  Step {i + 1}
                </div>
                <div className="mt-1 font-medium">
                  {i === 1 ? (
                    <span
                      onClick={() => mark('M')}
                      onKeyDown={(e) => e.key === 'Enter' && mark('M')}
                      tabIndex={0}
                      aria-label="A letter sits strangely"
                      title={debug ? 'M hotspot' : undefined}
                      className="inline-block rotate-[2deg]"
                      style={{ borderBottom: debug ? '1px dotted rgba(255,255,255,0.35)' : undefined }}
                    >
                      {title}
                    </span>
                  ) : (
                    title
                  )}
                </div>
                <div className="mt-1 text-sm text-zinc-400">{body}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Join / Newsletter */}
      <section id="signup" className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold">Join the pilot</h2>
          <p className="mt-2 max-w-prose text-zinc-300">
            Get early updates. When tickets drop, you’ll be first to know.
          </p>

          <form onSubmit={handleSignup} className="mt-6 flex max-w-xl gap-3">
            <input
              required
              type="email"
              placeholder="you@example.com"
              className="flex-1 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none placeholder:text-zinc-500 focus:border-white/30"
              aria-label="Email address"
            />
            <button className="rounded-xl bg-white px-5 py-3 text-black hover:opacity-90">
              Sign up
            </button>
          </form>

          {/* Success + subtle nudge */}
          <div className="relative mt-4 min-h-[1.5rem]" aria-live="polite">
            {signedUp && (
              <p className="text-sm text-emerald-400">You’re on the list.</p>
            )}
            {nudge && (
              <div className="mt-2 w-fit rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-300">
                You might have missed something. Look closer…
                <button
                  onClick={() => setNudge(false)}
                  className="ml-2 underline decoration-dotted opacity-80 hover:opacity-100"
                  aria-label="Dismiss hint"
                >
                  dismiss
                </button>
              </div>
            )}
          </div>

          <p className="mt-10 text-sm text-zinc-500">
            We respect your privacy. No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* Footer (E hotspot hidden in the line) */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-10 text-sm text-zinc-500">
          <span>© {new Date().getFullYear()} FindSolin</span>
          <button
            onClick={() => mark('E')}
            onKeyDown={(e) => e.key === 'Enter' && mark('E')}
            tabIndex={0}
            aria-label="Every end is a new beginning"
            title={debug ? 'E hotspot' : undefined}
            className={`hover:text-zinc-300 ${debug ? 'underline underline-offset-4 decoration-dotted' : ''}`}
          >
            Every end is a new beginning…
          </button>
        </div>
      </footer>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/20 bg-zinc-900/90 px-3 py-2 text-sm">
          {toast}
        </div>
      )}

      {/* Riddle Gate */}
      {showGate && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 backdrop-blur">
          <div className="w-[min(92vw,560px)] rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <div className="text-sm text-zinc-400">System unlocked</div>
            <h3 className="mt-1 text-xl font-semibold">One last question</h3>
            <p className="mt-2 text-zinc-300">
              Every journey ends where it began. Four eyes watched you get here.
              What word unlocks the door?
            </p>
            <form onSubmit={submitRiddle} className="mt-4 flex gap-2">
              <input
                autoFocus
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                maxLength={16}
                placeholder="Type your answer"
                aria-label="Puzzle answer"
                className="flex-1 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none placeholder:text-zinc-500 focus:border-white/30"
              />
              <button className="rounded-xl bg-white px-4 py-3 text-black">Unlock</button>
            </form>
            <button
              onClick={() => setShowGate(false)}
              className="mt-3 text-xs text-zinc-500 underline decoration-dotted"
            >
              not now
            </button>
          </div>
        </div>
      )}

      {/* Solver panel (reward claim – will call API next step) */}
      {solverOpen && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 backdrop-blur">
          <div className="w-[min(92vw,560px)] rounded-2xl border border-emerald-400/20 bg-zinc-950 p-6">
            <div className="text-sm text-emerald-400">You saw what others missed.</div>
            <h3 className="mt-1 text-xl font-semibold">Claim your reward</h3>
            <p className="mt-2 text-zinc-300">
              First 50 solvers get a unique one-use discount code for the first game.
              Enter your email to receive it.
            </p>

            <form onSubmit={handleClaim} className="mt-4 flex gap-2">
              <input
                required
                type="email"
                name="email"
                placeholder="you@example.com"
                aria-label="Email for reward delivery"
                className="flex-1 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none placeholder:text-zinc-500 focus:border-white/30"
              />
              <button className="rounded-xl bg-white px-4 py-3 text-black">Claim</button>
            </form>

            <div className="mt-3 min-h-[1.25rem]" aria-live="polite">
              {claimMsg && <p className="text-sm text-emerald-400">{claimMsg}</p>}
            </div>

            <button
              onClick={() => setSolverOpen(false)}
              className="mt-2 text-xs text-zinc-500 underline decoration-dotted"
            >
              close
            </button>
          </div>
        </div>
      )}

      {/* tiny CSS for the “eye” pulse */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.35; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </main>
  );
}

