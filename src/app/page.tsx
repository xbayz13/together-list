"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getActivities, type ActivityData } from "./actions/activities";
import { type PolaroidData } from "./actions/polaroids";
import CalendarPanel from "./components/CalendarPanel";
import ListPanel from "./components/ListPanel";
import ActivityModal from "./components/ActivityModal";
import FloatingActionButton from "./components/FloatingActionButton";
import MobileTabs from "./components/MobileTabs";
import Toast from "./components/Toast";
import MovingClouds from "./components/MovingClouds";
import PolaroidGallery from "./components/PolaroidGallery";
import PolaroidLightbox from "./components/PolaroidLightbox";
import PolaroidUploadModal from "./components/PolaroidUploadModal";

export default function Home() {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [modal, setModal] = useState<{ mode: "add" | "edit"; activity?: ActivityData } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Polaroid state
  const [allPolaroids, setAllPolaroids] = useState<PolaroidData[]>([]);
  const [selectedPolaroid, setSelectedPolaroid] = useState<PolaroidData | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [polaroidRefreshKey, setPolaroidRefreshKey] = useState(0);

  const fetchActivities = useCallback(async () => {
    try {
      const data = await getActivities();
      setActivities(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal mengambil data";
      setToast(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleSaved = () => {
    setModal(null);
    fetchActivities();
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    const match = activities.find((a) => {
      if (!a.date) return false;
      const d = new Date(a.date);
      return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
    });
    if (match) setSelectedActivityId(match.id);
  };

  // Stable callbacks with useCallback
  const handlePolaroidClick = useCallback((p: PolaroidData) => {
    setSelectedPolaroid(p);
  }, []);

  const handlePolaroidsLoaded = useCallback((polaroids: PolaroidData[]) => {
    setAllPolaroids(polaroids);
  }, []);

  // Memoize galleryContent to prevent unnecessary re-renders
  const calendarContent = useMemo(() => (
    <CalendarPanel
      activities={activities}
      selectedDate={selectedDate}
      onSelectDate={handleSelectDate}
    />
  ), [activities, selectedDate]);

  const listContent = useMemo(() => (
    <ListPanel
      activities={activities}
      selectedDate={selectedDate}
      onSelectActivity={(a) => {
        setSelectedActivityId(a.id);
        setModal({ mode: "edit", activity: a });
      }}
      selectedActivityId={selectedActivityId}
    />
  ), [activities, selectedDate, selectedActivityId]);

  const galleryContent = useMemo(() => (
    <PolaroidGallery
      onPolaroidClick={handlePolaroidClick}
      onPolaroidsLoaded={handlePolaroidsLoaded}
      refreshKey={polaroidRefreshKey}
    />
  ), [handlePolaroidClick, handlePolaroidsLoaded, polaroidRefreshKey]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-textMuted">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {/* Moving Clouds Background */}
      <MovingClouds />

      {/* Desktop */}
      <div className="hidden md:flex min-h-screen items-start justify-center px-6 py-10 relative" style={{ zIndex: 2 }}>
        <div className="w-full max-w-6xl flex gap-6">
          {/* Left panel: Calendar + Gallery */}
          <div className="w-[25%] flex flex-col gap-4">
            {calendarContent}
            {galleryContent}
          </div>
          {/* Right panel: List */}
          {listContent}
        </div>
      </div>

      {/* Mobile */}
      <div className="relative" style={{ zIndex: 2 }}>
        <MobileTabs>
          {(tab) => (
            <div className="p-4">
              {tab === "list" && listContent}
              {tab === "calendar" && calendarContent}
              {tab === "gallery" && galleryContent}
            </div>
          )}
        </MobileTabs>
      </div>

      {/* FAB */}
      <div className="relative" style={{ zIndex: 50 }}>
        <FloatingActionButton
          onAddActivity={() => setModal({ mode: "add" })}
          onUploadPhoto={() => setShowUploadModal(true)}
        />
      </div>

      {/* Activity Modal */}
      {modal && (
        <div className="relative" style={{ zIndex: 100 }}>
          <ActivityModal
            mode={modal.mode}
            activity={modal.activity || null}
            onClose={() => setModal(null)}
            onSaved={handleSaved}
          />
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="relative" style={{ zIndex: 100 }}>
          <PolaroidUploadModal
            onClose={() => setShowUploadModal(false)}
            onSuccess={() => {
              setShowUploadModal(false);
              // Increment refreshKey to trigger gallery refetch
              setPolaroidRefreshKey(k => k + 1);
            }}
          />
        </div>
      )}

      {/* Lightbox */}
      {selectedPolaroid && (
        <div className="relative" style={{ zIndex: 100 }}>
          <PolaroidLightbox
            polaroid={selectedPolaroid}
            allPolaroids={allPolaroids}
            onClose={() => setSelectedPolaroid(null)}
            onNavigate={(p) => setSelectedPolaroid(p)}
          />
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="relative" style={{ zIndex: 100 }}>
          <Toast message={toast} onClose={() => setToast(null)} />
        </div>
      )}
    </>
  );
}
