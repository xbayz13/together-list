"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import "../birthday/giftbox.css";

type GiftBoxProps = {
  onToast?: (message: string) => void;
};

export default function GiftBox({ onToast }: GiftBoxProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"idle" | "shaking" | "popping" | "fading">("idle");

  // Date check — local time
  const getDateInfo = useCallback(() => {
    const now = new Date();
    const month = now.getMonth(); // 0-indexed (8 = September)
    const day = now.getDate();
    const forceShow = process.env.NEXT_PUBLIC_GIFTBOX_FORCE_SHOW === "true";
    return {
      isBeforeSept1: !forceShow && (month < 8 || (month === 8 && day < 1)),
      isSept1: forceShow || (month === 8 && day === 1),
      isSept2Plus: forceShow || ((month === 8 && day >= 2) || month > 8),
    };
  }, []);

  useEffect(() => {
    const { isBeforeSept1, isSept1 } = getDateInfo();
    if (!isBeforeSept1) {
      setVisible(true);
      if (isSept1) {
        setPhase("shaking");
      }
    }
  }, [getDateInfo]);

  const handleClick = useCallback(() => {
    const { isSept1, isSept2Plus } = getDateInfo();

    if (isSept1) {
      onToast?.("Sabar ya! 🤫");
      return;
    }

    if (isSept2Plus) {
      // Pop animation → fade to white → navigate
      setPhase("popping");
      document.body.style.overflow = "hidden";

      setTimeout(() => {
        setPhase("fading");
      }, 400);

      setTimeout(() => {
        router.push("/birthday");
      }, 900);
    }
  }, [getDateInfo, onToast, router]);

  if (!visible) return null;

  return (
    <>
      {/* Fade to white overlay */}
      {phase === "fading" && <div className="gift-box-fade-overlay" />}

      <div
        className={`gift-box ${phase === "shaking" ? "shaking" : ""} ${phase === "popping" ? "popping" : ""}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Gift box"
      >
        <svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="gift-box-svg"
        >
          {/* Box body */}
          <rect x="8" y="24" width="40" height="28" rx="4" fill="#A8D8EA" />
          <rect x="8" y="24" width="40" height="28" rx="4" stroke="#7BB8CC" strokeWidth="1.5" />

          {/* Box lid */}
          <rect x="5" y="18" width="46" height="10" rx="3" fill="#8EC5D6" />
          <rect x="5" y="18" width="46" height="10" rx="3" stroke="#7BB8CC" strokeWidth="1.5" />

          {/* Vertical ribbon */}
          <rect x="25" y="18" width="6" height="34" fill="#F9E79F" />
          <rect x="25" y="18" width="6" height="34" stroke="#E8D44D" strokeWidth="0.5" />

          {/* Horizontal ribbon on lid */}
          <rect x="5" y="21" width="46" height="4" fill="#F9E79F" />
          <rect x="5" y="21" width="46" height="4" stroke="#E8D44D" strokeWidth="0.5" />

          {/* Bow left */}
          <ellipse cx="22" cy="16" rx="7" ry="5" fill="#F9E79F" stroke="#E8D44D" strokeWidth="1" transform="rotate(-15 22 16)" />

          {/* Bow right */}
          <ellipse cx="34" cy="16" rx="7" ry="5" fill="#F9E79F" stroke="#E8D44D" strokeWidth="1" transform="rotate(15 34 16)" />

          {/* Bow center knot */}
          <circle cx="28" cy="17" r="3" fill="#E8D44D" />

          {/* Shine effect */}
          <rect x="14" y="28" width="3" height="8" rx="1.5" fill="rgba(255,255,255,0.4)" />
        </svg>

        <span className="gift-box-label">Hiyori&apos;s Day 🎂</span>
      </div>
    </>
  );
}
