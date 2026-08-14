"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import { Hero } from "./hero";

const looks = [
  { image: "/image/looks_for_real_life.webp", title: "Looks for real life", text: "From first meetings to last-minute plans, get dressed with intention." },
  { image: "/image/a_little_more_for_you.webp", title: "A little more you", text: "Thoughtful recommendations that sharpen your instincts, not replace them." },
  { image: "/image/perfection_16.webp", title: "Your style, decoded", text: "A visual language built from the details that make you, you." },
];

export function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <Hero />

      <section id="experience" className="editorial-grid border-b border-[var(--line)] bg-[#e9ded3]">
        <div className="relative min-h-[28rem] overflow-hidden md:min-h-[38rem]">
          <Image src="/image/landing_pic.webp" alt="A person discovering a new routine" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-center" />
        </div>
        <div className="flex flex-col justify-center px-8 py-16 sm:px-14 lg:px-24">
          <p className="eyebrow">The Perfection experience</p>
          <h2 className="display mt-5 max-w-xl">Style is personal. Your tools should be too.</h2>
          <p className="body-copy mt-6 max-w-md">Perfection brings your wardrobe, your features, your mood, and your moment into one considered point of view.</p>
          <Link href="/signup" className="button-dark mt-9 w-fit">Build your profile <ArrowUpRight size={15} /></Link>
        </div>
      </section>

      <section id="styling-rite" className="section-shell">
        <div className="section-heading"><div><p className="eyebrow">A better way to get ready</p><h2 className="display mt-4 max-w-xl">Your everyday edit.</h2></div><p className="body-copy max-w-sm">Three small shifts that make every decision feel more like yours.</p></div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">{looks.map((look, index) => <article key={look.title} className="group"><div className="image-card"><Image src={look.image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" /><span className="image-index">0{index + 1}</span></div><h3 className="serif-title mt-5">{look.title}</h3><p className="body-copy mt-2 max-w-xs">{look.text}</p></article>)}</div>
      </section>

      <section className="border-y border-[var(--line)] bg-[#f5efe9] px-6 py-20 sm:px-12 lg:px-24"><div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center"><div><p className="eyebrow">Why choose Perfection</p><h2 className="display mt-5 max-w-lg">Less noise. More instinct.</h2><p className="body-copy mt-6 max-w-md">No endless scrolling, no one-size-fits-all rules. Just a calm, intelligent place to find what works for you.</p><Link href="/signup" className="button-outline mt-8 w-fit">Start your edit <ArrowUpRight size={15} /></Link></div><div className="rounded-sm border border-[var(--line)] bg-white/70 p-5 sm:p-8"><div className="grid grid-cols-[1.4fr_1fr_1fr] border-b border-[var(--line)] pb-4 text-[10px] uppercase tracking-[.16em] text-[var(--taupe)]"><span>Features</span><span className="text-center">Perfection</span><span className="text-center">The usual way</span></div>{["Personal recommendations","Built around your context","A point of view that evolves"].map((item)=><div key={item} className="grid grid-cols-[1.4fr_1fr_1fr] items-center border-b border-[var(--line)] py-5 text-sm"><span>{item}</span><span className="mx-auto grid h-6 w-6 place-items-center rounded-full bg-[#dbe6d6] text-[#47623e]"><Check size={14}/></span><span className="mx-auto text-[var(--taupe)]">—</span></div>)}</div></div></section>

      <section className="editorial-grid bg-[#d5c4b2]"><div className="relative min-h-[27rem] md:min-h-[34rem]"><Image src="/image/get_ready_for_the_life_you_live.webp" alt="A confident personal style moment" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-center" /></div><div className="flex flex-col justify-center px-8 py-16 sm:px-14 lg:px-24"><p className="eyebrow">A ritual for a mindful life</p><h2 className="display mt-5 max-w-md">Get ready for the life you actually live.</h2><p className="body-copy mt-6 max-w-md">Perfection turns the blank closet moment into a small act of self-trust.</p><Link href="/signup" className="button-dark mt-9 w-fit">Meet your stylist <ArrowUpRight size={15}/></Link></div></section>

      <section id="journal" className="section-shell"><div className="text-center"><p className="eyebrow">Notes from the edit</p><h2 className="display mt-4">The journal</h2></div><div className="mt-12 grid gap-5 md:grid-cols-3">{[{title:"The art of a signature", image:"/image/perfect_11.webp"},{title:"Dress for the energy", image:"/image/dress_for_the_energy.webp"},{title:"A softer morning", image:"/image/a_softer_momorning.webp"}].map((post)=><article key={post.title} className="border-t border-[var(--line)] pt-4"><div className="relative aspect-[1.5] overflow-hidden rounded-[10px]"><Image src={post.image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /></div><p className="eyebrow mt-5">The Perfection journal</p><h3 className="serif-title mt-2">{post.title}</h3><Link href="/signup" className="inline-flex items-center gap-2 pt-5 text-xs uppercase tracking-[.14em]">Read the note <ArrowUpRight size={14}/></Link></article>)}</div></section>

      <footer className="bg-[#171615] px-6 py-16 text-[#f7f1eb] sm:px-12 lg:px-24"><div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]"><div><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#f7f1eb] text-[#171615]"><Sparkles size={16}/></div><span className="relative block h-8 w-40"><Image src="/image/perfection_logo_transparent.webp" alt="Perfection" fill sizes="160px" className="object-contain object-left brightness-0 invert" /></span></div><p className="mt-6 max-w-xs text-sm leading-7 text-white/60">A personal stylist for the way you move through the world.</p></div><div><p className="eyebrow text-white/50">Explore</p><div className="mt-5 grid gap-3 text-sm text-white/75"><a href="#experience">The experience</a><a href="#styling-rite">Your edit</a><a href="#journal">Journal</a></div></div><div><p className="eyebrow text-white/50">Connect</p><div className="mt-5 grid gap-3 text-sm text-white/75"><a href="mailto:hello@perfection.style">hello@perfection.style</a><a href="#top">Instagram</a></div></div><div><p className="eyebrow text-white/50">Ready when you are</p><p className="mt-5 text-sm leading-6 text-white/70">Start with a few questions. Leave with a clearer point of view.</p><Link href="/signup" className="button-light mt-6 w-fit">Create your profile <ArrowUpRight size={15}/></Link></div></div><div className="mx-auto mt-16 max-w-6xl border-t border-white/15 pt-5 text-[10px] uppercase tracking-[.16em] text-white/40">© 2026 Perfection. Made for your everyday.</div></footer>
    </main>
  );
}
