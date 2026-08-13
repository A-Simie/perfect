import Image from "next/image";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  Play,
  Sparkles,
} from "lucide-react";

const heroImage =
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=90";
const detailImage =
  "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=1400&q=90";
const stylingImage =
  "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1400&q=90";

function BrandMark() {
  return (
    <a className="inline-flex items-center gap-[0.55rem] font-[Georgia,serif] text-[0.93rem] tracking-[0.03em]" href="#top" aria-label="Perfection home">
      <span className="inline-flex h-[1.65rem] w-[1.65rem] items-center justify-center rounded-full border border-burgundy font-[Georgia,serif] text-[0.75rem] text-burgundy">P</span>
      <span>Perfection</span>
    </a>
  );
}

function SiteHeader() {
  return (
    <header className="relative z-[1] mx-auto flex max-w-[1240px] items-center justify-between px-[4.5rem] pt-8 pb-[1.2rem] animate-reveal-down max-[900px]:px-6 max-[900px]:py-[1.4rem]">
      <BrandMark />
      <nav className="ml-32 flex gap-8 max-[900px]:hidden" aria-label="Primary navigation">
        <a href="#how-it-works" className="text-[0.7rem] uppercase tracking-[0.05em] text-muted-ink transition-colors hover:text-burgundy">How it works</a>
        <a href="#experience" className="text-[0.7rem] uppercase tracking-[0.05em] text-muted-ink transition-colors hover:text-burgundy">The experience</a>
        <a href="#about" className="text-[0.7rem] uppercase tracking-[0.05em] text-muted-ink transition-colors hover:text-burgundy">About</a>
      </nav>
      <div className="flex items-center gap-6">
        <a className="text-[0.7rem] uppercase tracking-[0.05em] text-muted-ink transition-colors hover:text-burgundy max-[900px]:hidden" href="/login">
          Sign in
        </a>
        <a className="btn-primary btn-primary-hover btn-small" href="/signup">
          Start styling <ArrowUpRight size={14} strokeWidth={1.8} />
        </a>
      </div>
    </header>
  );
}

export function LandingPage() {
  return (
    <main id="top" className="relative min-h-screen overflow-hidden">
      {/* Wash gradient */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-[1] h-[43rem]"
        style={{ background: "radial-gradient(circle at 75% 9%, rgba(195,165,110,.22), transparent 22rem), linear-gradient(120deg, #f7f0e9 20%, #e5d4c9 100%)" }}
        aria-hidden="true"
      />

      <SiteHeader />

      {/* ── Hero ── */}
      <section
        className="mx-auto grid min-h-[43rem] max-w-[1240px] items-center gap-16 px-[4.5rem] pt-16 pb-28 max-[900px]:flex max-[900px]:flex-col max-[900px]:gap-8 max-[900px]:px-6 max-[900px]:pt-12 max-[900px]:pb-20"
        style={{ gridTemplateColumns: "minmax(17rem, .75fr) minmax(32rem, 1.25fr)" }}
        aria-labelledby="hero-title"
      >
        <div className="relative z-[1] pl-16 max-[900px]:pl-0">
          <p className="mb-[1.6rem] flex items-center gap-[0.45rem] text-[0.64rem] uppercase tracking-[0.14em] text-burgundy animate-reveal-up">
            <Sparkles size={13} /> AI personal styling, reimagined
          </p>
          <h1 id="hero-title" className="m-0 font-[Georgia,'Times_New_Roman',serif] text-[clamp(4rem,7vw,7rem)] font-normal leading-[0.86] tracking-[-0.045em] text-burgundy animate-reveal-up-1">
            Your beauty.<br /><em className="italic text-taupe">Perfected.</em>
          </h1>
          <p className="mt-8 mb-8 max-w-[25rem] text-[0.95rem] leading-[1.8] text-muted-ink animate-reveal-up-2">
            A personal stylist that sees the details, understands the occasion,
            and creates a complete look that feels unmistakably yours.
          </p>
          <div className="flex flex-wrap items-center gap-6 animate-reveal-up-3">
            <a className="btn-primary btn-primary-hover" href="/signup">
              Discover your style <ArrowUpRight size={16} strokeWidth={1.8} />
            </a>
            <a className="inline-flex items-center gap-[0.55rem] border-b border-line pb-[0.4rem] text-[0.7rem] uppercase tracking-[0.06em] text-burgundy transition-all hover:gap-[0.8rem] hover:border-burgundy" href="#how-it-works">
              See how it works <ArrowDownRight size={16} strokeWidth={1.8} />
            </a>
          </div>
          <p className="mt-20 font-[Georgia,serif] text-[0.78rem] italic text-taupe animate-reveal-up-4">
            A considered look for every important moment.
          </p>
        </div>

        <div className="relative min-h-[35rem] max-[900px]:min-h-[27rem] max-[900px]:w-full">
          <div className="animate-image-reveal relative h-[35rem] overflow-hidden max-[900px]:h-[27rem] after:absolute after:inset-0 after:bg-gradient-to-b after:from-[rgba(25,12,14,0.05)] after:to-[rgba(25,12,14,0.55)] after:content-['']">
            <Image
              src={heroImage}
              alt="A bride and groom dressed for their wedding at golden hour"
              fill
              priority
              sizes="(max-width: 800px) 90vw, 52vw"
              className="object-cover transition-transform duration-[1.2s] [object-position:57%_center] hover:scale-[1.035]"
              style={{ transitionTimingFunction: "cubic-bezier(.2,.7,.2,1)" }}
            />
            <div className="absolute bottom-[1.1rem] left-[1.2rem] z-[1] text-[0.58rem] uppercase tracking-[0.12em] text-white">
              01 / For the moment that matters
            </div>
          </div>
          <div className="absolute -left-16 bottom-12 z-[2] flex w-48 items-center gap-4 bg-paper p-[1.2rem_1.3rem] shadow-[0_1.5rem_3rem_rgba(33,21,27,0.18)] animate-card-arrive max-[900px]:bottom-[-1.2rem] max-[900px]:left-4">
            <span className="h-8 w-px bg-burgundy" />
            <p className="m-0 mr-auto font-[Georgia,serif] text-[0.78rem] leading-[1.15] text-muted-ink">
              Personalized<br /><strong className="text-base font-normal text-burgundy">to you</strong>
            </p>
            <ArrowUpRight size={18} strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-10 -right-8 z-[2] flex h-32 w-32 items-center justify-center rounded-full border border-white/75 font-[Georgia,serif] text-6xl text-white animate-stamp-arrive max-[900px]:-bottom-8 max-[900px]:-right-[0.8rem]" style={{ transform: "rotate(14deg)" }} aria-hidden="true">
            P
          </div>
        </div>
      </section>

      {/* ── Intro ── */}
      <section
        id="experience"
        className="scroll-reveal relative grid w-full items-end gap-24 bg-aubergine text-[#f7eee8] before:pointer-events-none before:absolute before:inset-4 before:border before:border-champagne/35 before:content-[''] max-[900px]:flex max-[900px]:flex-col max-[900px]:gap-10 max-[900px]:px-6 max-[900px]:py-20"
        style={{ gridTemplateColumns: "1fr .75fr", padding: "7rem max(8.5rem, calc((100vw - 1240px) / 2 + 8.5rem))" }}
        aria-labelledby="intro-title"
      >
        <div>
          <p className="mb-[1.6rem] flex items-center gap-[0.45rem] text-[0.64rem] uppercase tracking-[0.14em] text-champagne">
            More than a recommendation
          </p>
          <h2 id="intro-title" className="m-0 font-[Georgia,'Times_New_Roman',serif] text-[clamp(2.5rem,4vw,4.5rem)] font-normal leading-[0.98] tracking-[-0.045em] text-[#f7eee8]">
            Elegance comes from being understood.
          </h2>
        </div>
        <p className="max-w-[25rem] text-[0.95rem] leading-[1.8] text-[#cdbeb7]">
          Perfection brings your features, preferences, and destination into one
          point of view—so getting ready feels less like searching and more like
          being seen.
        </p>
      </section>

      {/* ── Showcase / How it works ── */}
      <section
        id="how-it-works"
        className="scroll-reveal mx-auto grid max-w-[1240px] items-center gap-24 px-[8.5rem] py-32 max-[900px]:flex max-[900px]:flex-col max-[900px]:gap-10 max-[900px]:px-6 max-[900px]:py-20"
        style={{ gridTemplateColumns: ".85fr 1fr" }}
        aria-labelledby="showcase-title"
      >
        <div className="relative h-[38rem] overflow-hidden shadow-[1.5rem_1.5rem_0_#e1d0c4] max-[900px]:h-[30rem] max-[900px]:w-full">
          <Image
            src={detailImage}
            alt="Close-up beauty portrait used to demonstrate skin analysis"
            fill
            sizes="(max-width: 800px) 90vw, 42vw"
            className="object-cover transition-transform duration-1000 [object-position:center_37%] hover:scale-[1.025]"
            style={{ transitionTimingFunction: "cubic-bezier(.2,.7,.2,1)" }}
          />
          {/* Skin analysis overlay */}
          <div className="absolute inset-0 z-[2]" aria-label="Example AI analysis: warm neutral skin tone">
            <span className="absolute left-[39%] top-[54%] h-4 w-4 rounded-full border border-white/90 animate-target-pulse after:absolute after:inset-[0.28rem] after:rounded-full after:bg-white after:content-[''] max-[900px]:left-[35%]" />
            <span className="absolute left-[calc(39%+1rem)] top-[calc(54%+0.5rem)] h-px w-[24%] origin-left bg-white animate-line-draw max-[900px]:left-[calc(35%+1rem)] max-[900px]:w-[23%]" />
            <div className="absolute left-[62%] top-[45%] z-[2] flex w-[9.5rem] flex-col gap-[0.35rem] bg-[rgba(28,18,22,0.78)] px-4 py-[0.85rem] text-white backdrop-blur-[12px] animate-reveal-left max-[900px]:left-[57%] max-[900px]:w-[8.8rem]">
              <span className="text-[0.52rem] uppercase tracking-[0.1em] text-[#d9c9c0]">Skin analysis</span>
              <strong className="font-[Georgia,serif] text-[0.95rem] font-normal">Warm neutral</strong>
              <div className="my-[0.2rem] flex gap-[0.35rem]" aria-hidden="true">
                <i className="block h-4 w-4 rounded-full border border-white/50 bg-[#d9a27f]" />
                <i className="block h-4 w-4 rounded-full border border-white/50 bg-[#bc7959]" />
                <i className="block h-4 w-4 rounded-full border border-white/50 bg-[#8f4f3f]" />
              </div>
              <small className="text-[0.52rem] uppercase tracking-[0.1em] text-[#d9c9c0]">92% confidence</small>
            </div>
          </div>
          <div className="absolute bottom-[1.1rem] left-[1.2rem] z-[1] text-[0.58rem] uppercase tracking-[0.12em] text-white">
            Your beauty profile / 01
          </div>
        </div>

        <div className="pr-8 max-[900px]:max-w-full max-[900px]:p-0">
          <p className="mb-[1.6rem] flex items-center gap-[0.45rem] text-[0.64rem] uppercase tracking-[0.14em] text-burgundy">
            A stylist with a point of view
          </p>
          <h2 id="showcase-title" className="m-0 font-[Georgia,'Times_New_Roman',serif] text-[clamp(2.5rem,4vw,4.5rem)] font-normal leading-[0.98] tracking-[-0.045em] text-burgundy">
            The details make<br /><em className="italic text-taupe">the look.</em>
          </h2>
          <p className="my-8 max-w-[25rem] text-[0.95rem] leading-[1.8] text-muted-ink">
            From your undertone to the way you want to feel walking into a room,
            every recommendation is shaped around the real you.
          </p>
          <div className="my-12 border-t border-line">
            <div className="grid gap-3 border-b border-line py-4" style={{ gridTemplateColumns: "2rem 1fr" }}>
              <span className="text-[0.65rem] text-taupe">01</span>
              <strong className="font-[Georgia,serif] text-base font-normal text-burgundy">Understand</strong>
              <small className="col-start-2 text-[0.72rem] leading-[1.5] text-muted-ink">We read the details that make your beauty yours.</small>
            </div>
            <div className="grid gap-3 border-b border-line py-4" style={{ gridTemplateColumns: "2rem 1fr" }}>
              <span className="text-[0.65rem] text-taupe">02</span>
              <strong className="font-[Georgia,serif] text-base font-normal text-burgundy">Compose</strong>
              <small className="col-start-2 text-[0.72rem] leading-[1.5] text-muted-ink">We build one considered look, from hair to heel.</small>
            </div>
            <div className="grid gap-3 border-b border-line py-4" style={{ gridTemplateColumns: "2rem 1fr" }}>
              <span className="text-[0.65rem] text-taupe">03</span>
              <strong className="font-[Georgia,serif] text-base font-normal text-burgundy">Refine</strong>
              <small className="col-start-2 text-[0.72rem] leading-[1.5] text-muted-ink">You choose what feels right. Perfection remembers.</small>
            </div>
          </div>
          <a className="inline-flex items-center gap-[0.55rem] border-b border-line pb-[0.4rem] text-[0.7rem] uppercase tracking-[0.06em] text-burgundy transition-all hover:gap-[0.8rem] hover:border-burgundy" href="/signup">
            Explore the experience <ArrowUpRight size={16} strokeWidth={1.8} />
          </a>
        </div>
      </section>

      {/* ── Style Preview ── */}
      <section
        id="about"
        className="scroll-reveal relative w-full max-[900px]:px-6 max-[900px]:pb-20 max-[900px]:pt-6"
        style={{ background: "linear-gradient(135deg, #d8bdad, #c5a18d)", padding: "2rem max(8.5rem, calc((100vw - 1240px) / 2 + 8.5rem)) 7rem" }}
        aria-labelledby="style-preview-title"
      >
        <div className="flex justify-between border-b border-burgundy/25 pb-4 text-[0.62rem] uppercase tracking-[0.12em] text-burgundy">
          <span>Inside your style report</span><span>02 / 04</span>
        </div>
        <div
          className="grid items-center gap-16 pt-20 max-[900px]:flex max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-12 max-[900px]:pt-16"
          style={{ gridTemplateColumns: "1fr .72fr .35fr" }}
        >
          <div>
            <p className="mb-[1.6rem] flex items-center gap-[0.45rem] text-[0.64rem] uppercase tracking-[0.14em] text-burgundy">
              A complete point of view
            </p>
            <h2 id="style-preview-title" className="m-0 font-[Georgia,'Times_New_Roman',serif] text-[clamp(2.5rem,4vw,4.5rem)] font-normal leading-[0.98] tracking-[-0.045em] text-burgundy">
              One look.<br /><em className="italic text-taupe">Beautifully considered.</em>
            </h2>
            <p className="mt-8 max-w-[25rem] text-[0.95rem] leading-[1.8] text-muted-ink">
              Hair, color, silhouette, accessories—everything in conversation.
            </p>
          </div>
          <div className="bg-paper shadow-[1.2rem_1.2rem_0_rgba(65,19,25,0.18),0_2rem_4rem_rgba(33,21,27,0.14)] rotate-2 transition-transform duration-500 hover:rotate-0 hover:-translate-y-2 max-[900px]:max-w-[20rem] max-[900px]:self-center" style={{ transitionTimingFunction: "cubic-bezier(.2,.7,.2,1)" }}>
            <div className="relative h-64 overflow-hidden">
              <Image src={stylingImage} alt="Editorial model in an elegant plum evening dress" fill sizes="(max-width: 800px) 80vw, 25vw" className="object-cover" />
            </div>
            <div className="flex flex-col gap-[0.45rem] p-[1.2rem]">
              <span className="text-[0.63rem] uppercase tracking-[0.08em] text-muted-ink">Suggested direction</span>
              <strong className="font-[Georgia,serif] text-[1.2rem] font-normal text-burgundy">Quiet confidence</strong>
              <small className="text-[0.63rem] uppercase tracking-[0.08em] text-muted-ink">Soft contrast · Sculpted line · Rosewood</small>
            </div>
          </div>
          <div className="flex flex-col items-center gap-[0.8rem] justify-self-end font-[Georgia,serif] text-[0.8rem] text-burgundy text-center max-[900px]:self-center max-[900px]:justify-self-auto">
            <Play size={17} fill="currentColor" />
            <span>See a sample look</span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer id="start" className="flex w-full items-center justify-between bg-aubergine px-[max(4.5rem,calc((100vw-1240px)/2+4.5rem))] py-12 text-[#f7eee8] max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-6 max-[900px]:px-6 max-[900px]:py-10">
        <BrandMark />
        <p className="m-0 font-[Georgia,serif] text-[0.85rem] italic text-[#bdaea8]">For every version of you.</p>
        <a className="btn-primary btn-primary-hover btn-small" href="#top">Begin your journey <ChevronDown size={14} /></a>
      </footer>
    </main>
  );
}
