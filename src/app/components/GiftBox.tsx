"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import "../birthday/giftbox.css";

type GiftBoxProps = {
  onToast?: (message: string) => void;
};

type Phase = "idle" | "shake" | "scale" | "open" | "glow" | "done";

export default function GiftBox({ onToast }: GiftBoxProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [isAnimating, setIsAnimating] = useState(false);
  const timersRef = useRef<number[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      document.body.style.overflow = "";
    };
  }, []);

  // Date check
  const getDateInfo = useCallback(() => {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();
    const forceShow = process.env.NEXT_PUBLIC_GIFTBOX_FORCE_SHOW === "true";
    return {
      isBeforeSept1: !forceShow && (month < 8 || (month === 8 && day < 1)),
      isSept1: month === 8 && day === 1,
      isSept2Plus: forceShow || ((month === 8 && day >= 2) || month > 8),
      isSept4Plus: !forceShow && ((month === 8 && day >= 4) || month > 8),
    };
  }, []);

  // Show/hide based on date
  useEffect(() => {
    const { isBeforeSept1, isSept4Plus, isSept1 } = getDateInfo();
    if (!isBeforeSept1 && !isSept4Plus) {
      setVisible(true);
      if (isSept1) {
        setPhase("shake");
      }
    }
  }, [getDateInfo]);

  // Sound: rich pop (layered oscillators)
  const playPop = useCallback(() => {
    try {
      const ctx = new AudioContext();
      if (ctx.state === "suspended") ctx.resume();
      const t = ctx.currentTime;

      // Layer 1: low thump
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.setValueAtTime(150, t);
      osc1.frequency.exponentialRampToValueAtTime(50, t + 0.12);
      gain1.gain.setValueAtTime(0.4, t);
      gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      osc1.start(t);
      osc1.stop(t + 0.12);

      // Layer 2: high click
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(1200, t);
      osc2.frequency.exponentialRampToValueAtTime(600, t + 0.06);
      gain2.gain.setValueAtTime(0.25, t);
      gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
      osc2.start(t);
      osc2.stop(t + 0.06);

      // Layer 3: noise burst (using high-freq oscillator)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = "triangle";
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.frequency.setValueAtTime(2000, t);
      osc3.frequency.exponentialRampToValueAtTime(800, t + 0.04);
      gain3.gain.setValueAtTime(0.15, t);
      gain3.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
      osc3.start(t);
      osc3.stop(t + 0.04);
    } catch { /* silent */ }
  }, []);

  // Sound: cinematic whoosh (rising sweep + shimmer)
  const playWhoosh = useCallback(() => {
    try {
      const ctx = new AudioContext();
      if (ctx.state === "suspended") ctx.resume();
      const t = ctx.currentTime;

      // Layer 1: rising sweep
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sawtooth";
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.setValueAtTime(100, t);
      osc1.frequency.exponentialRampToValueAtTime(600, t + 0.3);
      gain1.gain.setValueAtTime(0.08, t);
      gain1.gain.linearRampToValueAtTime(0.12, t + 0.15);
      gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
      osc1.start(t);
      osc1.stop(t + 0.35);

      // Layer 2: shimmer (high sine)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(800, t + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(1600, t + 0.25);
      gain2.gain.setValueAtTime(0.0, t);
      gain2.gain.linearRampToValueAtTime(0.06, t + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      osc2.start(t);
      osc2.stop(t + 0.3);

      // Layer 3: sub rumble
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = "sine";
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.frequency.setValueAtTime(60, t);
      osc3.frequency.linearRampToValueAtTime(80, t + 0.3);
      gain3.gain.setValueAtTime(0.1, t);
      gain3.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
      osc3.start(t);
      osc3.stop(t + 0.35);
    } catch { /* silent */ }
  }, []);

  const schedule = useCallback((fn: () => void, delay: number) => {
    timersRef.current.push(window.setTimeout(fn, delay));
  }, []);

  const handleClick = useCallback(async () => {
    if (isAnimating) return;

    const { isSept1, isSept2Plus } = getDateInfo();

    if (isSept1) {
      onToast?.("Sabar ya! 🤫");
      return;
    }

    if (!isSept2Plus) return;

    setIsAnimating(true);

    // Pre-fetch birthday data
    try {
      const { getBirthdaySlides, getBirthdayConfig } = await import("../birthday/actions/birthday");
      await Promise.all([getBirthdaySlides(), getBirthdayConfig()]);
    } catch (err) {
      console.error("Prefetch failed:", err);
    }

    // Lock scroll
    document.body.style.overflow = "hidden";

    // Phase 1: Shake + Pop (0-700ms)
    setPhase("shake");
    playPop();

    // Phase 2: Scale up + Whoosh (700ms)
    schedule(() => {
      setPhase("scale");
      playWhoosh();
    }, 700);

    // Phase 3: Open lid (1100ms)
    schedule(() => setPhase("open"), 1100);

    // Phase 4: Glow (1600ms)
    schedule(() => setPhase("glow"), 1600);

    // Phase 5: Navigate (2400ms)
    schedule(() => {
      document.body.style.overflow = "";
      router.replace("/birthday");
    }, 2400);
  }, [isAnimating, getDateInfo, onToast, playPop, playWhoosh, schedule, router]);

  if (!visible) return null;

  const isSept1 = getDateInfo().isSept1;

  return (
    <>
      {/* Glow overlay */}
      <div className={`gift-glow-overlay ${phase === "glow" || phase === "done" ? "active" : ""}`} />

      {/* Gift box wrapper */}
      <div
        className={`gift-box-wrapper gift-phase-${phase} ${isSept1 && phase === "idle" ? "gift-shake-loop" : ""}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Gift box"
      >
        <div className="gift-box-3d">
          {/* Lid */}
          <div className={`gift-lid ${phase === "open" || phase === "glow" ? "gift-lid-open" : ""}`}>
            <svg width="56" height="14" viewBox="0 0 56 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="56" height="14" rx="3" fill="#8EC5D6" />
              <rect x="0" y="0" width="56" height="14" rx="3" stroke="#7BB8CC" strokeWidth="1.5" />
              <rect x="0" y="4" width="56" height="4" fill="#FFB6C1" />
              <rect x="0" y="4" width="56" height="4" stroke="#E89AAA" strokeWidth="0.5" />
              <ellipse cx="20" cy="2" rx="6" ry="4" fill="#FFB6C1" stroke="#E89AAA" strokeWidth="0.8" transform="rotate(-15 20 2)" />
              <ellipse cx="36" cy="2" rx="6" ry="4" fill="#FFB6C1" stroke="#E89AAA" strokeWidth="0.8" transform="rotate(15 36 2)" />
              <circle cx="28" cy="3" r="2.5" fill="#E89AAA" />
            </svg>
          </div>

          {/* Body */}
          <div className="gift-body">
            <svg width="56" height="40" viewBox="0 0 56 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="56" height="40" rx="4" fill="#A8D8EA" />
              <rect x="0" y="0" width="56" height="40" rx="4" stroke="#7BB8CC" strokeWidth="1.5" />
              <rect x="25" y="0" width="6" height="40" fill="#FFB6C1" />
              <rect x="25" y="0" width="6" height="40" stroke="#E89AAA" strokeWidth="0.5" />
              <rect x="8" y="6" width="3" height="10" rx="1.5" fill="rgba(255,255,255,0.4)" />
            </svg>
          </div>
        </div>

        {/* Label — only in idle state */}
        {phase === "idle" && (
          <span className="gift-box-label">Hiyori&apos;s Day 🎂</span>
        )}
      </div>
    </>
  );
}
