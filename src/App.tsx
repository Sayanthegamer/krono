import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TimetableProvider, useTimetable } from './context/TimetableContext';
import { FocusProvider } from './context/FocusContext';
import { TodoProvider } from './context/TodoContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { WeekView } from './components/WeekView';
import { EntryModal } from './components/EntryModal';
import type { TimeTableEntry } from './types';
import { FocusMode } from './pages/FocusMode';
import { useNotifications } from './hooks/useNotifications';
import { StatsWidget } from './components/StatsWidget';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'week' | 'focus' | 'stats'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeTableEntry | null>(null);

  const { addEntry, updateEntry, deleteEntry } = useTimetable();

  // Enable notifications
  useNotifications();

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
      {activeTab === 'dashboard' && <Dashboard onEntryClick={handleEditClick} onAddEntry={handleAddClick} />}
      {activeTab === 'week' && <WeekView onEntryClick={handleEditClick} />}
      {activeTab === 'focus' && <FocusMode />}
      {activeTab === 'stats' && (
        <div className="pt-4 space-y-4">
          <StatsWidget />
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

import { OnboardingTour } from './components/OnboardingTour';

const LandingPage = React.lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const LoginPage = React.lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
import { Suspense } from 'react';

// Main App with Auth Check
const AuthenticatedApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [showLanding, setShowLanding] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (user) {
    return (
      <TimetableProvider>
        <FocusProvider>
          <TodoProvider>
            <AppContent />
            <OnboardingTour />
          </TodoProvider>
        </FocusProvider>
      </TimetableProvider>
    );
  }

  // Not logged in flow
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      {showLanding ? (
        <LandingPage onGetStarted={() => setShowLanding(false)} />
      ) : (
        <LoginPage />
      )}
    </Suspense>
  );
};

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
