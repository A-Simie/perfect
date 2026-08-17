"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, LoaderCircle, Sparkles, WandSparkles } from "lucide-react";
import { toast } from "react-toastify";
import { fetchLookTemplates, pollLookTryOn, startLookTryOn } from "@/lib/look-vto/look-vto.client";
import type { LookTemplate } from "@/lib/look-vto/look-vto.types";

type Props = {
  sourceFileId: string;
  portraitUrl: string | null;
  paletteTags: string[];
};

const paletteKeywords: Record<string, string[]> = {
  warm: ["peach", "coral", "bronze", "gold", "sun", "rosy"],
  cool: ["berry", "plum", "mauve", "pink", "violet"],
  neutral: ["nude", "natural", "soft", "classic", "daily"],
  soft: ["soft", "light", "fresh", "natural", "daily"],
  deep: ["bold", "smoky", "glam", "deep", "night"],
};

function recommendTemplate(templates: LookTemplate[], paletteTags: string[]) {
  const keywords = paletteTags.flatMap((tag) => paletteKeywords[tag] ?? []);
  return [...templates].sort((first, second) => {
    const score = (template: LookTemplate) => {
      const text = `${template.title} ${template.categoryName}`.toLowerCase();
      return keywords.reduce((total, keyword) => total + (text.includes(keyword) ? 2 : 0), 0) + (text.includes("daily") ? 1 : 0);
    };
    return score(second) - score(first) || first.id.localeCompare(second.id);
  })[0] ?? null;
}

export function LookVtoClient({ sourceFileId, portraitUrl, paletteTags }: Props) {
  const abortRef = useRef<AbortController | null>(null);
  const [templates, setTemplates] = useState<LookTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [applying, setApplying] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    void fetchLookTemplates(controller.signal)
      .then(({ templates: nextTemplates }) => {
        setTemplates(nextTemplates);
        setSelectedId(recommendTemplate(nextTemplates, paletteTags)?.id ?? null);
      })
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          toast.error(error instanceof Error ? error.message : "Makeup looks could not be loaded.");
        }
      })
      .finally(() => setLoadingTemplates(false));
    return () => abortRef.current?.abort();
  }, [paletteTags]);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedId) ?? null,
    [selectedId, templates]
  );

  const applyLook = async () => {
    if (!selectedTemplate || applying) return;
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setApplying(true);
    setResultUrl(null);
    setAttempt(0);
    try {
      const task = await startLookTryOn(sourceFileId, selectedTemplate.id, controller.signal);
      setResultUrl(await pollLookTryOn(task.taskId, task.pollToken, controller.signal, setAttempt));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error(error instanceof Error ? error.message : "The makeup look could not be applied.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="border-t border-[var(--line)] pt-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow"><WandSparkles size={13} /> Makeup try-on / step 02</p>
          <h2 className="mt-2 font-[Georgia,serif] text-2xl font-normal text-[var(--burgundy)]">See your palette on your face</h2>
          <p className="mt-1 text-xs leading-5 text-[var(--muted-ink)]">Choose a provider look, then Perfection applies it to the portrait you already used.</p>
        </div>
        {selectedTemplate && <button type="button" onClick={() => void applyLook()} disabled={applying} className="button-dark shrink-0 disabled:cursor-not-allowed disabled:opacity-50">
          {applying ? <LoaderCircle size={15} className="animate-spin" /> : <Sparkles size={15} />}
          {applying ? "Applying look" : "Try this look"}
        </button>}
      </div>

      {loadingTemplates ? (
        <div className="mt-4 flex h-28 items-center justify-center gap-2 text-xs text-[var(--muted-ink)]"><LoaderCircle size={16} className="animate-spin" /> Loading makeup looks</div>
      ) : templates.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {templates.slice(0, 10).map((template) => {
            const selected = template.id === selectedId;
            return <button key={template.id} type="button" onClick={() => { setSelectedId(template.id); setResultUrl(null); }} className={`relative overflow-hidden rounded-[8px] border bg-[var(--paper)] text-left transition-colors ${selected ? "border-[var(--burgundy)]" : "border-[var(--line)] hover:border-[var(--taupe)]"}`}>
              <span role="img" aria-label={`${template.title} makeup preview`} className="block aspect-square bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(template.thumbnailUrl).slice(1, -1)})` }} />
              <span className="block min-w-0 p-2.5">
                <strong className="block truncate text-[11px] text-[var(--ink)]">{template.title}</strong>
                <span className="mt-0.5 block truncate text-[9px] uppercase tracking-[0.08em] text-[var(--muted-ink)]">{template.categoryName}</span>
              </span>
              {selected && <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-[var(--burgundy)] text-white"><Check size={13} /></span>}
            </button>;
          })}
        </div>
      ) : (
        <p className="mt-4 text-xs text-[var(--muted-ink)]">No makeup templates are available for this account.</p>
      )}

      {(applying || resultUrl) && <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted-ink)]">Original</p>
          <div role="img" aria-label="Original portrait" className="aspect-square overflow-hidden rounded-[8px] bg-contain bg-center bg-no-repeat bg-[var(--surface-container-high)]" style={portraitUrl ? { backgroundImage: `url(${JSON.stringify(portraitUrl).slice(1, -1)})` } : undefined} />
        </div>
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted-ink)]">{selectedTemplate?.title ?? "Applied look"}</p>
          <div className="relative aspect-square overflow-hidden rounded-[8px] bg-[var(--surface-container-high)]">
            {resultUrl ? <div role="img" aria-label="Makeup try-on result" className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${JSON.stringify(resultUrl).slice(1, -1)})` }} /> : <div className="absolute inset-0 grid place-items-center text-center text-xs text-[var(--muted-ink)]"><span><LoaderCircle size={22} className="mx-auto mb-2 animate-spin text-[var(--burgundy)]" />Applying your look<br />Status check {attempt}</span></div>}
          </div>
        </div>
      </div>}
    </div>
  );
}
