import { Brush, Sparkles } from "lucide-react";

export function BeautyProfileProcessing({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center overflow-hidden bg-[rgba(33,21,27,0.62)] text-white backdrop-blur-md">
      <div className="powder-cloud" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => <span key={index} />)}
      </div>
      <div className="relative z-10 text-center">
        <div className="beauty-brush mx-auto grid h-20 w-20 place-items-center rounded-full border border-white/35 bg-white/10">
          <Brush size={34} strokeWidth={1.35} />
        </div>
        <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
          <Sparkles size={15} /> {label}
        </div>
        <p className="mt-2 text-xs text-white/75">Composing your personalized color story</p>
      </div>
    </div>
  );
}
