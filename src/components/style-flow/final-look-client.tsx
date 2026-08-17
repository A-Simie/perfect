"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, LoaderCircle, Sparkles } from "lucide-react";
import { readStyleFlow, type StyleFlowState } from "@/lib/style-flow/style-flow.storage";

export function FinalLookClient() {
  const router = useRouter(); const [flow, setFlow] = useState<StyleFlowState | null | undefined>(undefined);
  useEffect(() => { const timer = window.setTimeout(() => setFlow(readStyleFlow()), 0); return () => window.clearTimeout(timer); }, []);
  if (flow === undefined) return <div className="grid min-h-[60vh] place-items-center"><LoaderCircle className="animate-spin" /></div>;
  if (!flow) return <section className="grid min-h-[60vh] place-items-center"><button className="button-dark" onClick={() => router.replace("/dashboard")}>Create Beauty Palette</button></section>;
  const sections = [{ label: "Makeup", url: flow.makeupResultUrl, fallback: flow.portraitDataUrl }, { label: "Clothing", url: flow.clothingResultUrl, fallback: flow.bodyDataUrl }, { label: "Shoes", url: flow.shoesResultUrl, fallback: flow.clothingResultUrl }, { label: "Necklace", url: flow.necklaceResultUrl, fallback: flow.portraitDataUrl }];
  const complete = sections.filter((item) => item.url).length;
  return <section><div className="border-b border-[var(--line)] pb-5"><p className="eyebrow"><Sparkles size={13} /> Coordinated look / final</p><h1 className="mt-2 font-[Georgia,serif] text-4xl text-[var(--burgundy)]">{flow.profile.palette.title}</h1><p className="mt-2 text-sm text-[var(--muted-ink)]">{complete === sections.length ? "Your complete coordinated direction is ready." : `Your look is ready with ${complete} of ${sections.length} virtual try-ons completed.`}</p></div><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{sections.map((item) => <article key={item.label} className="overflow-hidden rounded-[8px] border border-[var(--line)] bg-[var(--paper)]"><div className="aspect-[4/5] bg-[var(--surface-container-high)] bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${JSON.stringify(item.url ?? item.fallback).slice(1, -1)})` }} /><div className="flex items-center justify-between p-3"><strong className="text-xs">{item.label}</strong><span className={`flex items-center gap-1 text-[10px] ${item.url ? "text-[var(--sage-ink)]" : "text-[var(--muted-ink)]"}`}>{item.url && <Check size={12} />}{item.url ? "Applied" : "Original"}</span></div></article>)}</div><div className="mt-6 grid gap-4 border-y border-[var(--line)] py-5 sm:grid-cols-2"><div><p className="eyebrow">Palette direction</p><p className="mt-2 text-sm leading-6 text-[var(--muted-ink)]">{flow.profile.palette.description}</p></div><div className="flex flex-wrap items-center gap-2">{flow.profile.palette.clothingColors.map((color) => <span key={color.name} title={color.name} className="h-10 w-10 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />)}</div></div><button type="button" onClick={() => router.push("/try-on")} className="button-outline mt-6"><ArrowLeft size={14} /> Back to shoes</button></section>;
}
