"use client";

import { useState, useEffect } from "react";
import { createActivity, updateActivity, deleteActivity, type ActivityData } from "../actions/activities";
import { STATUS_CONFIG, type StatusKey } from "../lib/utils";

type Props = {
  mode: "add" | "edit";
  activity?: ActivityData | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function ActivityModal({ mode, activity, onClose, onSaved }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<StatusKey>("IDE");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (mode === "edit" && activity) {
      setTitle(activity.title);
      setDescription(activity.description || "");
      setDate(activity.date ? new Date(activity.date).toISOString().split("T")[0] : "");
      setStatus(activity.status);
    }
  }, [mode, activity]);

  // Auto-set status when date changes
  const handleDateChange = (value: string) => {
    setDate(value);
    if (value && status === "IDE") {
      setStatus("DIJADKANIN");
    }
  };

  // Auto-clear date when status changes to IDE
  const handleStatusChange = (value: StatusKey) => {
    setStatus(value);
    if (value === "IDE") {
      setDate("");
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Judul wajib diisi";
    if (title.length > 100) newErrors.title = "Judul maksimal 100 karakter";
    if (description.length > 500) newErrors.description = "Deskripsi maksimal 500 karakter";
    if (status === "DIJADKANIN" && !date) newErrors.date = "Dijadwalin wajib ada tanggal";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (mode === "add") {
        await createActivity({
          title: title.trim(),
          description: description.trim() || undefined,
          date: date || null,
          status,
        });
      } else if (activity) {
        await updateActivity(activity.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          date: date || null,
          status,
        });
      }
      onSaved();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan";
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!activity) return;
    setLoading(true);
    try {
      await deleteActivity(activity.id);
      onSaved();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal menghapus";
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in">
        {showDeleteConfirm ? (
          /* Delete Confirmation */
          <div className="text-center">
            <p className="text-3xl mb-3">🗑️</p>
            <h3 className="font-bold text-lg mb-1">Yakin hapus?</h3>
            <p className="text-sm text-textMuted mb-6">&quot;{activity?.title}&quot; akan dihapus permanen.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-cream font-semibold hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {loading ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit}>
            <h3 className="font-bold text-lg mb-4">
              {mode === "add" ? "✨ Ide Baru" : "✏️ Edit Aktivitas"}
            </h3>

            {/* Title */}
            <div className="mb-3">
              <label className="block text-sm font-semibold mb-1">Judul *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-cream/50 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                placeholder="Misal: Nonton film bareng"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              <p className="text-xs text-textMuted mt-0.5">{title.length}/100</p>
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="block text-sm font-semibold mb-1">Deskripsi</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-cream/50 focus:outline-none focus:ring-2 focus:ring-accent text-sm resize-none"
                placeholder="Catatan tambahan (opsional)"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              <p className="text-xs text-textMuted mt-0.5">{description.length}/500</p>
            </div>

            {/* Date */}
            <div className="mb-3">
              <label className="block text-sm font-semibold mb-1">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-cream/50 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>

            {/* Status */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as StatusKey)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-cream/50 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              >
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            {/* Submit error */}
            {errors.submit && <p className="text-red-500 text-sm mb-3">{errors.submit}</p>}

            {/* Buttons */}
            <div className="flex gap-3">
              {mode === "edit" && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2.5 rounded-xl bg-red-50 text-red-500 font-semibold hover:bg-red-100 transition-colors text-sm"
                >
                  🗑️ Hapus
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-cream font-semibold hover:bg-gray-200 transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-accent text-white font-semibold hover:bg-accentHover transition-colors disabled:opacity-50 text-sm"
                >
                  {loading ? "Menyimpan..." : mode === "add" ? "Tambah" : "Simpan"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
