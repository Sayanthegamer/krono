import React, { useState } from 'react';
import { TimetableProvider, useTimetable } from './context/TimetableContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { WeekView } from './components/WeekView';
import { EntryModal } from './components/EntryModal';
import type { TimeTableEntry } from './types';
import { FocusMode } from './pages/FocusMode';
import { useNotifications } from './hooks/useNotifications';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'week' | 'settings' | 'focus'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeTableEntry | null>(null);

  const { addEntry, updateEntry, deleteEntry, entries, settings } = useTimetable();

  // Enable notifications
  useNotifications(entries, settings.notificationsEnabled);

  const handleSave = (entry: TimeTableEntry | Omit<TimeTableEntry, 'id'>) => {
    if ('id' in entry) {
      updateEntry(entry);
    } else {
      addEntry(entry);
    }
  };

  const handleEditClick = (entry: TimeTableEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onAddClick={handleAddClick}
    >
      {activeTab === 'dashboard' && <Dashboard onEntryClick={handleEditClick} />}
      {activeTab === 'week' && <WeekView onEntryClick={handleEditClick} />}
      {activeTab === 'focus' && <FocusMode />}
      {/* Settings tab could be simple for now */}
      {activeTab === 'settings' && (
        <div className="p-4 text-center">
          <h2 className="font-bold text-xl mb-4">Settings</h2>
          <p>Theme settings are in the top right corner.</p>
          {/* Future settings here */}
        </div>
      )}

      <EntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onDelete={deleteEntry}
        initialData={editingEntry}
      />
    </Layout>
  );
};

function App() {
  return (
    <TimetableProvider>
      <AppContent />
    </TimetableProvider>
  );
}

export default App;
