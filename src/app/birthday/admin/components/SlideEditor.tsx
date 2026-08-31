"use client";

import { useState, useEffect } from "react";

type SlideEditorProps = {
  slide: {
    id: number;
    type: string;
    content: string | null;
  };
  onSave: (id: number, content: string) => void;
  onClose: () => void;
};

export default function SlideEditor({ slide, onSave, onClose }: SlideEditorProps) {
  const [content, setContent] = useState(slide.content || "");

  useEffect(() => {
    setContent(slide.content || "");
  }, [slide.id, slide.content]);

  if (slide.type !== "message") return null;

  return (
    <div className="slide-editor">
      <div className="slide-editor-header">
        <h3 className="slide-editor-title">Edit Ucapan</h3>
      </div>
      <textarea
        className="slide-editor-textarea"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Tulis ucapan..."
      />
      <div className="slide-editor-actions">
        <button
          className="btn-primary"
          onClick={() => onSave(slide.id, content)}
        >
          Simpan
        </button>
        <button className="btn-secondary" onClick={onClose}>
          Batal
        </button>
      </div>
    </div>
  );
}
