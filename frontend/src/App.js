import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './routerConfig'; // Suppress React Router warnings
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';
// import Home from './pages/Home';
import ManualInput from './pages/ManualInput';
// import ImageUpload from './pages/ImageUpload';
import Solution from './pages/Solution';
// import History from './pages/History';
import NotFound from './pages/NotFound';
import HowToFix from './pages/HowToFix';
import HelpCenter from './pages/HelpCenter';
import UserGuide from './pages/UserGuide';
import VideoSplashScreen from './components/VideoSplashScreen';
import VersionUpdateGate from './components/VersionUpdateGate';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <AppContent />
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  return (
    <div className="App w-full h-full overflow-hidden">
      <main className="bg-[#0D061A] w-full h-full relative">
        <Routes>
          <Route path="/" element={<VideoSplashScreen />} />
          <Route path="/manual" element={<ManualInput />} />
          {/* Upload route temporarily disabled */}
          <Route path="/solution/:id" element={<Solution />} />
          {/* <Route path="/history" element={<History />} /> */}
          <Route path="/howtofix" element={<HowToFix />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/user-guide" element={<UserGuide />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <VersionUpdateGate />
      </main>
    </div>
  );
}

export default App;
