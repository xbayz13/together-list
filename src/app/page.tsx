"use client";

import CalendarPanel from "./components/CalendarPanel";
import ListPanel from "./components/ListPanel";
import MobileTabs from "./components/MobileTabs";

export default function Home() {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex gap-6 p-6 min-h-screen">
        <CalendarPanel />
        <ListPanel />
      </div>

      {/* Mobile */}
      <MobileTabs>
        {(tab) => (
          <div className="p-4">
            {tab === "list" ? <ListPanel /> : <CalendarPanel />}
          </div>
        )}
      </MobileTabs>
    </>
  );
}
