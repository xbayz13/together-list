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
  const isDone = activity.status === "DONE";
  const isFaded = activity.status === "BATAL";

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-2xl
        transition-all duration-200 ease-out btn-press
        ${isSelected
          ? "card-glass shadow-lg shadow-accent/10 ring-2 ring-accent -translate-y-0.5"
          : isDone
            ? "card-glass shadow-md shadow-badgeDone/20 done-glow hover:-translate-y-0.5 hover:shadow-lg"
            : "card-glass shadow-md shadow-shadow/5 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-shadowStrong/8"
        }
        ${isFaded ? "opacity-40" : ""}
      `}
    >
      <div className="flex items-start gap-3.5">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 sticker-pulse ${
          isDone ? "bg-badgeDone/50" : "bg-accentLight"
        }`}>
          {sticker}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-bold text-[15px] leading-snug truncate ${isDone ? "line-through text-textMuted" : ""}`}>
              {activity.title}
            </h3>
            {isDone && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 check-pop">
                <circle cx="12" cy="12" r="10" fill="#A9DFBF" />
                <path d="M8 12l3 3 5-6" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          {activity.description && (
            <p className={`text-sm mt-1 line-clamp-2 leading-relaxed ${isDone ? "text-textMuted/50" : "text-textMuted"}`}>
              {activity.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2.5">
            {activity.date && (
              <span className="text-xs text-textMuted/80 font-medium">{formatDateIndo(new Date(activity.date))}</span>
            )}
            {!activity.date && (
              <span className="text-xs text-textMuted/40 italic">Belum ada tanggal</span>
            )}
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide ${statusConfig.color} ${statusConfig.textColor}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
