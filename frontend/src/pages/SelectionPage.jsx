import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import SelectionCard from '../components/SelectionCard';
import { getStates, getDistricts, getVillages } from '../services/api';

const SelectionPage = () => {
    const navigate = useNavigate();

    // State management
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);

    const [selectedState, setSelectedState] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedVillage, setSelectedVillage] = useState(null);

    const [loadingStates, setLoadingStates] = useState(true);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingVillages, setLoadingVillages] = useState(false);

    // Fetch states on mount
    useEffect(() => {
        fetchStates();
    }, []);

    const fetchStates = async () => {
        try {
            setLoadingStates(true);
            const response = await getStates();
            // Ensure we set data correctly depending on API response structure
            setStates(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching states:', error);
            // alert('Failed to load states. Please try again.'); // Suppress alerts in dev/demo
        } finally {
            setLoadingStates(false);
        }
    };

    // Handle state selection
    const handleStateSelect = async (state) => {
        setSelectedState(state);
        setSelectedDistrict(null);
        setSelectedVillage(null);
        setDistricts([]);
        setVillages([]);

        try {
            setLoadingDistricts(true);
            const response = await getDistricts(state.id);
            setDistricts(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching districts:', error);
        } finally {
            setLoadingDistricts(false);
        }
    };

    // Handle district selection
    const handleDistrictSelect = async (district) => {
        setSelectedDistrict(district);
        setSelectedVillage(null);
        setVillages([]);

        try {
            setLoadingVillages(true);
            const response = await getVillages(district.id);
            setVillages(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching villages:', error);
        } finally {
            setLoadingVillages(false);
        }
    };

    // Handle village selection - auto navigate
    const handleVillageSelect = (village) => {
        setSelectedVillage(village);
        // Navigate to dashboard after short delay for visual feedback
        setTimeout(() => {
            navigate(`/dashboard/${village.id}`);
        }, 500);
    };

    // Reset selection
    const handleReset = () => {
        setSelectedState(null);
        setSelectedDistrict(null);
        setSelectedVillage(null);
        setDistricts([]);
        setVillages([]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                        Select Your Village
                    </h1>
                    <p className="text-xl text-gray-600 mb-6">
                        Choose your location to view coastal risk assessment
                    </p>

                    {/* Breadcrumb */}
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>
                            {selectedState ? selectedState.name : 'State'}
                            {selectedDistrict && ` → ${selectedDistrict.name}`}
                            {selectedVillage && ` → ${selectedVillage.name}`}
                        </span>
                    </div>

                    {/* Reset Button */}
                    {(selectedState || selectedDistrict || selectedVillage) && (
                        <button
                            onClick={handleReset}
                            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Start Over
                        </button>
                    )}
                </div>

                {/* Selection Cards */}
                <div className="flex flex-col lg:flex-row items-start justify-center gap-6 lg:gap-8">
                    {/* Card 1: States */}
                    <div className="w-full lg:w-auto">
                        <SelectionCard
                            title="Select State"
                            options={states}
                            selectedId={selectedState?.id}
                            onSelect={handleStateSelect}
                            loading={loadingStates}
                        />
                    </div>

                    {/* Card 2: Districts (appears after state selection) */}
                    {selectedState && (
                        <div className="w-full lg:w-auto animate-slide-in-right">
                            <SelectionCard
                                title="Select District"
                                options={districts}
                                selectedId={selectedDistrict?.id}
                                onSelect={handleDistrictSelect}
                                loading={loadingDistricts}
                            />
                        </div>
                    )}

                    {/* Card 3: Villages (appears after district selection) */}
                    {selectedDistrict && (
                        <div className="w-full lg:w-auto animate-slide-in-right">
                            <SelectionCard
                                title="Select Village"
                                options={villages}
                                selectedId={selectedVillage?.id}
                                onSelect={handleVillageSelect}
                                loading={loadingVillages}
                            />
                        </div>
                    )}
                </div>

                {/* Helper Text */}
                <div className="text-center mt-12 text-gray-500">
                    {!selectedState && <p>👆 Start by selecting your state</p>}
                    {selectedState && !selectedDistrict && <p>👆 Now select your district</p>}
                    {selectedDistrict && !selectedVillage && <p>👆 Finally, select your village</p>}
                    {selectedVillage && (
                        <p className="text-blue-600 font-medium">
                            🚀 Taking you to risk dashboard...
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SelectionPage;
