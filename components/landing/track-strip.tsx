"use client";

import { Check, Lock } from "lucide-react";
import { useInView } from "@/components/shared/reveal";

export function TrackStrip({
  open,
  total = 8,
  onDark = false,
}: {
  open: number;
  total?: number;
  onDark?: boolean;
}) {
  const { ref, shown } = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className="flex items-center gap-2" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => {
        const isOpen = i < open;
        const colour = isOpen
          ? onDark
            ? "bg-highlighter"
            : "bg-pass"
          : onDark
            ? "border border-primary-foreground/30"
            : "border border-border bg-secondary";

        return (
          <span
            key={i}
            style={{ transitionDelay: `${i * 70}ms` }}
            className={`flex size-7 items-center justify-center rounded-full transition-[transform,opacity] duration-300 ${
              shown ? "scale-100 opacity-100" : "scale-50 opacity-0"
            } ${colour}`}
          >
            {isOpen ? (
              <Check
                className={`size-3.5 ${onDark ? "text-foreground" : "text-white"}`}
              />
            ) : (
              <Lock
                className={`size-3 ${
                  onDark ? "text-primary-foreground/50" : "text-muted-foreground"
                }`}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}