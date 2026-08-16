import { LogOut, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { BeautyProfileClient } from "@/components/beauty-profile/beauty-profile-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "there";
  const firstName = fullName.split(" ")[0];

  return (
    <div className="min-h-screen w-full bg-[var(--canvas)]">
      <header className="border-b border-[var(--line)] bg-[rgba(255,251,248,0.86)] px-5 py-5 backdrop-blur-md sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5 font-[Georgia,serif] text-[0.93rem] tracking-[0.03em] text-[var(--ink)]">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--burgundy)] text-xs text-[var(--burgundy)]">P</span>
            <span>Perfection</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/" className="hidden items-center gap-1 text-xs text-[var(--muted-ink)] transition-colors hover:text-[var(--burgundy)] sm:inline-flex">About Perfection <ArrowUpRight size={13} /></Link>
            <form action={logout}>
              <button type="submit" className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.08em] text-[var(--muted-ink)] transition-colors hover:text-[var(--burgundy)]"><LogOut size={14} strokeWidth={1.8} /> Sign out</button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[90rem] px-5 pb-10 pt-6 sm:px-10 sm:pt-8 lg:px-16">
        <BeautyProfileClient firstName={firstName} />
      </main>
    </div>
  );
}
