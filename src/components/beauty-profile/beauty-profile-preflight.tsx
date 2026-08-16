import { AlertTriangle, Check, CircleAlert, LoaderCircle } from "lucide-react";
import type { BeautyProfilePreflightResult } from "@/lib/beauty-profile/beauty-profile-preflight";

type Props = {
  result: BeautyProfilePreflightResult | null;
  checking?: boolean;
  compact?: boolean;
};

export function BeautyProfilePreflight({ result, checking = false, compact = false }: Props) {
  if (checking) {
    return (
      <div className="flex items-center gap-2 text-xs text-[var(--muted-ink)]" aria-live="polite">
        <LoaderCircle size={15} className="animate-spin text-[var(--sage-ink)]" />
        Checking photo quality
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className={compact ? "grid grid-cols-2 gap-x-3 gap-y-1.5" : "space-y-3"} aria-live="polite">
      {result.checks.map((check) => {
        const Icon = check.status === "pass" ? Check : check.status === "warn" ? AlertTriangle : CircleAlert;
        return (
          <div key={check.id} className={`flex gap-2.5 ${compact ? "text-[10px] leading-4" : "text-xs leading-5"}`}>
            <Icon
              size={15}
              className={`mt-0.5 shrink-0 ${check.status === "pass" ? "text-[var(--sage-ink)]" : check.status === "warn" ? "text-[#a46b22]" : "text-[#9b4035]"}`}
            />
            <span className="min-w-0">
              <strong className="font-semibold text-[var(--ink)]">{check.label}</strong>
              {!compact && <span className="ml-1 text-[var(--muted-ink)]">{check.detail}</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}
