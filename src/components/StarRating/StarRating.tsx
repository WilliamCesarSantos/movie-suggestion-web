import { useRef } from "react";

type StarRatingProps = {
  value: number | null;
  onChange: (value: number) => void;
  label?: string;
};

const STARS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function StarRating({ value, onChange, label = "Nota do filme" }: StarRatingProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusStar = (n: number) => {
    onChange(n);
    refs.current[n - 1]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, n: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      focusStar(Math.min(10, n + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      focusStar(Math.max(1, n - 1));
    }
  };

  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap justify-center gap-1">
      {STARS.map((n) => {
        const checked = value === n;
        const filled = value !== null && n <= value;
        return (
          <button
            key={n}
            ref={(el) => {
              refs.current[n - 1] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"}`}
            tabIndex={checked || (value === null && n === 1) ? 0 : -1}
            onClick={() => onChange(n)}
            onKeyDown={(e) => onKeyDown(e, n)}
            className={`text-3xl leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              filled ? "text-yellow-400" : "text-neutral-600"
            }`}
          >
            <span aria-hidden="true">★</span>
          </button>
        );
      })}
    </div>
  );
}
