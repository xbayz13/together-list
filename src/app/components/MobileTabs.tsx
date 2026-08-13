"use client";

import { useState, useRef, useEffect } from "react";

type Tab = "list" | "calendar" | "gallery";

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#A8D8EA" : "#6B7280"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-colors duration-200"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#A8D8EA" : "#6B7280"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-colors duration-200"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <rect x="7" y="13" width="3" height="3" rx="0.5" fill={active ? "#A8D8EA" : "none"} />
    </svg>
  );
}

function GalleryIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#A8D8EA" : "#6B7280"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-colors duration-200"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

export default function MobileTabs({
  children,
}: {
  children: (activeTab: Tab) => React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("list");
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayTab, setDisplayTab] = useState<Tab>("list");
  const contentRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (newTab: Tab) => {
    if (newTab === activeTab || isAnimating) return;
    
    setIsAnimating(true);
    
    // Determine animation direction based on tab order
    const tabOrder: Tab[] = ["list", "calendar", "gallery"];
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(newTab);
    const direction = newIndex > currentIndex ? 1 : -1;
    
    // Fade out current content
    if (contentRef.current) {
      contentRef.current.style.opacity = "0";
      contentRef.current.style.transform = `translateX(${direction * 20}px)`;
    }
    
    // After fade out, switch tab and fade in
    setTimeout(() => {
      setDisplayTab(newTab);
      setActiveTab(newTab);
      
      // Force reflow then animate in
      requestAnimationFrame(() => {
        if (contentRef.current) {
          contentRef.current.style.transform = `translateX(${-direction * 20}px)`;
          requestAnimationFrame(() => {
            if (contentRef.current) {
              contentRef.current.style.opacity = "1";
              contentRef.current.style.transform = "translateX(0)";
            }
          });
        }
        setTimeout(() => setIsAnimating(false), 200);
      });
    }, 150);
  };

  // Reset content position on mount
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.transition = "opacity 0.2s ease-out, transform 0.2s ease-out";
    }
  }, []);

  const tabs = [
    { key: "list" as Tab, label: "List", icon: ListIcon },
    { key: "calendar" as Tab, label: "Calendar", icon: CalendarIcon },
    { key: "gallery" as Tab, label: "Gallery", icon: GalleryIcon },
  ];

  // Calculate indicator position (33.33% per tab)
  const indicatorLeft = `calc(${(tabs.findIndex(t => t.key === activeTab) + 0.5) * 33.33}% - 20px)`;

  return (
    <div className="md:hidden flex flex-col h-screen">
      {/* Content area with animation */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div
          ref={contentRef}
          style={{ opacity: 1, transform: "translateX(0)" }}
        >
          {children(displayTab)}
        </div>
      </div>

      {/* Tab bar with sliding indicator */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-border safe-area-bottom">
        <div className="flex justify-around py-2 relative">
          {/* Sliding indicator */}
          <div
            className="absolute bottom-0 h-0.5 bg-accent rounded-full transition-all duration-300 ease-out"
            style={{
              width: "40px",
              left: indicatorLeft,
            }}
          />
          
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex flex-col items-center gap-1 py-2 px-6 transition-all duration-200 ${
                activeTab === tab.key
                  ? "text-accent"
                  : "text-textMuted hover:text-textMain"
              }`}
            >
              <tab.icon active={activeTab === tab.key} />
              <span className={`text-[11px] font-semibold tracking-wide transition-all duration-200 ${
                activeTab === tab.key ? "opacity-100" : "opacity-60"
              }`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
