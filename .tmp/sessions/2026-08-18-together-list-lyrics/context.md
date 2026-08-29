# Task Context: Music Player — Lirik + Layout Fix + Z-Index

Session ID: 2026-08-18-together-list-lyrics
Created: 2026-08-18T00:00:00Z
Status: in_progress

## Current Request
Fix z-index bug (FAB nutupin player di mobile), cleanup expanded player layout (hapus volume/repeat/shuffle), dan tambah synced lyrics dari LRCLIB.

## Context Files (Standards to Follow)
- /Users/ikhsanpahdian/.config/opencode/context/core/standards/code-quality.md
- /Users/ikhsanpahdian/.config/opencode/context/ui/web/react-patterns.md
- /Users/ikhsanpahdian/.config/opencode/context/ui/web/ui-styling-standards.md

## Reference Files (Source Material)
- src/app/components/MusicPlayer.tsx (557 lines)
- src/app/components/FloatingActionButton.tsx (86 lines)
- src/app/page.tsx (231 lines)
- src/app/globals.css (1699 lines)

## External Docs Fetched
- LRCLIB API: https://lrclib.net/api/get?track_name={title}&artist_name={artist}

## Components
1. Z-index fix - FAB auto-hide saat mobile player expanded
2. Layout cleanup - hapus volume/repeat/shuffle dari expanded view
3. Lyrics feature - LRCLIB fetch + synced display

## Constraints
- Mobile only untuk FAB auto-hide
- LRCLIB rate limit: ~5 req/detik
- Synced lyrics format: `[MM:SS.ms]text`
- LyricsDisplay re-render setiap 250ms dari currentTime
- Performance: React.memo, shallow compare, skip scroll kalo ga ada perubahan

## Exit Criteria
- [x] Mobile expanded: FAB fade out (opacity 0, pointer-events: none, 0.3s)
- [x] Mobile collapse: FAB fade in (opacity 1, 0.3s)
- [x] Desktop: FAB tetap visible kapan aja
- [x] isMobileExpanded state terpisah dari isExpanded
- [x] Expanded player: vinyl medium (~140px), ga crowded
- [x] Volume/repeat/shuffle dihapus dari expanded
- [x] Repeat icon kecil di collapsed
- [x] Lirik fetched dari LRCLIB saat lagu play
- [x] Synced lyrics: highlight baris aktif, auto-scroll smooth
- [x] Plain lyrics fallback: static
- [x] Kalo ga ada lirik: area invisible
- [x] npm run build → success
- [x] Auto-scroll lyrics improved
- [x] Lyrics design polished (3 lines, aesthetic)
