import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-[#efe6de] lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden min-h-screen overflow-hidden lg:block">
        <Image src="/image/stylist.webp" alt="A considered personal style moment" fill preload sizes="55vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#211815]/75 via-transparent to-[#211815]/15" />
        <div className="absolute inset-x-0 bottom-0 z-10 p-12 text-white xl:p-16">
          <p className="eyebrow text-white/80">Your style, made personal</p>
          <h2 className="mt-5 max-w-xl font-[Georgia,serif] text-5xl leading-[1.02] tracking-[-0.04em] xl:text-6xl">Come back to a clearer point of view.</h2>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/75">A calm place to understand what works, build confidence, and get ready with intention.</p>
        </div>
      </section>

      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-14 xl:px-20">
        <Link href="/" aria-label="Perfection home" className="relative block h-12 w-52">
          <Image src="/image/perfection_logo_transparent.webp" alt="Perfection" fill sizes="208px" className="object-contain object-left" />
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[29rem] rounded-[10px] border border-white/70 bg-white/75 p-6 shadow-[0_1.5rem_5rem_rgba(67,45,35,0.10)] backdrop-blur-xl sm:p-10">{children}</div>
        </div>
        <p className="text-center font-[Georgia,serif] text-xs italic text-[var(--taupe)]">Your style, perfected.</p>
      </section>
    </main>
  );
}
