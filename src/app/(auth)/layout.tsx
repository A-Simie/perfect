import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--canvas)] px-4 py-12">
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-2.5 font-[Georgia,serif] text-[0.93rem] tracking-[0.03em]"
      >
        <span className="inline-flex h-[1.65rem] w-[1.65rem] items-center justify-center rounded-full border border-[var(--burgundy)] font-[Georgia,serif] text-xs text-[var(--burgundy)]">
          P
        </span>
        <span>Perfection</span>
      </Link>
      <div className="w-full max-w-[26rem]">
        {children}
      </div>
      <p className="mt-10 text-center font-[Georgia,serif] text-xs italic text-[var(--taupe)]">
        Your beauty, perfected.
      </p>
    </div>
  );
}
