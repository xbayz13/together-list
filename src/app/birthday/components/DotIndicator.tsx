"use client";

type DotIndicatorProps = {
  total: number;
  current: number;
};

export default function DotIndicator({ total, current }: DotIndicatorProps) {
  return (
    <div className="dot-indicator">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`dot ${
            i < current ? "passed" : i === current ? "current" : "future"
          }`}
        />
      ))}
    </div>
  );
}
