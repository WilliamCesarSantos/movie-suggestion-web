import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  error?: string;
  hint?: ReactNode;
  id?: string;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, id, className, ...inputProps },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-neutral-200"
      >
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={[
          "w-full rounded-lg border bg-neutral-900/60 px-3 py-2 text-base text-white",
          "placeholder:text-neutral-500",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500",
          "transition-colors",
          error ? "border-red-500" : "border-neutral-700",
          "read-only:cursor-not-allowed read-only:opacity-80",
          className ?? "",
        ].join(" ")}
        {...inputProps}
      />
      {hint && !error ? (
        <p id={hintId} className="text-xs text-neutral-400">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
});
