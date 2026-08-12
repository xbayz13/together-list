"use client";

import { useState } from "react";
import CalendarPanel from "./components/CalendarPanel";
import ListPanel from "./components/ListPanel";
import MobileTabs from "./components/MobileTabs";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex gap-6 p-6 min-h-screen">
        <CalendarPanel
          activities={[]}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
        <ListPanel />
      </div>

      {/* Mobile */}
      <MobileTabs>
        {(tab) => (
          <div className="p-4">
            {tab === "list" ? (
              <ListPanel />
            ) : (
              <CalendarPanel
                activities={[]}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            )}
          </div>
        )}
      </MobileTabs>
    </>
  );
}
