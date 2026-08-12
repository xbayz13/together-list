"use client";

import type { ActivityData } from "../actions/activities";
import { formatDateIndo, getStickerEmoji } from "../lib/utils";

type Props = {
  activities: ActivityData[];
};

export default function UpcomingList({ activities }: Props) {
  if (activities.length === 0) {
    return (
      <div className="border-t border-border pt-3">
        <p className="text-xs font-semibold text-textMuted mb-2">Upcoming</p>
        <p className="text-xs text-textMuted/60">Belum ada aktivitas dijadwalin</p>
      </div>
    );
  }

  return (
    <div className="border-t border-border pt-3">
      <p className="text-xs font-semibold text-textMuted mb-2">Upcoming</p>
      <div className="flex flex-col gap-2">
        {activities.map((a) => (
          <div key={a.id} className="flex items-center gap-2 text-sm">
            <span>{getStickerEmoji(a.title)}</span>
            <span className="font-medium truncate">{a.title}</span>
            <span className="text-xs text-textMuted ml-auto whitespace-nowrap">
              {formatDateIndo(new Date(a.date!))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
