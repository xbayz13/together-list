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
    <div className="flex gap-2 overflow-x-auto pb-1">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`
            px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all
            ${
              activeFilter === tab.key
                ? "bg-accent text-white shadow-sm"
                : "bg-cream text-textMuted hover:bg-accent/20"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
