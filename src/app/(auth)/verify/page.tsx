"use client";

import { useSearchParams } from "next/navigation";
import { useActionState, useRef, useCallback, useState, useEffect, Suspense } from "react";
import { toast } from "react-toastify";
import { verifyOtp, type AuthState } from "@/app/actions/auth";

function VerifyForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [state, action, pending] = useActionState<AuthState, FormData>(verifyOtp, null);
  const [otpCode, setOtpCode] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hiddenRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state?.error]);

  const updateCode = useCallback(() => {
    const val = inputRefs.current.map((el) => el?.value ?? "").join("");
    setOtpCode(val);
    if (hiddenRef.current) {
      hiddenRef.current.value = val;
    }
  }, []);

  const handleInput = useCallback(
    (index: number, value: string) => {
      const char = value.replace(/\D/g, "");
      if (inputRefs.current[index]) {
        inputRefs.current[index]!.value = char;
      }
      if (char.length === 1 && index < 7) {
        inputRefs.current[index + 1]?.focus();
      }
      updateCode();
    },
    [updateCode]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      setTimeout(updateCode, 0);
    },
    [updateCode]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 8);
      text.split("").forEach((char, i) => {
        if (inputRefs.current[i]) {
          inputRefs.current[i]!.value = char;
        }
      });
      inputRefs.current[Math.min(text.length, 7)]?.focus();
      updateCode();
    },
    [updateCode]
  );

  const isComplete = otpCode.length === 8;

  return (
    <div className="text-center">
      <h1 className="mb-1 font-[Georgia,serif] text-3xl font-normal tracking-[-0.03em] text-[var(--burgundy)]">
        Verify your email
      </h1>
      <p className="mb-8 text-sm text-[var(--muted-ink)]">
        We sent an 8-digit verification code to{" "}
        <span className="font-medium text-[var(--ink)]">{email || "your email"}</span>.
        <br />Enter it below to continue.
      </p>

      <form action={action} className="flex flex-col gap-6">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="token" ref={hiddenRef} value={otpCode} />

        <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
          {Array.from({ length: 8 }).map((_, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              aria-label={`Digit ${i + 1}`}
              className="h-12 w-9 rounded-[10px] border border-[var(--line)] bg-white/80 text-center font-mono text-lg font-medium text-[var(--ink)] outline-none transition-all focus:border-[var(--burgundy)] focus:ring-4 focus:ring-[var(--burgundy)]/8 sm:h-14 sm:w-11 sm:text-xl"
              onInput={(e) => handleInput(i, e.currentTarget.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
            />
          ))}
        </div>

        {state?.fieldErrors?.token && (
          <p className="text-center text-xs text-red-600">{state.fieldErrors.token[0]}</p>
        )}

        <button
          type="submit"
          disabled={pending || !isComplete}
          className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-[var(--burgundy)] px-5 py-3.5 text-xs font-medium uppercase tracking-[0.08em] text-[#fff9f7] shadow-[0_1rem_2rem_rgba(85,19,27,0.12)] transition-all hover:-translate-y-0.5 hover:bg-[#3c0b12] hover:shadow-[0_1.2rem_2.4rem_rgba(85,19,27,0.2)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {pending ? "Verifying…" : "Verify & continue"}
        </button>
      </form>

      <p className="mt-8 text-xs text-[var(--taupe)]">
        Didn&apos;t receive a code? Check your spam folder or try signing up again.
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--burgundy)] border-t-transparent" />
      </div>
    }>
      <VerifyForm />
    </Suspense>
  );
}
