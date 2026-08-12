"use client";

import type { ActivityData } from "../actions/activities";
import { STATUS_CONFIG, formatDateIndo, getStickerEmoji } from "../lib/utils";

type Props = {
  activity: ActivityData;
  isSelected: boolean;
  onClick: () => void;
};

export default function ActivityCard({ activity, isSelected, onClick }: Props) {
  const statusConfig = STATUS_CONFIG[activity.status];
  const sticker = getStickerEmoji(activity.title);
  const isFaded = activity.status === "DONE" || activity.status === "BATAL";

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-2xl border border-border bg-white
        transition-all duration-200 ease-out
        hover:-translate-y-0.5 hover:shadow-md
        ${isSelected ? "ring-2 ring-accent shadow-md -translate-y-0.5" : "shadow-sm"}
        ${isFaded ? "opacity-60" : ""}
      `}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">{sticker}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base truncate">{activity.title}</h3>
          {activity.description && (
            <p className="text-sm text-textMuted mt-0.5 line-clamp-2">{activity.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {activity.date && (
              <span className="text-xs text-textMuted">{formatDateIndo(new Date(activity.date))}</span>
            )}
            {!activity.date && (
              <span className="text-xs text-textMuted/50">Belum ada tanggal</span>
            )}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig.color} ${statusConfig.textColor}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
