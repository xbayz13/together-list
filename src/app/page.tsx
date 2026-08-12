"use client";

import { useState, useEffect, useCallback } from "react";
import { getActivities, type ActivityData } from "./actions/activities";
import CalendarPanel from "./components/CalendarPanel";
import ListPanel from "./components/ListPanel";
import ActivityModal from "./components/ActivityModal";
import FloatingActionButton from "./components/FloatingActionButton";
import MobileTabs from "./components/MobileTabs";
import Toast from "./components/Toast";

export default function Home() {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [modal, setModal] = useState<{ mode: "add" | "edit"; activity?: ActivityData } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

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
    // Find first activity on this date and highlight it
    const match = activities.find((a) => {
      if (!a.date) return false;
      const d = new Date(a.date);
      return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
    });
    if (match) setSelectedActivityId(match.id);
  };

  const calendarContent = (
    <CalendarPanel
      activities={activities}
      selectedDate={selectedDate}
      onSelectDate={handleSelectDate}
    />
  );

  const listContent = (
    <ListPanel
      activities={activities}
      selectedDate={selectedDate}
      onSelectActivity={(a) => {
        setSelectedActivityId(a.id);
        setModal({ mode: "edit", activity: a });
      }}
      selectedActivityId={selectedActivityId}
    />
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-textMuted">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-[70vw] flex gap-6">
          {calendarContent}
          {listContent}
        </div>
      </div>

      {/* Mobile */}
      <MobileTabs>
        {(tab) => (
          <div className="p-4">
            {tab === "list" ? listContent : calendarContent}
          </div>
        )}
      </MobileTabs>

      {/* FAB */}
      <FloatingActionButton onClick={() => setModal({ mode: "add" })} />

      {/* Modal */}
      {modal && (
        <ActivityModal
          mode={modal.mode}
          activity={modal.activity || null}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
