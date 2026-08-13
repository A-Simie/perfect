"use client";

import Link from "next/link";
import { useActionState, useState, useEffect } from "react";
import { ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { signup, type AuthState } from "@/app/actions/auth";

export default function SignupPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(signup, null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state?.error]);

  return (
    <>
      <h1 className="mb-1 font-[Georgia,serif] text-3xl font-normal tracking-[-0.03em] text-[var(--burgundy)]">
        Create your account
      </h1>
      <p className="mb-8 text-sm text-[var(--muted-ink)]">
        Begin your personal styling journey.
      </p>

      <form action={action} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fullName" className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted-ink)]">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            autoComplete="name"
            className="border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--blush)] focus:border-[var(--burgundy)]"
            placeholder="Your full name"
          />
          {state?.fieldErrors?.fullName && (
            <p className="text-xs text-red-600">{state.fieldErrors.fullName[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted-ink)]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--blush)] focus:border-[var(--burgundy)]"
            placeholder="you@example.com"
          />
          {state?.fieldErrors?.email && (
            <p className="text-xs text-red-600">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted-ink)]">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              className="w-full border border-[var(--line)] bg-[var(--paper)] px-4 py-3 pr-11 text-sm text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--blush)] focus:border-[var(--burgundy)]"
              placeholder="8+ characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-ink)] transition-colors hover:text-[var(--burgundy)]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
            </button>
          </div>
          {state?.fieldErrors?.password && (
            <ul className="mt-1 flex flex-col gap-0.5">
              {state.fieldErrors.password.map((err) => (
                <li key={err} className="text-xs text-red-600">• {err}</li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 inline-flex items-center justify-center gap-2 bg-[var(--burgundy)] px-5 py-3.5 text-xs font-medium uppercase tracking-[0.08em] text-[#fff9f7] shadow-[0_1rem_2rem_rgba(85,19,27,0.12)] transition-all hover:bg-[#3c0b12] hover:shadow-[0_1.2rem_2.4rem_rgba(85,19,27,0.2)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {pending ? "Creating account…" : "Create account"}
          {!pending && <ArrowUpRight size={14} strokeWidth={1.8} />}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--muted-ink)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="border-b border-[var(--line)] text-[var(--burgundy)] transition-colors hover:border-[var(--burgundy)]"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
