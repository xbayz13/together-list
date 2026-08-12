export const STATUS_CONFIG = {
  IDE: { label: "Ide", color: "bg-badgeIde", textColor: "text-blue-700" },
  DIJADKANIN: { label: "Dijadwalin", color: "bg-badgeDijadwalin", textColor: "text-yellow-700" },
  DONE: { label: "Done", color: "bg-badgeDone", textColor: "text-green-700" },
  BATAL: { label: "Batal", color: "bg-badgeBatal", textColor: "text-gray-600" },
} as const;

export type StatusKey = keyof typeof STATUS_CONFIG;

export function formatDateIndo(date: Date): string {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function getMonthDays(year: number, month: number): {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = (firstDay.getDay() + 6) % 7; // Monday start
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];

  // Padding days from previous month
  for (let i = startPadding - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, isCurrentMonth: false, isToday: false });
  }

  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i);
    days.push({ date: d, isCurrentMonth: true, isToday: d.getTime() === today.getTime() });
  }

  // Padding days to complete the grid (always show 6 rows = 42 days)
  while (days.length < 42) {
    const lastDate = days[days.length - 1].date;
    const d = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + 1);
    days.push({ date: d, isCurrentMonth: false, isToday: false });
  }

  return days;
}

export const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export const DAY_NAMES = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

// Simple sticker mapping based on keywords in title
const STICKER_KEYWORDS: Record<string, string> = {
  nonton: "🎬",
  film: "🎬",
  movie: "🎬",
  makan: "🍜",
  food: "🍜",
  bakso: "🍜",
  kopi: "☕",
  kafe: "☕",
  cafe: "☕",
  jalan: "🚶",
  travel: "✈️",
  liburan: "🏖️",
  baca: "📚",
  buku: "📚",
  game: "🎮",
  main: "🎮",
  musik: "🎵",
  konser: "🎵",
  belanja: "🛍️",
  gym: "💪",
  olahraga: "💪",
  foto: "📸",
  hiking: "⛰️",
  laut: "🌊",
  pantai: "🌊",
  birthday: "🎂",
  ulang: "🎂",
};

export function getStickerEmoji(title: string): string {
  const lower = title.toLowerCase();
  for (const [keyword, emoji] of Object.entries(STICKER_KEYWORDS)) {
    if (lower.includes(keyword)) return emoji;
  }
  return "💕"; // default sticker
}
