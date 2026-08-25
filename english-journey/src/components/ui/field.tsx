"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

const CONTROL = [
  "w-full rounded-xl border border-border-strong bg-surface-2/70 text-[15px] text-text backdrop-blur",
  "placeholder:text-dim shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)]",
  "transition-[border-color,box-shadow,background] duration-200",
  "focus:border-purple/60 focus:bg-surface-2 focus:outline-none",
  "focus-visible:ring-4 focus-visible:ring-purple/20",
].join(" ");

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(CONTROL, "h-12 px-3.5", className)} {...props} />;
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(CONTROL, "p-3.5 leading-relaxed", className)} {...props} />;
  },
);

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: (props: { id: string }) => React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {children({ id })}
      {error ? (
        <p className="text-sm text-on-danger">{error}</p>
      ) : hint ? (
        <p className="text-sm text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
