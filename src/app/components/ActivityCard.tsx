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
        w-full text-left p-4 rounded-2xl
        transition-all duration-200 ease-out btn-press
        ${isSelected
          ? "card-glass shadow-lg shadow-accent/10 ring-2 ring-accent -translate-y-0.5"
          : "card-glass shadow-md shadow-shadow/5 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-shadowStrong/8"
        }
        ${isFaded ? "opacity-50" : ""}
      `}
    >
      <div className="flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-accentLight flex items-center justify-center text-xl flex-shrink-0">
          {sticker}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[15px] leading-snug truncate">{activity.title}</h3>
          {activity.description && (
            <p className="text-sm text-textMuted mt-1 line-clamp-2 leading-relaxed">{activity.description}</p>
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
