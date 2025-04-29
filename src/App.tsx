import React from 'react';
import { Layout } from './components/layout/Layout';
import { DocumentGrid } from './components/documents/DocumentGrid';
import { DocumentViewer } from './components/documents/DocumentViewer';
import { AppProvider, useAppContext } from './context/AppContext';

function AppContent() {
  const { activeDocument } = useAppContext();
  
  return (
    <Layout>
      {activeDocument ? <DocumentViewer /> : <DocumentGrid />}
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;