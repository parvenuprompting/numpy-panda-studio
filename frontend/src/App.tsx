import DataView from './views/DataView';
import DatasetLoaderHelper from './views/DatasetLoaderHelper';
import SettingsView from './views/SettingsView';
import MainLayout from './layouts/MainLayout';
import { useAppStore } from './store/useAppStore';

function App() {
  const { sessionId, activeView } = useAppStore();

  return (
    <MainLayout>
      {activeView === 'settings' ? (
        <SettingsView />
      ) : (
        !sessionId ? <DatasetLoaderHelper /> : <DataView />
      )}
    </MainLayout>
  );
}

export default App
