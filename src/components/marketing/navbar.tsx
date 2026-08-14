"use client";

import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  return <header className="absolute inset-x-0 top-0 z-20 px-6 py-6 sm:px-12 lg:px-20"><div className="mx-auto flex max-w-7xl items-center justify-between"><Link href="/" aria-label="Perfection home" className="relative block h-9 w-44"><Image src="/image/perfection_logo_transparent.webp" alt="Perfection" fill sizes="176px" className="object-contain object-left brightness-0 invert" /></Link><nav className="hidden items-center gap-8 text-[10px] uppercase tracking-[.18em] text-white/90 md:flex"><a href="#experience">The experience</a><a href="#styling-rite">Your edit</a><a href="#journal">Journal</a></nav><Link href="/signup" className="rounded-[5px] border border-white/60 px-5 py-2.5 text-[10px] uppercase tracking-[.16em] transition hover:bg-white hover:text-[#171615]">Get started</Link></div></header>;
}
