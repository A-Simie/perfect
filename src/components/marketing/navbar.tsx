"use client";

import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  return <header className="absolute inset-x-0 top-0 z-20 px-3 py-4 sm:px-12 sm:py-6 lg:px-20"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-[8px] border border-white/10 bg-[#3b241b]/55 px-3 py-3 shadow-[0_10px_30px_rgba(37,20,14,0.18)] backdrop-blur-sm sm:px-4"><Link href="/" aria-label="Perfection home" className="relative block h-8 min-w-0 flex-1 sm:h-9 sm:w-44 sm:flex-none"><Image src="/image/perfection_logo_transparent.webp" alt="Perfection" fill sizes="(max-width: 639px) 132px, 176px" className="object-contain object-left brightness-0 invert" /></Link><nav className="hidden items-center gap-8 text-[10px] uppercase tracking-[.18em] text-white/90 md:flex"><a className="transition-colors hover:text-white" href="#experience">The experience</a><a className="transition-colors hover:text-white" href="#styling-rite">Your edit</a><a className="transition-colors hover:text-white" href="#journal">Journal</a></nav><Link href="/login" className="shrink-0 whitespace-nowrap rounded-[6px] border border-white/70 bg-[#4b2c20]/70 px-3 py-2.5 text-[9px] uppercase tracking-[.12em] text-white transition hover:border-white hover:bg-[#4b2c20]/90 hover:text-white sm:px-5 sm:text-[10px] sm:tracking-[.16em]">Get started</Link></div></header>;
}
