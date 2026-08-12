"use client";

import { useState, useMemo } from "react";
import { getMonthDays, MONTH_NAMES, DAY_NAMES } from "../lib/utils";
import type { ActivityData } from "../actions/activities";
import UpcomingList from "./UpcomingList";

type Props = {
  activities: ActivityData[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
};

export default function CalendarPanel({ activities, selectedDate, onSelectDate }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const days = useMemo(() => getMonthDays(currentYear, currentMonth), [currentYear, currentMonth]);

  // Set of dates that have activities (YYYY-MM-DD)
  const activityDates = useMemo(() => {
    const set = new Set<string>();
    activities.forEach((a) => {
      if (a.date) {
        const d = new Date(a.date);
        set.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
      }
    });
    return set;
  }, [activities]);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const upcoming = activities
    .filter((a) => a.status === "DIJADKANIN" && a.date && new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
    .slice(0, 5);

  return (
    <aside className="w-full md:w-[35%] bg-card rounded-2xl border border-border p-4 shadow-sm flex flex-col gap-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button onClick={goToPrevMonth} className="p-1 hover:bg-cream rounded-lg transition-colors text-lg">◀</button>
        <h2 className="font-bold text-lg">{MONTH_NAMES[currentMonth]} {currentYear}</h2>
        <button onClick={goToNextMonth} className="p-1 hover:bg-cream rounded-lg transition-colors text-lg">▶</button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-textMuted">
        {DAY_NAMES.map((d) => <div key={d}>{d}</div>)}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const key = `${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`;
          const hasActivity = activityDates.has(key);
          const isSelected = selectedDate && isSameDay(day.date, selectedDate);
          const isToday = day.isToday;

          return (
            <button
              key={i}
              onClick={() => onSelectDate(day.date)}
              className={`
                relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all
                ${day.isCurrentMonth ? "text-textMain" : "text-textMuted/40"}
                ${isSelected ? "bg-accent text-white font-bold shadow-md scale-105" : "hover:bg-cream"}
                ${isToday && !isSelected ? "ring-2 ring-accent/50 font-semibold" : ""}
              `}
            >
              {day.date.getDate()}
              {hasActivity && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </div>

      {/* Upcoming list */}
      <UpcomingList activities={upcoming} />
    </aside>
  );
}
