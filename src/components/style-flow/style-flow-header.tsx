import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function StyleFlowHeader({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[var(--line)] pb-5 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow">Coordinated look / {step}</p>
        <h1 className="mt-2 font-[Georgia,serif] text-3xl font-normal tracking-[-0.04em] text-[var(--burgundy)] sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-ink)]">{description}</p>
      </div>
      <Link href="/dashboard" className="button-outline w-fit"><ArrowLeft size={14} /> Beauty Palette</Link>
    </div>
  );
}
