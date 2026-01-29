import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const SelectionPage = lazy(() => import('./pages/SelectionPage'));
const RiskDashboard = lazy(() => import('./pages/RiskDashboard'));
const PredictionModule = lazy(() => import('./pages/PredictionModule'));
const SafetyModule = lazy(() => import('./pages/SafetyModule'));

const PageWrapper = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
    >
        {children}
    </motion.div>
);

const AnimatedRoutes = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
                <Route path="/selection" element={<PageWrapper><SelectionPage /></PageWrapper>} />
                <Route path="/dashboard/:villageId" element={<PageWrapper><RiskDashboard /></PageWrapper>} />
                <Route path="/predictions/:villageId" element={<PageWrapper><PredictionModule /></PageWrapper>} />
                <Route path="/safety/:villageId" element={<PageWrapper><SafetyModule /></PageWrapper>} />
            </Routes>
        </AnimatePresence>
    );
};

function App() {
    return (
        <Router>
            <div className="App flex flex-col min-h-screen">
                <Toaster position="top-right" />
                <Navbar />
                <div className="flex-grow">
                    <Suspense fallback={
                        <div className="flex items-center justify-center min-h-[60vh]">
                            <LoadingSpinner message="Hydro Hub is initializing..." />
                        </div>
                    }>
                        <AnimatedRoutes />
                    </Suspense>
                </div>
            </div>
        </Router>
    );
}

export default App;
