import { ReactNode, Suspense, useEffect, useRef, useState } from "react";

interface LazySectionProps {
  children: ReactNode;
  /** Minimum height placeholder while off-screen (avoids layout shift). */
  minHeight?: string;
}

export function LazySection({ children, minHeight = "4rem" }: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={visible ? undefined : { minHeight }}>
      {visible ? (
        <Suspense
          fallback={
            <p className="text-sm text-slate-500" aria-live="polite">
              Loading section…
            </p>
          }
        >
          {children}
        </Suspense>
      ) : null}
    </div>
  );
}
