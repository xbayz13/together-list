"use client";

import { useEffect, useRef } from "react";

type BirthdayConfettiProps = {
  intensity: "full" | "light";
};

export default function BirthdayConfetti({ intensity }: BirthdayConfettiProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    const timers: number[] = [];
    const rafs: number[] = [];

    const cleanup = () => {
      timers.forEach(clearTimeout);
      rafs.forEach(cancelAnimationFrame);
      // Remove canvas elements created by canvas-confetti
      document.querySelectorAll("canvas").forEach((c) => c.remove());
    };

    (async () => {
      const confetti = (await import("canvas-confetti")).default;
      const colors = ["#A8D8EA", "#F9E79F", "#A9DFBF", "#FADBD8", "#D7BDE2"];

      const shoot = (delay: number) => {
        const t = window.setTimeout(() => {
          // Bottom-left → center
          confetti({ particleCount: 25, angle: 45, spread: 55, startVelocity: 45, ticks: 80, origin: { x: 0, y: 1 }, colors, shapes: ["circle", "square"], scalar: 1.1 });
          // Bottom-right → center
          confetti({ particleCount: 25, angle: 135, spread: 55, startVelocity: 45, ticks: 80, origin: { x: 1, y: 1 }, colors, shapes: ["circle", "square"], scalar: 1.1 });
          // Top-left → center
          confetti({ particleCount: 25, angle: -45, spread: 55, startVelocity: 45, ticks: 80, origin: { x: 0, y: 0 }, colors, shapes: ["circle", "square"], scalar: 1.1 });
          // Top-right → center
          confetti({ particleCount: 25, angle: -135, spread: 55, startVelocity: 45, ticks: 80, origin: { x: 1, y: 0 }, colors, shapes: ["circle", "square"], scalar: 1.1 });
        }, delay);
        timers.push(t);
      };

      if (intensity === "full") {
        // 3 rounds of corner bursts
        shoot(0);
        shoot(250);
        shoot(500);

        // Rain: continuous loop until unmount
        const rainFrame = () => {
          confetti({
            particleCount: 3,
            startVelocity: 0,
            ticks: 300,
            origin: { x: Math.random(), y: -0.1 },
            colors,
            shapes: ["circle", "square"],
            gravity: 0.3 + Math.random() * 0.2,
            scalar: 0.6 + Math.random() * 0.5,
            drift: (Math.random() - 0.5) * 0.5,
          });
          const id = requestAnimationFrame(rainFrame);
          rafs.push(id);
        };
        const rainT = window.setTimeout(rainFrame, 800);
        timers.push(rainT);
      } else {
        // Light: continuous rain
        const rainFrame = () => {
          confetti({
            particleCount: 2,
            startVelocity: 0,
            ticks: 250,
            origin: { x: Math.random(), y: -0.1 },
            colors: ["#A8D8EA", "#F9E79F"],
            shapes: ["circle"],
            gravity: 0.3 + Math.random() * 0.2,
            scalar: 0.5 + Math.random() * 0.4,
            drift: (Math.random() - 0.5) * 0.4,
          });
          const id = requestAnimationFrame(rainFrame);
          rafs.push(id);
        };
        rainFrame();
      }
    })();

    return cleanup;
  }, [intensity]);

  return null;
}
