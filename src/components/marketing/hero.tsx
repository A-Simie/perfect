"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, WandSparkles } from "lucide-react";
import { Navbar } from "./navbar";

export function Hero() {
  return <section id="top" className="relative min-h-[92svh] overflow-hidden bg-[#765f51] text-white"><Image src="/image/landing_alt.webp" alt="A close-up portrait in warm light" fill preload sizes="100vw" className="object-cover object-center" /><div className="absolute inset-0 bg-gradient-to-r from-[#241b18]/85 via-[#241b18]/35 to-[#241b18]/10"/><Navbar/><div className="relative z-10 mx-auto flex min-h-[92svh] max-w-7xl items-end px-6 pb-16 pt-36 sm:px-12 lg:px-20"><div className="max-w-2xl"><p className="eyebrow hero-eyebrow"><WandSparkles size={14}/> Personal styling, considered</p><h1 className="display mt-6 max-w-2xl text-white">Find the version of you that already feels right.</h1><p className="hero-copy mt-7 max-w-lg text-base leading-8 sm:text-lg">Perfection is an AI personal stylist that learns your features, your rhythm, and the moments you want to show up for.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/signup" className="button-light">Start your edit <ArrowUpRight size={15}/></Link><a href="#experience" className="button-ghost">See how it works <ArrowDown size={15}/></a></div></div></div></section>;
}
