"use client";

type Props = {
  onClick: () => void;
};

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export default function FloatingActionButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 md:bottom-8 right-6 z-40 w-14 h-14 rounded-2xl bg-accent text-white shadow-lg shadow-accent/30 hover:bg-accentHover hover:shadow-xl hover:shadow-accent/40 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center btn-press"
      aria-label="Tambah aktivitas baru"
    >
      <PlusIcon />
    </button>
  );
}
