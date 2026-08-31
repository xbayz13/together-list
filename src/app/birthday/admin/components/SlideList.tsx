"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type SlideItem = {
  id: number;
  type: string;
  content: string | null;
  photoId: number | null;
  photoUrl: string | null;
  order: number;
};

type SlideListProps = {
  slides: SlideItem[];
  onReorder: (ids: number[]) => void;
  onSelect: (slide: SlideItem) => void;
  onDelete: (id: number) => void;
  onAddPhoto: () => void;
  onAddMessage: () => void;
  onAddBanner: () => void;
  selectedId: number | null;
};

function SortableSlide({
  slide,
  index,
  isSelected,
  onSelect,
  onDelete,
}: {
  slide: SlideItem;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const icon = slide.type === "photo" ? "📸" : slide.type === "banner" ? "🎂" : "💬";
  const label =
    slide.type === "banner"
      ? "Happy Birthday Hiyori!"
      : slide.type === "message"
      ? slide.content || "(kosong)"
      : slide.photoUrl
      ? "Foto"
      : "(kosong)";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`slide-item ${isSelected ? "active" : ""} ${isDragging ? "dragging" : ""}`}
      onClick={onSelect}
    >
      <span className="drag-handle" {...attributes} {...listeners}>
        ⋮
      </span>
      <span className="slide-number">{index + 1}.</span>
      <span className="slide-icon">{icon}</span>
      {slide.photoUrl && slide.type === "photo" && (
        <img src={slide.photoUrl} alt="" className="slide-thumb" />
      )}
      <div className="slide-info">
        <div className="slide-info-title">{label}</div>
        <div className="slide-info-sub">{slide.type}</div>
      </div>
      <button className="slide-delete" onClick={onDelete} aria-label="Delete slide">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export default function SlideList({
  slides,
  onReorder,
  onSelect,
  onDelete,
  onAddPhoto,
  onAddMessage,
  onAddBanner,
  selectedId,
}: SlideListProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = slides.findIndex((s) => s.id === active.id);
    const newIndex = slides.findIndex((s) => s.id === over.id);
    const newOrder = arrayMove(slides, oldIndex, newIndex);
    onReorder(newOrder.map((s) => s.id));
  };

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="slide-list">
            {slides.map((slide, index) => (
              <SortableSlide
                key={slide.id}
                slide={slide}
                index={index}
                isSelected={selectedId === slide.id}
                onSelect={() => onSelect(slide)}
                onDelete={async (e) => {
                  e.stopPropagation();
                  if (confirm("Hapus slide ini?")) {
                    try {
                      onDelete(slide.id);
                    } catch {
                      alert("Gagal menghapus slide");
                    }
                  }
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="add-buttons">
        <button className="add-btn" onClick={onAddPhoto}>
          📸 Foto
        </button>
        <button className="add-btn" onClick={onAddMessage}>
          💬 Pesan
        </button>
        <button className="add-btn" onClick={onAddBanner}>
          🎂 Banner
        </button>
      </div>
    </div>
  );
}
