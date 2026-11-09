import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  children: ReactNode;
  subtitle?: ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#0b0b0f] px-6 py-10">
      <section
        className={[
          "flex w-full max-w-sm flex-col gap-6",
          "rounded-2xl p-8",
          "sm:bg-[#17171d] sm:shadow-xl",
        ].join(" ")}
      >
        <header className="flex flex-col items-center gap-2 text-center">
          <p
            aria-label="Movie Suggest"
            className="text-2xl font-black tracking-tight text-[#e50914]"
          >
            MOVIE SUGGEST
          </p>
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          {subtitle ? (
            <p className="text-sm text-neutral-400">{subtitle}</p>
          ) : null}
        </header>
        {children}
      </section>
    </main>
  );
}
