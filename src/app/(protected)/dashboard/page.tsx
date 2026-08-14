import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogOut, Camera, Palette, Sparkles, Calendar, ArrowRight } from "lucide-react";
import { logout } from "@/app/actions/auth";
import Link from "next/link";

const steps = [
  {
    number: "01",
    icon: Camera,
    title: "Upload your selfie",
    description:
      "We start by reading your features — skin tone, undertone, face shape, and more. One clear photo is all it takes.",
    status: "ready" as const,
  },
  {
    number: "02",
    icon: Palette,
    title: "Set your style preferences",
    description:
      "Tell us what you love — colors, aesthetics, and comfort. We learn what feels like you.",
    status: "locked" as const,
  },
  {
    number: "03",
    icon: Calendar,
    title: "Choose your occasion",
    description:
      "Wedding, date night, or Tuesday morning — every look is built around where you're going.",
    status: "locked" as const,
  },
  {
    number: "04",
    icon: Sparkles,
    title: "Get your look",
    description:
      "Hair, color, silhouette, accessories — one complete, considered look, shaped around you.",
    status: "locked" as const,
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const fullName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "there";
  const firstName = fullName.split(" ")[0];

  return (
    <div className="min-h-screen w-full bg-[var(--canvas)]">
      <header className="flex w-full items-center justify-between px-6 py-6 sm:px-12 md:px-16 lg:px-20 xl:px-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 font-[Georgia,serif] text-[0.93rem] tracking-[0.03em]"
        >
          <span className="inline-flex h-[1.65rem] w-[1.65rem] items-center justify-center rounded-full border border-[var(--burgundy)] font-[Georgia,serif] text-xs text-[var(--burgundy)]">
            P
          </span>
          <span>Perfection</span>
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.05em] text-[var(--muted-ink)] transition-colors hover:text-[var(--burgundy)]"
          >
            <LogOut size={14} strokeWidth={1.8} />
            Sign out
          </button>
        </form>
      </header>

      <main className="w-full px-6 pb-20 sm:px-12 md:px-16 lg:px-20 xl:px-24">
        <section className="mb-14 pt-8">
          <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[var(--burgundy)]">
            <Sparkles size={13} />
            Welcome to Perfection
          </p>
          <h1 className="font-[Georgia,serif] text-4xl font-normal tracking-[-0.03em] text-[var(--burgundy)] sm:text-5xl lg:text-6xl">
            Hello, <em className="text-[var(--taupe)]">{firstName}.</em>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--muted-ink)] sm:text-base">
            Your personal styling journey starts here. Complete each step below
            to build your beauty profile and receive your first AI-curated look.
          </p>
        </section>

        <section className="w-full">
          <div className="mb-6 flex items-center justify-between border-b border-[var(--line)] pb-4">
            <h2 className="font-[Georgia,serif] text-lg text-[var(--ink)] sm:text-xl">
              Getting started
            </h2>
            <span className="text-xs uppercase tracking-[0.1em] text-[var(--taupe)]">
              0 / {steps.length} complete
            </span>
          </div>

          <div className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`group relative flex flex-col justify-between border bg-[var(--paper)] p-6 transition-all ${
                  step.status === "ready"
                    ? "border-[var(--burgundy)]/30 shadow-[0_0.5rem_2rem_rgba(85,19,27,0.06)] hover:-translate-y-0.5 hover:shadow-[0_1rem_3rem_rgba(85,19,27,0.1)]"
                    : "border-[var(--line)] opacity-60"
                }`}
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs tracking-[0.1em] text-[var(--taupe)]">
                      {step.number}
                    </span>
                    <step.icon
                      size={20}
                      strokeWidth={1.5}
                      className={
                        step.status === "ready"
                          ? "text-[var(--burgundy)]"
                          : "text-[var(--blush)]"
                      }
                    />
                  </div>
                  <h3 className="mb-2 font-[Georgia,serif] text-lg font-normal text-[var(--ink)]">
                    {step.title}
                  </h3>
                  <p className="mb-5 text-xs leading-relaxed text-[var(--muted-ink)]">
                    {step.description}
                  </p>
                </div>
                {step.status === "ready" ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.08em] text-[var(--burgundy)] transition-all group-hover:gap-2.5">
                    Begin <ArrowRight size={13} strokeWidth={2} />
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.08em] text-[var(--blush)]">
                    Complete previous step
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 w-full border border-[var(--line)] bg-[var(--paper)] p-8 sm:p-10">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--burgundy)]/10">
              <Camera size={20} className="text-[var(--burgundy)]" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 font-[Georgia,serif] text-lg text-[var(--ink)]">
                Ready to begin?
              </h3>
              <p className="mb-4 text-sm text-[var(--muted-ink)] sm:text-base">
                Upload a clear selfie in natural lighting. Our AI will analyze
                your features and build a beauty profile unique to you — skin
                tone, undertone, face shape, and more.
              </p>
              <button className="inline-flex items-center gap-2 bg-[var(--burgundy)] px-6 py-3.5 text-xs font-medium uppercase tracking-[0.08em] text-[#fff9f7] shadow-[0_1rem_2rem_rgba(85,19,27,0.12)] transition-all hover:bg-[#3c0b12] hover:shadow-[0_1.2rem_2.4rem_rgba(85,19,27,0.2)] hover:-translate-y-0.5">
                Upload selfie
                <ArrowRight size={14} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
