"use client";

type Song = {
  id: number;
  title: string;
  artist: string;
};

type MusicPickerProps = {
  songs: Song[];
  selectedSongId: number | null;
  onSelect: (songId: number | null) => void;
};

export default function MusicPicker({ songs, selectedSongId, onSelect }: MusicPickerProps) {
  if (songs.length === 0) {
    return (
      <div className="music-picker">
        <h3 className="music-picker-title">🎵 Musik Latar</h3>
        <p className="music-empty">Tambah lagu dulu di music player</p>
      </div>
    );
  }

  return (
    <div className="music-picker">
      <h3 className="music-picker-title">🎵 Musik Latar</h3>
      <label className="music-option">
        <input
          type="radio"
          name="music"
          checked={selectedSongId === null}
          onChange={() => onSelect(null)}
        />
        <div className="music-option-info">
          <div className="music-option-title">Tanpa musik</div>
        </div>
      </label>
      {songs.map((song) => (
        <label key={song.id} className="music-option">
          <input
            type="radio"
            name="music"
            checked={selectedSongId === song.id}
            onChange={() => onSelect(song.id)}
          />
          <div className="music-option-info">
            <div className="music-option-title">{song.title}</div>
            <div className="music-option-artist">{song.artist}</div>
          </div>
        </label>
      ))}
    </div>
  );
}
