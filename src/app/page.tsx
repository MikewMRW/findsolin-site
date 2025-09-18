'use client';

import { useState } from 'react';

export default function Home() {
  const [signedUp, setSignedUp] = useState(false);
  const [nudge, setNudge] = useState(false);

  function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSignedUp(true);
    setNudge(true);
    // TODO: wire to your newsletter provider later
  }

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
              The adventure begins here.
            </h1>
            <p className="mt-4 max-w-prose text-zinc-300">
              A gritty, real-world puzzle experience. Watch closely. Most people only see the surface.
            </p>
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
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[
              ['Team Play', 'Work together or go alone. Everyone sees something different.'],
              ['Exploration', 'City streets, hidden URLs, and strange transmissions.'],
              ['Story First', 'Every clue matters. No red herrings for the sake of it.'],
            ].map(([title, body]) => (
              <li key={title} className="rounded-xl border border-white/10 p-4">
                <div className="font-medium">{title}</div>
                <div className="mt-1 text-sm text-zinc-400">{body}</div>
              </li>
            ))}
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
                <div className="text-sm text-zinc-400">Step {i + 1}</div>
                <div className="mt-1 font-medium">{title}</div>
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

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-10 text-sm text-zinc-500">
          <span>© {new Date().getFullYear()} FindSolin</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-300">Contact</a>
            <a href="#" className="hover:text-zinc-300">Privacy</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
