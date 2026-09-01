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
    const month = now.getMonth(); // 8 = September
    const day = now.getDate();
    const forceShow = process.env.NEXT_PUBLIC_GIFTBOX_FORCE_SHOW === "true";
    return {
      isBeforeSept1: !forceShow && (month < 8 || (month === 8 && day < 1)),
      isSept1: forceShow || (month === 8 && day === 1),
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
        setPhase("shake"); // Sept 1: continuous shaking
      }
    }
  }, [getDateInfo]);

  // Sound: pop (oscillator)
  const playPop = useCallback(() => {
    try {
      const ctx = new AudioContext();
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch { /* silent */ }
  }, []);

  // Sound: whoosh (sawtooth)
  const playWhoosh = useCallback(() => {
    try {
      const ctx = new AudioContext();
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
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

    // Phase 1: Shake + Pop (0-500ms)
    setPhase("shake");
    playPop();

    // Phase 2: Scale up + Whoosh (500ms)
    schedule(() => {
      setPhase("scale");
      playWhoosh();
    }, 500);

    // Phase 3: Open lid (800ms)
    schedule(() => setPhase("open"), 800);

    // Phase 4: Glow (1100ms)
    schedule(() => setPhase("glow"), 1100);

    // Phase 5: Navigate (1500ms)
    schedule(() => {
      document.body.style.overflow = "";
      router.replace("/birthday");
    }, 1500);
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
              {/* Ribbon horizontal on lid */}
              <rect x="0" y="4" width="56" height="4" fill="#FFB6C1" />
              <rect x="0" y="4" width="56" height="4" stroke="#E89AAA" strokeWidth="0.5" />
              {/* Bow left */}
              <ellipse cx="20" cy="2" rx="6" ry="4" fill="#FFB6C1" stroke="#E89AAA" strokeWidth="0.8" transform="rotate(-15 20 2)" />
              {/* Bow right */}
              <ellipse cx="36" cy="2" rx="6" ry="4" fill="#FFB6C1" stroke="#E89AAA" strokeWidth="0.8" transform="rotate(15 36 2)" />
              {/* Bow center */}
              <circle cx="28" cy="3" r="2.5" fill="#E89AAA" />
            </svg>
          </div>

          {/* Body */}
          <div className="gift-body">
            <svg width="56" height="40" viewBox="0 0 56 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="56" height="40" rx="4" fill="#A8D8EA" />
              <rect x="0" y="0" width="56" height="40" rx="4" stroke="#7BB8CC" strokeWidth="1.5" />
              {/* Ribbon vertical */}
              <rect x="25" y="0" width="6" height="40" fill="#FFB6C1" />
              <rect x="25" y="0" width="6" height="40" stroke="#E89AAA" strokeWidth="0.5" />
              {/* Shine */}
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
