"use client";

type Props = {
  onClick: () => void;
};

export default function FloatingActionButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 md:bottom-8 right-6 z-40 w-14 h-14 rounded-full bg-accent text-white text-3xl font-bold shadow-lg hover:bg-accentHover hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
      aria-label="Tambah aktivitas baru"
    >
      +
    </button>
  );
}
