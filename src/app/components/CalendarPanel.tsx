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

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

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
    <aside className="card-glass rounded-3xl p-5 shadow-lg shadow-shadow/5 flex flex-col gap-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToPrevMonth}
          className="p-2 hover:bg-accentLight rounded-xl transition-all text-textMuted hover:text-accent btn-press"
        >
          <ChevronLeft />
        </button>
        <h2 className="font-bold text-lg tracking-tight">{MONTH_NAMES[currentMonth]} {currentYear}</h2>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-accentLight rounded-xl transition-all text-textMuted hover:text-accent btn-press"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-textMuted/70 uppercase tracking-wider">
        {DAY_NAMES.map((d) => <div key={d} className="py-1">{d}</div>)}
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
                calendar-day relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium
                ${day.isCurrentMonth ? "text-textMain" : "text-textMuted/30"}
                ${isSelected
                  ? "bg-accent text-white font-bold shadow-md shadow-accent/30"
                  : isToday
                    ? "bg-accentLight text-accent font-bold"
                    : "hover:bg-cream/80"
                }
              `}
            >
              {day.date.getDate()}
              {hasActivity && (
                <span className={`absolute bottom-1.5 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-accent"}`} />
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
