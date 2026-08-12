"use client";

import { useState } from "react";

type Tab = "list" | "calendar";

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#A8D8EA" : "#6B7280"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
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
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#A8D8EA" : "#6B7280"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <rect x="7" y="13" width="3" height="3" rx="0.5" fill={active ? "#A8D8EA" : "none"} />
    </svg>
  );
}

export default function MobileTabs({
  children,
}: {
  children: (activeTab: Tab) => React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("list");

  return (
    <div className="md:hidden flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto pb-20">
        {children(activeTab)}
      </div>
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-border flex justify-around py-3 safe-area-bottom">
        <button
          onClick={() => setActiveTab("list")}
          className={`flex flex-col items-center gap-1.5 text-xs font-semibold transition-all ${
            activeTab === "list" ? "text-accent scale-105" : "text-textMuted"
          }`}
        >
          <ListIcon active={activeTab === "list"} />
          List
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex flex-col items-center gap-1.5 text-xs font-semibold transition-all ${
            activeTab === "calendar" ? "text-accent scale-105" : "text-textMuted"
          }`}
        >
          <CalendarIcon active={activeTab === "calendar"} />
          Calendar
        </button>
      </nav>
    </div>
  );
}
