// src/app/page.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';




/* --------------------- tiny UI helpers --------------------- */
function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[100] rounded-lg bg-white/95 px-4 py-2 text-sm text-black shadow-lg">
      {message}
    </div>
  );
}

function Modal({
  open,
  children,
  onClose,
  title,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 text-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md px-2 py-1 text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ------------------------- constants ------------------------ */
type FoundSet = Set<string>;
const STORAGE_FOUND = 'fs_found_letters';
const STORAGE_SOLVED = 'fs_riddle_solved';
const STORAGE_CLAIMED = 'fs_claimed_email';
const STORAGE_SIGNUP = 'fs_newsletter_signup';
const TARGET = ['H', 'O', 'M', 'E'];

/* ============================================================
   OUTER WRAPPER (Suspense needed for useSearchParams in Next 15)
   ============================================================ */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <Landing />
    </Suspense>
  );
}

/* ============================================================
   INNER COMPONENT: actual page content (uses useSearchParams)
   ============================================================ */
function Landing() {
  const search = useSearchParams();
  const debug = useMemo(() => search.get('debug') === '1', [search]);
  const [claimedEmail, setClaimedEmail] = useState<string | null>(null);


  // puzzle state
  const [found, setFound] = useState<FoundSet>(new Set<string>());
  const [toast, setToast] = useState<string | null>(null);
  const [riddleOpen, setRiddleOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  const [solved, setSolved] = useState(false);

  // claim state
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimEmail, setClaimEmail] = useState('');
  const [claimStatus, setClaimStatus] = useState<null | 'ok' | 'dup' | 'limit' | 'error'>(null);
  const claimBusyRef = useRef(false);

  // newsletter (local confirm only for now)
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);

  useEffect(() => {
  try {
    const raw = localStorage.getItem(STORAGE_FOUND);
    const solvedLocal = localStorage.getItem(STORAGE_SOLVED) === '1';
    const signed = localStorage.getItem(STORAGE_SIGNUP) === '1';
    const claimed = localStorage.getItem(STORAGE_CLAIMED);

    if (raw) setFound(new Set<string>(JSON.parse(raw)));
    setSolved(solvedLocal);
    setNewsletterDone(signed);
    if (claimed) setClaimedEmail(claimed);

    // Only open the riddle automatically when ALL letters are found
    // (Do NOT auto-open the claim modal anymore)
    const s = new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
    if (TARGET.every((t) => s.has(t)) && !solvedLocal) setRiddleOpen(true);
  } catch {}
}, []);


  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const persistFound = (next: FoundSet) => {
    try {
      localStorage.setItem(STORAGE_FOUND, JSON.stringify(Array.from(next)));
    } catch {}
  };

  const markFound = (letter: string) => {
    if (found.has(letter)) {
      showToast(`Already found ${letter} (${found.size}/${TARGET.length})`);
      return;
    }
    const next = new Set(found);
    next.add(letter);
    setFound(next);
    persistFound(next);
    const count = next.size;
    showToast(`Found ${letter} (${count}/${TARGET.length})`);
    if (count >= TARGET.length) setTimeout(() => setRiddleOpen(true), 500);
  };

  const onAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim().toUpperCase() === 'HOME') {
      setSolved(true);
      try {
        localStorage.setItem(STORAGE_SOLVED, '1');
      } catch {}
      setRiddleOpen(false);
      setTimeout(() => setClaimOpen(true), 200);
    } else {
      showToast('Not quite — try again.');
    }
  };

  const onClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (claimBusyRef.current) return;
    claimBusyRef.current = true;
    setClaimStatus(null);
    try {
      const res = await fetch('/api/puzzle/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: claimEmail,
          proof: 'HOME',
          letters: Array.from(found),
        }),
      });
      if (res.ok) {
        setClaimStatus('ok');
        try {setClaimedEmail(claimEmail);
setClaimOpen(false);

          localStorage.setItem(STORAGE_CLAIMED, claimEmail);
        } catch {}
      } else if (res.status === 409) setClaimStatus('dup');
      else if (res.status === 429) setClaimStatus('limit');
      else setClaimStatus('ok'); // soft success if backend not wired yet
    } catch {
      setClaimStatus('ok');
    } finally {
      claimBusyRef.current = false;
    }
  };

  const onNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterDone(true);
    try {
      localStorage.setItem(STORAGE_SIGNUP, '1');
    } catch {}
    showToast("You're signed up! Psst… you might have missed something.");
  };

  const lettersLeft = TARGET.filter((t) => !found.has(t));
  const allFound = TARGET.every((t) => found.has(t));

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Global style for subtle blink (so you don't have to edit globals.css) */}
      <style jsx global>{`
        @keyframes fs-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: .55; }
        }
        .fs-blink {
          animation: fs-blink 1.2s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
           {/* make sure public/findsolin_logo.png exists */}
<Image
  src="/findsolin_logo.png"
  alt="FindSolin"
  width={160}
  height={40}
  priority
/>

            <span className="sr-only">FindSolin</span>
          </Link>

          <nav className="ml-auto flex items-center gap-6 text-sm">
            <Link href="#about" className="hover:text-zinc-300">About</Link>
            <Link href="#how" className="hover:text-zinc-300">How it works</Link>
            <Link href="#join" className="hover:text-zinc-300">Join</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-5xl font-semibold leading-tight md:text-7xl">
          T
          <button
  aria-label="(Hidden) letter H"
  onClick={() => markFound('H')}
  className={`inline-block align-baseline transition ${
    debug ? 'outline outline-1 outline-fuchsia-500' : ''
  }`}
  title={debug ? 'Hidden H' : undefined}
>
  <span
    className={`inline-block align-baseline ${
      !found.has('H') && !debug ? 'fs-blink' : ''
    }`}
    style={{ transform: 'rotate(-3deg) translateY(3px)', lineHeight: 0 }}
    aria-hidden="true"
  >
    <Image
      src="/letter-h.webp"
      alt=""                 // decorative
      width={42}
      height={50}
      priority
      className="h-[50px] w-auto select-none pointer-events-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)]"
    />
  </span>
  <span className="sr-only">h</span>
</button>



          e adventure <span className="opacity-90">begins here.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-zinc-300">
          A gritty, real-world puzzle experience: hidden signals, digital trails,
          and secrets that like to stay hidden.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="#join"
            className="rounded-xl bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-200"
          >
            Join the newsletter
          </a>
          <a
            href="#how"
            className="rounded-xl border border-white/20 px-6 py-3 font-medium hover:bg-white/5"
          >
            How it works
          </a>
        </div>

        <div className="mt-6 text-sm text-zinc-400">
          {found.size === 0
            ? 'Look closely…'
            : allFound
            ? 'System unlocked. One last question…'
            : `Progress: ${found.size}/4 (${lettersLeft.join(', ')} left)`}
        </div>
        {(solved || allFound) && !claimedEmail && (
  <div className="mt-4">
    <button
      onClick={() => setClaimOpen(true)}
      className="rounded-xl bg-white px-4 py-2 font-medium text-black hover:bg-zinc-200"
    >
      Claim your reward
    </button>
  </div>
)}
{claimedEmail && (
  <div className="mt-4 text-sm text-zinc-400">
    Reward already claimed for{' '}
    <span className="text-zinc-300 font-medium">
      {claimedEmail.replace(/(.).+(@.+)/, '$1•••$2')}
    </span>
    .
  </div>
)}

      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-6xl border-t border-white/10 px-6 py-16">
        <h2 className="flex items-center gap-2 text-2xl font-semibold">
          What is FindSolin?
          {/* tiny “watchful eye” dot — click = O */}
          <button
            aria-label="(Hidden) letter O"
            onClick={() => markFound('O')}
            className={`h-2 w-2 rounded-full ${debug ? 'bg-fuchsia-500' : 'bg-white/0'} relative ${!found.has('O') && !debug ? 'fs-blink' : ''}`}
          >
            <span
              className={`absolute inset-[-6px] rounded-full ${
                debug ? 'outline outline-1 outline-fuchsia-500' : ''
              }`}
            />
          </button>
        </h2>
        <p className="mt-4 max-w-3xl text-zinc-300">
          A community puzzle hunt that blends the web with the real world. Sharp eyes are rewarded.
          Every step is solvable right here on this page.
        </p>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl border-t border-white/10 px-6 py-16">
        <h2 className="text-2xl font-semibold">How it works</h2>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 p-5">
            <h3 className="font-medium">1 · Notice something odd</h3>
            <p className="mt-2 text-sm text-zinc-300">
              A character slightly off, a dot that shouldn’t be there, a title that doesn’t sit straight…
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-5">
            {/* Step 2 title is the clickable “M” target (slightly rotated) */}
            <button
              aria-label="(Hidden) letter M"
              onClick={() => markFound('M')}
              className={`font-medium transition ${!found.has('M') && !debug ? 'fs-blink' : ''} ${debug ? 'outline outline-1 outline-fuchsia-500' : ''}`}
              style={{ transform: 'rotate(1.5deg)' }}
            >
              2 · Work with your team
            </button>
            <p className="mt-2 text-sm text-zinc-300">
              When you spot a clue, click it. You’ll see subtle progress feedback.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-5">
            <h3 className="font-medium">3 · Claim your reward</h3>
            <p className="mt-2 text-sm text-zinc-300">
              First 50 solvers get a unique one-use discount code for the first game.
            </p>
          </div>
        </div>
      </section>

      {/* Join / Newsletter */}
      <section id="join" className="mx-auto max-w-6xl border-t border-white/10 px-6 py-16">
        <h2 className="text-2xl font-semibold">Join the newsletter</h2>
        <p className="mt-2 max-w-2xl text-zinc-300">
          Be first to know when we launch. (And maybe get a nudge if you missed something…)
        </p>

        <form onSubmit={onNewsletter} className="mt-6 flex max-w-xl gap-3">
          <input
            type="email"
            required
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-white/30"
          />
          <button
            type="submit"
            className="rounded-xl bg-white px-5 py-3 font-medium text-black hover:bg-zinc-200"
          >
            Sign up
          </button>
        </form>

        {newsletterDone && (
          <div className="mt-3 text-sm text-zinc-400">
            Thanks for signing up! Psst… you might have missed something on this page.
          </div>
        )}
      </section>

      {/* Footer (hidden “E”) */}
      <footer className="border-t border-white/10 py-10 text-center text-sm text-zinc-400">
        <button
          aria-label="(Hidden) letter E"
          onClick={() => markFound('E')}
          className={`rounded px-1 py-0.5 ${debug ? 'outline outline-1 outline-fuchsia-500' : ''}`}
          title={debug ? 'Hidden E' : undefined}
        >
          Every end is a new beginning…
        </button>
        <div className="mt-2">&copy; {new Date().getFullYear()} FindSolin</div>
      </footer>

      {/* Riddle modal */}
      <Modal
        open={riddleOpen && !solved}
        onClose={() => setRiddleOpen(false)}
        title="System unlocked → One last question"
      >
        <p className="text-sm text-zinc-300">
          You found all four signals. Enter the final answer to proceed.
        </p>
        <form onSubmit={onAnswer} className="mt-4 flex gap-2">
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer"
            className="w-full rounded-lg border border-white/10 bg-zinc-900/60 px-3 py-2 outline-none placeholder:text-zinc-500 focus:border-white/30"
          />
        <button
          type="submit"
          className="rounded-lg bg-white px-4 py-2 font-medium text-black hover:bg-zinc-200"
        >
          Unlock
        </button>
        </form>
        <div className="mt-3 text-xs text-zinc-500">Hint: where every hunt begins.</div>
      </Modal>

      {/* Claim modal */}
      <Modal open={claimOpen} onClose={() => setClaimOpen(false)} title="Claim your reward">
        <p className="text-sm text-zinc-300">
          Enter your email to claim a unique, one-use code for our first game.
        </p>
        <form onSubmit={onClaim} className="mt-4 space-y-3">
          <input
            type="email"
            required
            value={claimEmail}
            onChange={(e) => setClaimEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-lg border border-white/10 bg-zinc-900/60 px-3 py-2 outline-none placeholder:text-zinc-500 focus:border-white/30"
          />
          <button type="submit" className="w-full rounded-lg bg-white px-4 py-2 font-medium text-black hover:bg-zinc-200">
            Claim
          </button>
        </form>

        {claimStatus === 'ok' && (
          <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            Success! If the backend is connected, you’ll receive your unique code by email.
          </div>
        )}
        {claimStatus === 'dup' && (
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
            It looks like this email already claimed a code.
          </div>
        )}
        {claimStatus === 'limit' && (
          <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
            The first 50 codes have already been claimed.
          </div>
        )}
        {claimStatus === 'error' && (
          <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
            Something went wrong. Please try again.
          </div>
        )}
      </Modal>

      <Toast message={toast} />

      {debug && (
        <div className="pointer-events-none fixed inset-x-0 bottom-2 z-[95] flex justify-center">
          <div className="pointer-events-auto rounded-full bg-fuchsia-600/90 px-3 py-1 text-xs font-medium text-white shadow-lg">
            Debug mode on — hotspots outlined
          </div>
        </div>
      )}
    </main>
  );
}
