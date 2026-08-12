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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-textMain">Together List</h1>
          <p className="text-sm text-textMuted mt-0.5">Bucket list bareng</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-accent">{activities.length}</p>
          <p className="text-xs text-textMuted">aktivitas</p>
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
