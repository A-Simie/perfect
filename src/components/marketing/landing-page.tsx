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
    <a className="brand-mark" href="#top" aria-label="Perfection home">
      <span className="brand-mark__glyph">P</span>
      <span>Perfection</span>
    </a>
  );
}

function SiteHeader() {
  return (
    <header className="site-header">
      <BrandMark />
      <nav className="site-nav" aria-label="Primary navigation">
        <a href="#how-it-works">How it works</a>
        <a href="#experience">The experience</a>
        <a href="#about">About</a>
      </nav>
      <div className="site-header__actions">
        <a className="site-header__login" href="#login">
          Sign in
        </a>
        <a className="button button--small" href="#start">
          Start styling <ArrowUpRight size={14} strokeWidth={1.8} />
        </a>
      </div>
    </header>
  );
}

export function LandingPage() {
  return (
    <main id="top" className="landing-page">
      <div className="landing-page__wash" aria-hidden="true" />
      <SiteHeader />

      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-section__copy">
          <p className="eyebrow"><Sparkles size={13} /> AI personal styling, reimagined</p>
          <h1 id="hero-title">Your beauty.<br /><em>Perfected.</em></h1>
          <p className="hero-section__lede">
            A personal stylist that sees the details, understands the occasion,
            and creates a complete look that feels unmistakably yours.
          </p>
          <div className="hero-section__actions">
            <a className="button" href="#start">Discover your style <ArrowUpRight size={16} strokeWidth={1.8} /></a>
            <a className="text-link" href="#how-it-works">See how it works <ArrowDownRight size={16} strokeWidth={1.8} /></a>
          </div>
          <p className="hero-section__note">A considered look for every important moment.</p>
        </div>

        <div className="hero-section__visual">
          <div className="hero-image-frame">
            <Image src={heroImage} alt="A bride and groom dressed for their wedding at golden hour" fill priority sizes="(max-width: 800px) 90vw, 52vw" />
            <div className="hero-image-frame__label">01 / For the moment that matters</div>
          </div>
          <div className="hero-section__floating-card">
            <span className="floating-card__line" />
            <p>Personalized<br /><strong>to you</strong></p>
            <ArrowUpRight size={18} strokeWidth={1.5} />
          </div>
          <div className="hero-section__stamp" aria-hidden="true">P</div>
        </div>
      </section>

      <section id="experience" className="intro-section" aria-labelledby="intro-title">
        <div className="intro-section__heading">
          <p className="eyebrow">More than a recommendation</p>
          <h2 id="intro-title">Elegance comes from being understood.</h2>
        </div>
        <p className="intro-section__copy">
          Perfection brings your features, preferences, and destination into one
          point of view—so getting ready feels less like searching and more like
          being seen.
        </p>
      </section>

      <section id="how-it-works" className="showcase-section" aria-labelledby="showcase-title">
        <div className="showcase-section__image">
          <Image src={detailImage} alt="Close-up beauty portrait used to demonstrate skin analysis" fill sizes="(max-width: 800px) 90vw, 42vw" />
          <div className="skin-analysis" aria-label="Example AI analysis: warm neutral skin tone">
            <span className="skin-analysis__target" />
            <span className="skin-analysis__line" />
            <div className="skin-analysis__result">
              <span>Skin analysis</span>
              <strong>Warm neutral</strong>
              <div className="skin-analysis__swatches" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <small>92% confidence</small>
            </div>
          </div>
          <div className="showcase-section__image-caption">Your beauty profile / 01</div>
        </div>
        <div className="showcase-section__content">
          <p className="eyebrow">A stylist with a point of view</p>
          <h2 id="showcase-title">The details make<br /><em>the look.</em></h2>
          <p>
            From your undertone to the way you want to feel walking into a room,
            every recommendation is shaped around the real you.
          </p>
          <div className="showcase-section__steps">
            <div><span>01</span><strong>Understand</strong><small>We read the details that make your beauty yours.</small></div>
            <div><span>02</span><strong>Compose</strong><small>We build one considered look, from hair to heel.</small></div>
            <div><span>03</span><strong>Refine</strong><small>You choose what feels right. Perfection remembers.</small></div>
          </div>
          <a className="text-link" href="#start">Explore the experience <ArrowUpRight size={16} strokeWidth={1.8} /></a>
        </div>
      </section>

      <section id="about" className="style-preview" aria-labelledby="style-preview-title">
        <div className="style-preview__topline"><span>Inside your style report</span><span>02 / 04</span></div>
        <div className="style-preview__body">
          <div>
            <p className="eyebrow">A complete point of view</p>
            <h2 id="style-preview-title">One look.<br /><em>Beautifully considered.</em></h2>
            <p>Hair, color, silhouette, accessories—everything in conversation.</p>
          </div>
          <div className="style-preview__card">
            <div className="style-preview__card-image">
              <Image src={stylingImage} alt="Editorial model in an elegant plum evening dress" fill sizes="(max-width: 800px) 80vw, 25vw" />
            </div>
            <div className="style-preview__card-copy"><span>Suggested direction</span><strong>Quiet confidence</strong><small>Soft contrast · Sculpted line · Rosewood</small></div>
          </div>
          <div className="style-preview__play"><Play size={17} fill="currentColor" /><span>See a sample look</span></div>
        </div>
      </section>

      <footer className="site-footer" id="start">
        <BrandMark />
        <p>For every version of you.</p>
        <a className="button button--small" href="#top">Begin your journey <ChevronDown size={14} /></a>
      </footer>
    </main>
  );
}
