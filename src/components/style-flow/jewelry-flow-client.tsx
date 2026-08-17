"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Gem, LoaderCircle, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { pollCoordinatedLook, startCoordinatedLook } from "@/lib/coordinated-look/coordinated-look.client";
import { readStyleFlow, updateStyleFlow, type StyleFlowState } from "@/lib/style-flow/style-flow.storage";
import { StyleFlowHeader } from "./style-flow-header";

export function JewelryFlowClient() {
  const router = useRouter();
  const [flow, setFlow] = useState<StyleFlowState | null | undefined>(undefined);
  const [applying, setApplying] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => { const timer = window.setTimeout(() => setFlow(readStyleFlow()), 0); return () => window.clearTimeout(timer); }, []);
  if (flow === undefined) return <div className="grid min-h-[60vh] place-items-center"><LoaderCircle className="animate-spin" /></div>;
  if (!flow) return <section className="grid min-h-[60vh] place-items-center"><button className="button-dark" onClick={() => router.replace("/dashboard")}>Create Beauty Palette</button></section>;

  const applyNecklace = async () => {
    if (applying || !flow.necklaceItemIndex) return; const controller = new AbortController(); setApplying(true); setAttempt(0);
    try { const task = await startCoordinatedLook({ feature: "necklace", sourceFileId: flow.sourceFileId, itemIndex: flow.necklaceItemIndex }, controller.signal); const resultUrl = await pollCoordinatedLook("necklace", task, controller.signal, setAttempt); updateStyleFlow({ necklaceResultUrl: resultUrl }); setFlow({ ...flow, necklaceResultUrl: resultUrl }); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Necklace try-on failed."); } finally { setApplying(false); }
  };

  return <section><StyleFlowHeader step="04" title="Add the finishing detail" description="Choose one of ten necklace references coordinated with your palette and occasion." /><div className="grid gap-6 lg:grid-cols-2"><div className="mx-auto w-full max-w-[25rem]"><div className="aspect-[4/5] rounded-[8px] bg-[var(--surface-container-high)] bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${JSON.stringify(flow.necklaceResultUrl ?? flow.makeupResultUrl ?? flow.portraitDataUrl).slice(1, -1)})` }} /></div><div className="flex flex-col justify-center"><p className="eyebrow"><Gem size={13} /> Necklace catalog</p><div className="mt-4 grid grid-cols-5 gap-2">{Array.from({ length: 10 }, (_, index) => index + 1).map((itemIndex) => <button type="button" key={itemIndex} onClick={() => { updateStyleFlow({ necklaceItemIndex: itemIndex }); setFlow({ ...flow, necklaceItemIndex: itemIndex }); }} className={`aspect-square rounded-[6px] border bg-contain bg-center bg-no-repeat ${flow.necklaceItemIndex === itemIndex ? "border-[var(--burgundy)]" : "border-[var(--line)]"}`} style={{ backgroundImage: `url(/catalog/necklace-${String(itemIndex).padStart(2, "0")}.jpg)` }} />)}</div><button type="button" onClick={() => void applyNecklace()} disabled={applying || !flow.necklaceItemIndex} className="button-dark mt-6 w-fit disabled:opacity-40">{applying ? <LoaderCircle size={14} className="animate-spin" /> : <Sparkles size={14} />}{applying ? `Applying · ${attempt}` : "Try necklace"}</button></div></div>{flow.necklaceResultUrl && <div className="mt-6 flex justify-end border-t border-[var(--line)] pt-5"><button type="button" onClick={() => router.push("/try-on")} className="button-dark">Continue to shoes <ArrowRight size={14} /></button></div>}</section>;
}
