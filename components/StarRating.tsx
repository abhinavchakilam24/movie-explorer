'use client';

import { useMemo, useRef, useState } from 'react';

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function roundToStep(value: number, step: number) {
  const inv = 1 / step;
  return Math.round(value * inv) / inv;
}

function getStarFill(rating: number, idx: number) {
  const start = idx;
  const end = idx + 1;
  if (rating <= start) return 0;
  if (rating >= end) return 1;
  return rating - start;
}

export default function StarRating({
  value,
  onChange,
  step = 0.5,
  size = 18,
}: {
  value: number;
  onChange: (next: number) => void;
  step?: number;
  size?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayed = hoverValue ?? value;

  const ariaText = useMemo(() => {
    const v = roundToStep(clamp(displayed, 0, 5), step);
    return `${v} out of 5`;
  }, [displayed, step]);

  function valueFromPointer(clientX: number) {
    const el = containerRef.current;
    if (!el) return value;
    const rect = el.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    const pct = rect.width > 0 ? x / rect.width : 0;
    const raw = pct * 5;
    return roundToStep(clamp(raw, 0, 5), step);
  }

  return (
    <div
      className="inline-flex select-none items-center gap-1"
      ref={containerRef}
      role="slider"
      aria-label="Rating"
      aria-valuemin={0}
      aria-valuemax={5}
      aria-valuenow={displayed}
      aria-valuetext={ariaText}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          onChange(roundToStep(clamp(value + step, 0, 5), step));
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          onChange(roundToStep(clamp(value - step, 0, 5), step));
        } else if (e.key === 'Home') {
          e.preventDefault();
          onChange(0);
        } else if (e.key === 'End') {
          e.preventDefault();
          onChange(5);
        }
      }}
      onPointerMove={(e) => {
        setHoverValue(valueFromPointer(e.clientX));
      }}
      onPointerLeave={() => setHoverValue(null)}
      onPointerDown={(e) => {
        onChange(valueFromPointer(e.clientX));
      }}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = getStarFill(displayed, i);
        return (
          <div
            key={i}
            className="relative"
            style={{ width: size, height: size }}
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              className="absolute inset-0"
              style={{ width: size, height: size }}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"
                className="fill-zinc-700/50 stroke-zinc-400/50"
                strokeWidth="1.5"
              />
            </svg>
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <svg
                viewBox="0 0 24 24"
                className="absolute inset-0"
                style={{ width: size, height: size }}
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id={`star-grad-${i}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#67e8f9" />
                    <stop offset="100%" stopColor="#f0abfc" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"
                  fill={`url(#star-grad-${i})`}
                />
              </svg>
            </div>
          </div>
        );
      })}

      <div className="ml-2 text-xs text-zinc-300">{roundToStep(clamp(displayed, 0, 5), step).toFixed(1)}</div>
    </div>
  );
}
