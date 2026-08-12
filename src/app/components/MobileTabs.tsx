"use client";

import { useState } from "react";

type Tab = "list" | "calendar";

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
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border flex justify-around py-3 safe-area-bottom">
        <button
          onClick={() => setActiveTab("list")}
          className={`flex flex-col items-center gap-1 text-sm font-semibold transition-colors ${
            activeTab === "list" ? "text-accent" : "text-textMuted"
          }`}
        >
          <span className="text-xl">📋</span>
          List
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex flex-col items-center gap-1 text-sm font-semibold transition-colors ${
            activeTab === "calendar" ? "text-accent" : "text-textMuted"
          }`}
        >
          <span className="text-xl">📅</span>
          Calendar
        </button>
      </nav>
    </div>
  );
}
