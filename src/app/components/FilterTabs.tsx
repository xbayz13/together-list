"use client";

import { STATUS_CONFIG, type StatusKey } from "../lib/utils";

type Props = {
  activeFilter: StatusKey | "SEMUA";
  onChange: (filter: StatusKey | "SEMUA") => void;
};

const TABS: { key: StatusKey | "SEMUA"; label: string }[] = [
  { key: "SEMUA", label: "Semua" },
  { key: "IDE", label: "Ide" },
  { key: "DIJADKANIN", label: "Dijadwalin" },
  { key: "DONE", label: "Done" },
  { key: "BATAL", label: "Batal" },
];

export default function FilterTabs({ activeFilter, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`
            px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all btn-press
            ${
              activeFilter === tab.key
                ? "bg-accent text-white shadow-md shadow-accent/20"
                : "bg-white/60 text-textMuted hover:bg-white hover:text-textMain hover:shadow-sm"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
