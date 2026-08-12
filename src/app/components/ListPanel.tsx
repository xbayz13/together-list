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

export default function ListPanel({ activities, selectedDate, onSelectActivity, selectedActivityId }: Props) {
  const [filter, setFilter] = useState<StatusKey | "SEMUA">("SEMUA");

  const filtered = useMemo(() => {
    if (filter === "SEMUA") return activities;
    return activities.filter((a) => a.status === filter);
  }, [activities, filter]);

  const isEmpty = filtered.length === 0;

  return (
    <main className="w-full md:w-[65%] flex flex-col gap-4">
      <FilterTabs activeFilter={filter} onChange={setFilter} />

      <div className="flex flex-col gap-3">
        {isEmpty && (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-textMuted text-sm">
              {filter === "SEMUA"
                ? "Belum ada aktivitas. Klik + buat yang baru!"
                : `Belum ada aktivitas ${filter.toLowerCase()}`}
            </p>
          </div>
        )}
        {filtered.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            isSelected={activity.id === selectedActivityId}
            onClick={() => onSelectActivity(activity)}
          />
        ))}
      </div>
    </main>
  );
}
