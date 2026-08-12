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

function EmptyIllustration() {
  return (
    <div className="float-animation">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        {/* Clipboard */}
        <rect x="18" y="16" width="44" height="52" rx="6" fill="#D4EEF7" stroke="#A8D8EA" strokeWidth="2" />
        <rect x="28" y="10" width="24" height="10" rx="4" fill="#A8D8EA" />
        {/* Lines */}
        <rect x="26" y="34" width="28" height="3" rx="1.5" fill="#A8D8EA" opacity="0.5" />
        <rect x="26" y="42" width="20" height="3" rx="1.5" fill="#A8D8EA" opacity="0.3" />
        <rect x="26" y="50" width="24" height="3" rx="1.5" fill="#A8D8EA" opacity="0.4" />
        {/* Sparkles */}
        <circle cx="58" cy="22" r="2" fill="#F9E79F" />
        <circle cx="14" cy="30" r="1.5" fill="#A9DFBF" />
        <circle cx="66" cy="45" r="1.5" fill="#A8D8EA" />
      </svg>
    </div>
  );
}

function DoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="check-pop">
      <circle cx="12" cy="12" r="10" fill="#A9DFBF" />
      <path d="M8 12l3 3 5-6" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
  const doneCount = activities.filter(a => a.status === "DONE").length;
  const totalCount = activities.length;
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  return (
    <main className="w-full md:w-[65%] flex flex-col gap-5">
      {/* Hero Header */}
      <div className="text-center md:text-left mb-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-textMain leading-tight">
          Things we should do <span className="text-accent">together</span>
        </h1>
        <p className="text-sm text-textMuted mt-2 max-w-md">
          {totalCount === 0
            ? "Mulai tambahin ide pertama kita yuk!"
            : doneCount === totalCount && totalCount > 0
              ? "Kita sudah semuanya! Saatnya bikin yang baru ✨"
              : `${doneCount} dari ${totalCount} sudah terwujud. Ayo kejar sisanya!`
          }
        </p>
      </div>

      {/* Stats bar */}
      <div className="card-glass rounded-2xl px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-badgeIde" />
              <span className="text-sm font-medium text-textMuted">{activities.filter(a => a.status === "IDE").length} Ide</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-badgeDijadwalin" />
              <span className="text-sm font-medium text-textMuted">{activities.filter(a => a.status === "DIJADKANIN").length} Dijadwalin</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-badgeDone" />
              <span className="text-sm font-medium text-textMuted">{doneCount} Done</span>
            </div>
          </div>
          {doneCount > 0 && (
            <div className="flex items-center gap-1.5">
              <DoneIcon />
              <span className="text-xs font-bold text-green-700">{Math.round(progress)}%</span>
            </div>
          )}
        </div>
        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="h-1.5 bg-cream rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-badgeDone rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <FilterTabs activeFilter={filter} onChange={setFilter} />

      <div className="flex flex-col gap-3">
        {isEmpty && (
          <div className="card-glass rounded-2xl text-center py-14 px-6">
            <div className="flex justify-center mb-5">
              <EmptyIllustration />
            </div>
            <p className="font-bold text-lg text-textMain mb-1.5">
              {filter === "SEMUA"
                ? "List-nya masih kosong nih"
                : `Belum ada yang ${filter.toLowerCase()}`
              }
            </p>
            <p className="text-sm text-textMuted max-w-xs mx-auto leading-relaxed">
              {filter === "SEMUA"
                ? "Yuk mulai isi dengan hal-hal seru yang mau dilakuin bareng!"
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
