import { useEffect, useRef, useState } from "react";

export const SIMULATION_DURATION_MS = 3000;

type PlayerModalProps = {
  title: string;
  onClose: () => void;
  onFinish: () => void;
};

export function PlayerModal({ title, onClose, onFinish }: PlayerModalProps) {
  const [progress, setProgress] = useState(0);
  const finishRef = useRef(onFinish);
  const closeRef = useRef(onClose);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    finishRef.current = onFinish;
    closeRef.current = onClose;
  }, [onFinish, onClose]);
  const reduceMotion =
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  useEffect(() => {
    if (reduceMotion) {
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const pct = Math.min(100, ((now - start) / SIMULATION_DURATION_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        finishRef.current();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    dialog?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeRef.current();
        return;
      }
      if (e.key !== "Tab" || !dialog) {
        return;
      }
      const focusable = dialog.querySelectorAll<HTMLElement>("button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])");
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialog)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (!dialog.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previouslyFocused && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Reproduzindo ${title}`}
        className="w-full max-w-lg rounded-2xl focus:outline-none bg-surface p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-neutral-400">Reproduzindo (simulação)</p>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/10"
        >
          <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={onFinish}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-[#c1070f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Pular para avaliar
          </button>
        </div>
      </div>
    </div>
  );
}
