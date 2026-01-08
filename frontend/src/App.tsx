import MainLayout from './layouts/MainLayout';
import DatasetLoaderHelper from './views/DatasetLoaderHelper';
import DataView from './views/DataView';
import { useAppStore } from './store/useAppStore';

function App() {
  const { sessionId } = useAppStore();

  return (
    <MainLayout>
      {sessionId ? <DataView /> : <DatasetLoaderHelper />}
    </MainLayout>
  )
}

export default App
