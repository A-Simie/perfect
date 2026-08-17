"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { LookVtoClient } from "@/components/look-vto/look-vto-client";
import { readStyleFlow, updateStyleFlow, type StyleFlowState } from "@/lib/style-flow/style-flow.storage";
import { StyleFlowHeader } from "./style-flow-header";

export function MakeupFlowClient() {
  const router = useRouter();
  const [flow, setFlow] = useState<StyleFlowState | null | undefined>(undefined);

  useEffect(() => {
    const timer = window.setTimeout(() => setFlow(readStyleFlow()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (flow === undefined) {
    return <div className="grid min-h-[60vh] place-items-center text-sm text-[var(--muted-ink)]"><LoaderCircle className="animate-spin" /></div>;
  }

  if (!flow) {
    return (
      <section className="grid min-h-[60vh] place-items-center text-center">
        <div><h1 className="font-[Georgia,serif] text-3xl text-[var(--burgundy)]">Start with your Beauty Palette</h1><p className="mt-3 text-sm text-[var(--muted-ink)]">Your portrait and colors are needed before makeup try-on.</p><button type="button" onClick={() => router.replace("/dashboard")} className="button-dark mt-5">Create palette <ArrowRight size={14} /></button></div>
      </section>
    );
  }

  const resultUrl = flow.makeupResultUrl;

  return (
    <section>
      <StyleFlowHeader step="02" title="Try your makeup direction" description="Choose a look coordinated with your detected palette. Your original portrait stays consistent across the styling journey." />
      <LookVtoClient
        sourceFileId={flow.sourceFileId}
        portraitUrl={flow.portraitDataUrl}
        paletteTags={flow.profile.palette.paletteTags}
        onResult={(url) => {
          updateStyleFlow({ makeupResultUrl: url });
          setFlow((current) => current ? { ...current, makeupResultUrl: url } : current);
        }}
      />
      <div className="mt-6 flex justify-end border-t border-[var(--line)] pt-5">
        <button type="button" disabled={!resultUrl} onClick={() => router.push("/clothing")} className="button-dark disabled:cursor-not-allowed disabled:opacity-40">Continue to clothing <ArrowRight size={14} /></button>
      </div>
    </section>
  );
}
