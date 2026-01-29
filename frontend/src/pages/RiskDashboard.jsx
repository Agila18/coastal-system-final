import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Download, Image as ImageIcon, Eye, EyeOff,
    TrendingUp, AlertTriangle, Home
} from 'lucide-react';
import { getVillageRisk } from '../services/api';
import { getRiskColor, getRiskCategory } from '../utils/riskColors';
import MapComponent from '../components/MapComponent';
import { RiskChartsTabView } from '../components/ChartComponents';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { generateRiskReportPDF } from '../services/pdfGenerator';
import AnimatedNumber from '../components/AnimatedNumber';

const RiskDashboard = () => {
    const { villageId } = useParams();
    const navigate = useNavigate();

    const [riskData, setRiskData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMap, setShowMap] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchRiskData();
    }, [villageId]);

    const fetchRiskData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getVillageRisk(villageId);
            setRiskData(response.data);
        } catch (err) {
            console.error('Error fetching risk data:', err);
            setError('Failed to load risk assessment data. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
                <LoadingSpinner message="Loading risk assessment..." />
            </div>
        );
    }

    if (error || !riskData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
                <ErrorMessage
                    message={error || "Village data not found"}
                    onRetry={fetchRiskData}
                />
            </div>
        );
    }

    const riskColors = getRiskColor(riskData.overall_risk_score);
    const riskCategoryText = getRiskCategory(riskData.overall_risk_score);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg p-6 mb-6"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {riskData.village.name}
                            </h1>
                            <p className="text-gray-600">
                                {riskData.village.district} District, {riskData.village.state}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Last Updated: {new Date(riskData.last_updated).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors ripple-button"
                            >
                                <Home className="w-4 h-4" />
                                Home
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => generateRiskReportPDF(riskData)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors ripple-button"
                            >
                                <Download className="w-4 h-4" />
                                Export PDF
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => alert('Map download will be implemented')}
                                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors ripple-button"
                            >
                                <ImageIcon className="w-4 h-4" />
                                Download Map
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content - Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Left Column (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Map Section */}
                        {showMap && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Village Location & Risk Map
                                    </h2>
                                    <button
                                        onClick={() => setShowMap(false)}
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                                    >
                                        <EyeOff className="w-4 h-4" />
                                        Hide Map
                                    </button>
                                </div>

                                <MapComponent
                                    latitude={riskData.village.latitude || 11.127123}
                                    longitude={riskData.village.longitude || 78.656891}
                                    villageName={riskData.village.name}
                                    riskScore={riskData.overall_risk_score}
                                />
                            </div>
                        )}

                        {!showMap && (
                            <button
                                onClick={() => setShowMap(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                            >
                                <Eye className="w-5 h-5" />
                                Show Map
                            </button>
                        )}

                        {/* Overall Risk Score Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className={`${riskColors.bg} border-2 ${riskColors.border} rounded-xl shadow-lg p-8`}
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                                Overall Risk Score
                            </h2>

                            {/* Risk Meter - Circular Progress */}
                            <div className="flex items-center justify-center mb-6">
                                <div className="relative w-48 h-48">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="96"
                                            cy="96"
                                            r="88"
                                            fill="none"
                                            stroke="#e5e7eb"
                                            strokeWidth="16"
                                        />
                                        <motion.circle
                                            cx="96"
                                            cy="96"
                                            r="88"
                                            fill="none"
                                            stroke={riskColors.hex}
                                            strokeWidth="16"
                                            strokeDasharray="553"
                                            initial={{ strokeDashoffset: 553 }}
                                            animate={{ strokeDashoffset: 553 - (riskData.overall_risk_score / 100) * 553 }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <div className="text-5xl font-bold text-gray-900">
                                            <AnimatedNumber value={riskData.overall_risk_score} />
                                        </div>
                                        <span className="text-gray-600 text-lg">/ 100</span>
                                    </div>
                                </div>
                            </div>

                            {/* Risk Category Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                                className="text-center"
                            >
                                <span className={`inline-block ${riskColors.badge} text-white text-xl font-bold px-8 py-3 rounded-full shadow-md`}>
                                    {riskCategoryText} RISK
                                </span>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Right Column (1/3 width) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Individual Risk Cards */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                Individual Risk Breakdown
                            </h3>
                            {/* Detailed Individual Risks */}
                            {[
                                { label: 'Flood Risk', score: riskData.risk_scores.flood, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600' },
                                { label: 'Cyclone Risk', score: riskData.risk_scores.cyclone, bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600' },
                                { label: 'Rainfall Risk', score: riskData.risk_scores.rainfall, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
                                { label: 'Erosion Risk', score: riskData.risk_scores.erosion, bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600' }
                            ].map((risk, idx) => (
                                <motion.div
                                    key={risk.label}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + (idx * 0.1) }}
                                    className={`${risk.bg} border-2 ${risk.border} rounded-lg p-4 mb-3`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-900">{risk.label}</span>
                                        <span className={`text-2xl font-bold ${risk.text}`}>
                                            <AnimatedNumber value={risk.score} duration={1} />
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Environmental Data Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Environmental Data
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Sea Level Rise:</span>
                                <span className="font-semibold">{riskData.environmental.sea_level_rise}/10</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Cyclone Frequency:</span>
                                <span className="font-semibold">{riskData.environmental.cyclone_frequency}/10</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Storm Surge:</span>
                                <span className="font-semibold">{riskData.environmental.storm_surge_height}/10</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Erosion Rate:</span>
                                <span className="font-semibold">{riskData.environmental.erosion_rate}/10</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Extreme Rainfall:</span>
                                <span className="font-semibold">{riskData.environmental.extreme_rainfall}/10</span>
                            </div>
                        </div>
                    </div>

                    {/* Settlement Data Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Settlement Data
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Population Density:</span>
                                <span className="font-semibold">{riskData.settlement.population_density}/10</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Households:</span>
                                <span className="font-semibold">{riskData.settlement.households}/10</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Distance from Shore:</span>
                                <span className="font-semibold">{riskData.settlement.distance_from_shore}/10</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Infrastructure Score:</span>
                                <span className="font-semibold">{riskData.settlement.infrastructure_score}/10</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabbed Charts Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Detailed Risk Analysis
                </h2>

                {/* Tabs with Horizontal Scroll for Mobile */}
                <div className="flex overflow-x-auto pb-2 mb-6 border-b border-gray-200 scrollbar-hide -mx-2 px-2 scroll-smooth">
                    <div className="flex gap-2 min-w-max">
                        {[
                            { id: 'overview', label: 'Overview' },
                            { id: 'flood', label: 'Flood Risk' },
                            { id: 'cyclone', label: 'Cyclone Risk' },
                            { id: 'rainfall', label: 'Rainfall Risk' },
                            { id: 'erosion', label: 'Erosion Risk' },
                            { id: 'trends', label: 'Trends' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 sm:px-6 py-3 font-semibold transition-all whitespace-nowrap min-h-[44px] ${activeTab === tab.id
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-t-lg'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chart Content */}
                <RiskChartsTabView
                    activeTab={activeTab}
                    environmentalData={riskData.environmental}
                    settlementData={riskData.settlement}
                    historicalData={null} // Will be fetched from API later
                />
            </div>

            {/* Predict Future Risks Button */}
            <div className="text-center">
                <button
                    onClick={() => navigate(`/predictions/${villageId}`)}
                    className="bg-gradient-to-r from-blue-600 to-teal-600 text-white text-lg font-bold py-4 px-12 rounded-full hover:shadow-2xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-3"
                >
                    <TrendingUp className="w-6 h-6" />
                    Predict Future Risks (10-14 Days)
                </button>
            </div>
        </div>
    );
};

export default RiskDashboard;
