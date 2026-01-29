import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import HeroSection from './components/HeroSection';
import VillageSelection from './components/VillageSelection';
import Dashboard from './components/Dashboard';
import './styles/HeroSection.css';
import './styles/VillageSelection.css';

// Wrapper component for HeroSection to handle navigation
const HomePage = () => {
    const navigate = useNavigate();

    const handleSelectVillage = () => {
        navigate('/select-village');
    };

    return <HeroSection onSelectVillage={handleSelectVillage} />;
};

// Wrapper component for VillageSelection to handle dashboard navigation
const SelectionPage = () => {
    const navigate = useNavigate();

    const handleComplete = (location) => {
        // Navigate to dashboard with location data
        navigate('/dashboard', { state: { location } });
    };

    return <VillageSelection onComplete={handleComplete} />;
};

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/select-village" element={<SelectionPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
