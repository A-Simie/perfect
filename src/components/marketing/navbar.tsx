"use client";

import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  return <header className="absolute inset-x-0 top-0 z-20 px-6 py-6 sm:px-12 lg:px-20"><div className="mx-auto flex max-w-7xl items-center justify-between rounded-[8px] border border-white/10 bg-[#3b241b]/55 px-4 py-3 shadow-[0_10px_30px_rgba(37,20,14,0.18)] backdrop-blur-sm"><Link href="/" aria-label="Perfection home" className="relative block h-9 w-44"><Image src="/image/perfection_logo_transparent.webp" alt="Perfection" fill sizes="176px" className="object-contain object-left brightness-0 invert" /></Link><nav className="hidden items-center gap-8 text-[10px] uppercase tracking-[.18em] text-white/90 md:flex"><a className="transition-colors hover:text-white" href="#experience">The experience</a><a className="transition-colors hover:text-white" href="#styling-rite">Your edit</a><a className="transition-colors hover:text-white" href="#journal">Journal</a></nav><Link href="/login" className="rounded-[6px] border border-white/70 bg-[#4b2c20]/70 px-5 py-2.5 text-[10px] uppercase tracking-[.16em] text-white transition hover:border-white hover:bg-white hover:text-[#3b241b]">Get started</Link></div></header>;
}
