// src/app/page.tsx
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            {/* Change /logo.svg to /logo.png if you uploaded a PNG */}
            <Image
              src="/logo.svg"
              alt="FindSolin"
              width={140}
              height={36}
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
          The adventure<br className="hidden md:block" /> begins here.
        </h1>
        <p className="mt-6 max-w-2xl text-zinc-300">
          A gritty, real-world puzzle experience: hidden signals, digital trails,
          and secrets that like to stay hidden.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="#join"
            className="rounded-xl bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-200"
          >
            Join the newsletter
          </Link>
          <Link
            href="#how"
            className="rounded-xl border border-white/20 px-6 py-3 font-medium hover:bg-white/5"
          >
            How it works
          </Link>
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-6xl px-6 py-16 border-t border-white/10">
        <h2 className="text-2xl font-semibold">What is FindSolin?</h2>
        <p className="mt-4 max-w-3xl text-zinc-300">
          A community puzzle hunt that blends the web with the real world. Sharp eyes are rewarded.
        </p>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-16 border-t border-white/10">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <ol className="mt-6 space-y-3 text-zinc-300">
          <li>1. Spot a clue on this page.</li>
          <li>2. Follow the trail, enter your answer, get a reward.</li>
          <li>3. First 50 solvers get a unique code for the first game.</li>
        </ol>
      </section>

      {/* Join */}
      <section id="join" className="mx-auto max-w-6xl px-6 py-16 border-t border-white/10">
        <h2 className="text-2xl font-semibold">Join</h2>
        <p className="mt-4 max-w-3xl text-zinc-300">
          Don’t miss the launch. Drop your email on the form above (or below, if you moved it).
        </p>
      </section>

      <footer className="border-t border-white/10 py-10 text-center text-sm text-zinc-400">
        © {new Date().getFullYear()} FindSolin. All rights reserved.
      </footer>
    </main>
  );
}
