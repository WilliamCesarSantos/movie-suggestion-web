import type { ButtonHTMLAttributes, ReactNode } from "react";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  loadingLabel?: ReactNode;
  children: ReactNode;
};

export function PrimaryButton({
  isLoading = false,
  loadingLabel,
  children,
  disabled,
  className,
  type = "button",
  ...buttonProps
}: PrimaryButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={[
        "inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5",
        "bg-[#e50914] text-white text-sm font-semibold",
        "transition-colors hover:bg-[#c1070f]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#17171d]",
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#e50914]",
        className ?? "",
      ].join(" ")}
      {...buttonProps}
    >
      {isLoading ? (
        <>
          <span
            aria-hidden="true"
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          />
          <span>{loadingLabel ?? children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
