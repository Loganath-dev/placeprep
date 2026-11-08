"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, shown };
}

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, shown } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      style={{ "--rise-delay": `${delay}ms` } as CSSProperties}
      className={`${shown ? "animate-rise" : "opacity-0"} ${className}`}
    >
      {children}
    </div>
  );
}

// A list whose items rise in one after another.
export function RevealList({
  items,
  className = "",
  itemClassName = "",
  step = 90,
  delay = 0,
}: {
  items: ReactNode[];
  className?: string;
  itemClassName?: string;
  step?: number;
  delay?: number;
}) {
  const { ref, shown } = useInView<HTMLUListElement>();

  return (
    <ul ref={ref} className={className}>
      {items.map((item, index) => (
        <li
          key={index}
          style={
            { "--rise-delay": `${delay + index * step}ms` } as CSSProperties
          }
          className={`${shown ? "animate-rise" : "opacity-0"} ${itemClassName}`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}