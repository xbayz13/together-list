"use client";

import { useState, useMemo } from "react";
import type { ActivityData } from "../actions/activities";
import { type StatusKey } from "../lib/utils";
import FilterTabs from "./FilterTabs";
import ActivityCard from "./ActivityCard";

type Props = {
  activities: ActivityData[];
  selectedDate: Date | null;
  onSelectActivity: (activity: ActivityData) => void;
  selectedActivityId: number | null;
};

function EmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#A8D8EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="13" x2="13" y2="13" />
    </svg>
  );
}

export default function ListPanel({ activities, selectedDate, onSelectActivity, selectedActivityId }: Props) {
  const [filter, setFilter] = useState<StatusKey | "SEMUA">("SEMUA");

  const filtered = useMemo(() => {
    if (filter === "SEMUA") return activities;
    return activities.filter((a) => a.status === filter);
  }, [activities, filter]);

  const isEmpty = filtered.length === 0;

  return (
    <main className="w-full md:w-[65%] flex flex-col gap-5">
      {/* Hero Header */}
      <div className="text-center md:text-left mb-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Bayoong & Hiyori</p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-textMain leading-tight">
          Things we should do <span className="text-accent">together</span>
        </h1>
        <p className="text-sm text-textMuted mt-2 max-w-md">
          Semua ide, rencana, dan mimpi yang mau kita wujudkan bareng.
        </p>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 px-4 py-3 card-glass rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-badgeIde" />
          <span className="text-sm text-textMuted">{activities.filter(a => a.status === "IDE").length} Ide</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-badgeDijadwalin" />
          <span className="text-sm text-textMuted">{activities.filter(a => a.status === "DIJADKANIN").length} Dijadwalin</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-badgeDone" />
          <span className="text-sm text-textMuted">{activities.filter(a => a.status === "DONE").length} Done</span>
        </div>
      </div>

      <FilterTabs activeFilter={filter} onChange={setFilter} />

      <div className="flex flex-col gap-3">
        {isEmpty && (
          <div className="card-glass rounded-2xl text-center py-16 px-6">
            <div className="flex justify-center mb-4">
              <EmptyIcon />
            </div>
            <p className="font-semibold text-textMain mb-1">
              {filter === "SEMUA"
                ? "Belum ada aktivitas"
                : `Belum ada aktivitas ${filter.toLowerCase()}`}
            </p>
            <p className="text-sm text-textMuted">
              {filter === "SEMUA"
                ? "Klik tombol + untuk menambah aktivitas baru"
                : "Coba filter lain atau tambah aktivitas baru"}
            </p>
          </div>
        )}
        {filtered.map((activity, index) => (
          <div key={activity.id} className="activity-list-enter" style={{ animationDelay: `${index * 30}ms` }}>
            <ActivityCard
              activity={activity}
              isSelected={activity.id === selectedActivityId}
              onClick={() => onSelectActivity(activity)}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
