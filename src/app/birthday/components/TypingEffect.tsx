"use client";

import { useEffect, useRef, useState } from "react";

type TypingEffectProps = {
  text: string;
  isActive: boolean;
  speed?: number;
};

export default function TypingEffect({
  text,
  isActive,
  speed = 50,
}: TypingEffectProps) {
  const [displayText, setDisplayText] = useState("");
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isActive) {
      setDisplayText("");
      indexRef.current = 0;
      return;
    }

    indexRef.current = 0;
    setDisplayText("");

    timerRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        indexRef.current++;
        setDisplayText(text.slice(0, indexRef.current));
      } else {
        clearInterval(timerRef.current!);
        timerRef.current = null;
      }
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, text, speed]);

  return (
    <span className="story-message-text">
      {displayText}
      {isActive && displayText.length < text.length && (
        <span className="typing-cursor" />
      )}
    </span>
  );
}
