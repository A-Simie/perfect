"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, FileImage, LoaderCircle, Shirt, Upload } from "lucide-react";
import { toast } from "react-toastify";
import { pollCoordinatedLook, startCoordinatedLook } from "@/lib/coordinated-look/coordinated-look.client";
import { readStyleFlow, updateStyleFlow, type ClothingFocus, type StyleFlowState } from "@/lib/style-flow/style-flow.storage";
import { reserveBeautyProfileUpload, uploadBeautyProfileFile, validateBeautyProfileFile } from "@/lib/beauty-profile/beauty-profile.client";
import { StyleFlowHeader } from "./style-flow-header";

const focusOptions: Array<{ value: ClothingFocus; title: string; detail: string }> = [
  { value: "upper", title: "Upper half", detail: "Tops, shirts, blouses and jackets" },
  { value: "lower", title: "Lower half", detail: "Trousers, skirts and coordinated bottoms" },
  { value: "full", title: "Full body", detail: "Dresses, suits and complete outfits" },
];
const occasions = ["wedding", "work", "evening", "casual", "formal"] as const;

export function ClothingFlowClient() {
  const router = useRouter();
  const [flow, setFlow] = useState<StyleFlowState | null | undefined>(undefined);
  const [bodyFile, setBodyFile] = useState<File | null>(null);
  const [applying, setApplying] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setFlow(readStyleFlow()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (flow === undefined) return <div className="grid min-h-[60vh] place-items-center"><LoaderCircle className="animate-spin text-[var(--burgundy)]" /></div>;
  if (!flow) return <section className="grid min-h-[60vh] place-items-center text-center"><div><h1 className="font-[Georgia,serif] text-3xl text-[var(--burgundy)]">Your styling profile is missing</h1><p className="mt-3 text-sm text-[var(--muted-ink)]">Create your Beauty Palette to begin clothing selection.</p><button type="button" onClick={() => router.replace("/dashboard")} className="button-dark mt-5">Create palette <ArrowRight size={14} /></button></div></section>;

  const selectFocus = (value: ClothingFocus) => {
    updateStyleFlow({ clothingFocus: value });
    setFlow({ ...flow, clothingFocus: value });
  };

  const bodyPreview = async (file: File) => {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => { const url = URL.createObjectURL(file); const next = new Image(); next.onload = () => { URL.revokeObjectURL(url); resolve(next); }; next.onerror = () => { URL.revokeObjectURL(url); reject(new Error("We could not read that body photo.")); }; next.src = url; });
    const scale = Math.min(1, 900 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas"); canvas.width = Math.round(image.naturalWidth * scale); canvas.height = Math.round(image.naturalHeight * scale); canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  };

  const chooseBody = async (file: File | undefined) => {
    if (!file) return;
    const error = await validateBeautyProfileFile(file);
    if (error) { toast.error(error); return; }
    setBodyFile(file);
    try { const dataUrl = await bodyPreview(file); updateStyleFlow({ bodyDataUrl: dataUrl }); setFlow((current) => current ? { ...current, bodyDataUrl: dataUrl } : current); } catch (error) { toast.error(error instanceof Error ? error.message : "We could not prepare that image."); }
  };

  const useSampleBody = async () => {
    const presentation = flow.presentation === "male" ? "masculine" : "feminine";
    try {
      const response = await fetch(`/catalog/sample-body-${presentation}.jpg`);
      if (!response.ok) throw new Error("The demo photo could not be loaded.");
      const blob = await response.blob();
      await chooseBody(new File([blob], `perfection-${presentation}-demo.jpg`, { type: "image/jpeg" }));
      toast.success("Demo full-body photo added.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The demo photo could not be loaded.");
    }
  };

  const applyClothing = async () => {
    if (!flow.clothingFocus || !flow.clothingItemIndex || !flow.presentation || !flow.occasion || !bodyFile || applying) return;
    const controller = new AbortController(); setApplying(true); setAttempt(0);
    try {
      const reservation = await reserveBeautyProfileUpload(bodyFile); await uploadBeautyProfileFile(bodyFile, reservation); const category = `${flow.clothingFocus}_body` as "upper_body" | "lower_body" | "full_body";
      updateStyleFlow({ bodyFileId: reservation.fileId }); setFlow({ ...flow, bodyFileId: reservation.fileId });
      const task = await startCoordinatedLook({ feature: "clothing", sourceFileId: reservation.fileId, garmentCategory: category, itemIndex: flow.clothingItemIndex }, controller.signal);
      const resultUrl = await pollCoordinatedLook("clothing", task, controller.signal, setAttempt); updateStyleFlow({ clothingResultUrl: resultUrl }); setFlow((current) => current ? { ...current, clothingResultUrl: resultUrl } : current);
    } catch (error) { if (!(error instanceof DOMException && error.name === "AbortError")) toast.error(error instanceof Error ? error.message : "Clothing try-on failed."); } finally { setApplying(false); }
  };

  return (
    <section>
      <StyleFlowHeader step="03" title="Choose what you want to style" description="We will use your palette to narrow clothing choices before the virtual try-on. Start with the part of the outfit that matters most today." />
      <div className="grid gap-6 lg:grid-cols-[minmax(17rem,0.7fr)_minmax(0,1.3fr)]">
        <div className="mx-auto w-full max-w-[22rem]">
          <div className="aspect-[4/5] overflow-hidden rounded-[8px] bg-[var(--surface-container-high)] bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${JSON.stringify(flow.clothingResultUrl ?? flow.bodyDataUrl ?? flow.makeupResultUrl ?? flow.portraitDataUrl).slice(1, -1)})` }} />
          <p className="mt-3 text-xs leading-5 text-[var(--muted-ink)]">{flow.makeupPreference === "include" ? "Your selected makeup result carries into this step." : "Makeup was skipped; styling begins with your original portrait."}</p>
        </div>
        <div>
          <p className="eyebrow"><Shirt size={13} /> Clothing focus</p>
          <div className="mt-4 flex flex-wrap gap-2">{([['female','Feminine'],['male','Masculine']] as const).map(([value,label]) => <button type="button" key={value} onClick={() => { updateStyleFlow({ presentation: value, clothingItemIndex: null }); setFlow({ ...flow, presentation: value, clothingItemIndex: null }); }} className={flow.presentation === value ? "button-dark" : "button-outline"}>{label}</button>)}</div>
          <div className="mt-3 flex flex-wrap gap-2">{occasions.map((occasion) => <button type="button" key={occasion} onClick={() => { updateStyleFlow({ occasion }); setFlow({ ...flow, occasion }); }} className={`rounded-[6px] border px-3 py-2 text-[10px] uppercase ${flow.occasion === occasion ? "border-[var(--burgundy)] bg-[var(--burgundy)] text-white" : "border-[var(--line)]"}`}>{occasion}</button>)}</div>
          <label className="mt-4 flex min-h-14 cursor-pointer items-center gap-3 rounded-[8px] border border-dashed border-[var(--outline-variant)] bg-[var(--paper)] p-3 text-xs text-[var(--muted-ink)] hover:border-[var(--burgundy)]"><Upload size={17} className="shrink-0" /><span className="flex-1"><strong className="block text-[var(--ink)]">{bodyFile ? "Body photo ready" : "Upload a full-body photo"}</strong><span className="mt-0.5 block truncate">{bodyFile?.name ?? "JPEG or PNG, up to 10 MB"}</span></span><input type="file" accept="image/jpeg,image/png" className="sr-only" onChange={(event) => void chooseBody(event.target.files?.[0])} /></label>
          <div className="mt-2 flex flex-col gap-3 border-l-2 border-[var(--blush)] pl-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[11px] leading-5 text-[var(--muted-ink)]">
              <p className="font-semibold text-[var(--ink)]">For a successful clothing try-on</p>
              <p>Show one person from head to feet, standing straight and facing forward. Keep arms away from the outfit and use an image at least 480 px on its shortest side.</p>
            </div>
            <button type="button" onClick={() => void useSampleBody()} className="button-outline shrink-0"><FileImage size={14} /> Use demo photo</button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {focusOptions.map((option) => {
              const selected = flow.clothingFocus === option.value;
              return <button key={option.value} type="button" onClick={() => selectFocus(option.value)} className={`relative min-h-32 rounded-[8px] border p-4 text-left transition-colors ${selected ? "border-[var(--burgundy)] bg-[var(--surface-container-low)]" : "border-[var(--line)] bg-[var(--paper)] hover:border-[var(--taupe)]"}`}><strong className="text-sm text-[var(--ink)]">{option.title}</strong><span className="mt-2 block text-xs leading-5 text-[var(--muted-ink)]">{option.detail}</span>{selected && <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-[var(--burgundy)] text-white"><Check size={13} /></span>}</button>;
            })}
          </div>
          <p className="eyebrow mt-7">Palette colors</p>
          <div className="mt-3 flex flex-wrap gap-3">{flow.profile.palette.clothingColors.map((color) => <div key={color.name} className="w-20"><div className="h-14 rounded-[6px] border border-black/10" style={{ backgroundColor: color.hex }} /><p className="mt-1.5 text-[10px] text-[var(--muted-ink)]">{color.name}</p></div>)}</div>
          {flow.clothingFocus && flow.presentation && <><p className="eyebrow mt-7">MVP catalog</p><div className="mt-3 grid grid-cols-5 gap-2">{Array.from({ length: 10 }, (_, index) => index + (flow.presentation === "male" ? 11 : 1)).map((itemIndex) => <button type="button" key={itemIndex} onClick={() => { updateStyleFlow({ clothingItemIndex: itemIndex }); setFlow({ ...flow, clothingItemIndex: itemIndex }); }} className={`relative aspect-square overflow-hidden rounded-[6px] border bg-white ${flow.clothingItemIndex === itemIndex ? "border-[var(--burgundy)]" : "border-[var(--line)]"}`}><span className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(/catalog/outfit-${flow.clothingFocus}-${String(itemIndex).padStart(2, "0")}.jpg)` }} /></button>)}</div></>}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-5"><span className="flex items-center gap-2 text-xs text-[var(--muted-ink)]">{bodyFile ? <FileImage size={14} /> : "A full-body image is required for this step."}{applying && ` Applying · status ${attempt}`}</span><button type="button" onClick={() => void applyClothing()} disabled={!flow.clothingFocus || !flow.clothingItemIndex || !flow.presentation || !flow.occasion || !bodyFile || applying} className="button-dark disabled:cursor-not-allowed disabled:opacity-40">{applying ? "Applying clothing" : "Find clothing"} <ArrowRight size={14} /></button></div>
      {flow.clothingResultUrl && <div className="mt-5 flex justify-end"><button type="button" onClick={() => router.push("/jewelry")} className="button-dark">Continue to jewelry <ArrowRight size={14} /></button></div>}
    </section>
  );
}
