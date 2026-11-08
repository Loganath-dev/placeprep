"use client";

import type { CSSProperties, ReactNode } from "react";
import { useInView } from "@/components/shared/reveal";

export function Marker({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const { ref, shown } = useInView<HTMLSpanElement>();

  return (
    <span
      ref={ref}
      data-on={shown}
      style={{ "--marker-delay": `${delay}ms` } as CSSProperties}
      className="marker"
    >
      {children}
    </span>
  );
}