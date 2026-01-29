import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, TrendingUp, AlertTriangle, DollarSign,
    Users, Calendar, Shield, Sliders, RefreshCw, Zap
} from 'lucide-react';
import { getPredictions, getVillageRisk } from '../services/api';
import { getRiskColor, getRiskCategory } from '../utils/riskColors';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import AnimatedNumber from '../components/AnimatedNumber';
import { generatePredictionReportPDF } from '../services/pdfGenerator';
import { Download } from 'lucide-react';

const PredictionModule = () => {
    const { villageId } = useParams();
    const navigate = useNavigate();

    const [predictions, setPredictions] = useState(null);
    const [villageInfo, setVillageInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Simulation state
    const [simMode, setSimMode] = useState(false);
    const [simParams, setSimParams] = useState({
        slr: null,
        rainfall: null,
        erosion: null,
        surge: null
    });

    useEffect(() => {
        fetchData();
    }, [villageId, simMode]);

    // Effect for simulation updates
    useEffect(() => {
        if (simMode) {
            const timer = setTimeout(() => {
                fetchData(true);
            }, 500); // Debounce
            return () => clearTimeout(timer);
        }
    }, [simParams]);

    const fetchData = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            setError(null);

            const params = simMode ? simParams : {};

            const [predResponse, villageResponse] = await Promise.all([
                getPredictions(villageId, params),
                getVillageRisk(villageId)
            ]);
            setPredictions(predResponse.data);
            setVillageInfo(villageResponse.data);

            // Initialize simulation params to start from 1
            if (!isBackground && villageResponse.data) {
                setSimParams({
                    slr: 1,
                    rainfall: 1,
                    erosion: 1,
                    surge: 1
                });
            }
        } catch (err) {
            console.error('Error fetching predictions:', err);
            setError('Failed to load prediction data. Please check your connection and try again.');
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
                <LoadingSpinner message="Loading predictions..." />
            </div>
        );
    }

    if (error || !predictions || !villageInfo) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
                <ErrorMessage
                    message={error || "Prediction data not available"}
                    onRetry={fetchData}
                />
            </div>
        );
    }

    // Calculate averages and derived data from forecast
    const forecast = predictions.forecast;
    const avgFlood = forecast.reduce((acc, curr) => acc + curr.flood_probability, 0) / forecast.length;
    const avgCyclone = forecast.reduce((acc, curr) => acc + curr.cyclone_probability, 0) / forecast.length;
    const avgRainfall = forecast.reduce((acc, curr) => acc + curr.rainfall_probability, 0) / forecast.length;
    const avgErosion = forecast.reduce((acc, curr) => acc + curr.erosion_probability, 0) / forecast.length;

    const highRiskDaysList = forecast.filter(day => day.predicted_risk_score > 60);
    const highestRiskDay = forecast.reduce((max, day) =>
        day.predicted_risk_score > max.predicted_risk_score ? day : max
    );

    // Find disaster type with highest probability
    const disasterTypes = [
        { name: 'Flood', probability: Math.round(avgFlood * 100), icon: '🌊' },
        { name: 'Cyclone', probability: Math.round(avgCyclone * 100), icon: '🌀' },
        { name: 'Rainfall', probability: Math.round(avgRainfall * 100), icon: '🌧️' },
        { name: 'Erosion', probability: Math.round(avgErosion * 100), icon: '⚠️' }
    ];
    const highestRisk = disasterTypes.reduce((max, type) =>
        type.probability > max.probability ? type : max
    );

    // Calculate dynamic impact scores based on actual prediction data
    const avgRiskScore = forecast.reduce((acc, curr) => acc + curr.predicted_risk_score, 0) / forecast.length;

    // Economic Impact - based on average risk and village data
    const dynamicEconomicImpact = Math.min(10, Math.round((avgRiskScore / 10)));
    const baseCostPerHousehold = 0.5; // Crores
    const totalHouseholds = villageInfo.settlement?.households || 1000;
    const riskMultiplier = dynamicEconomicImpact / 10;
    const minCost = Math.round(totalHouseholds * baseCostPerHousehold * riskMultiplier);
    const maxCost = Math.round(totalHouseholds * baseCostPerHousehold * riskMultiplier * 1.5);

    // Community Impact - based on population density and risk
    const populationDensity = villageInfo.settlement?.population_density || 5;
    const dynamicCommunityImpact = Math.min(10, Math.round((populationDensity * avgRiskScore) / 100));
    const avgPeoplePerHousehold = 5;
    const totalPopulation = totalHouseholds * avgPeoplePerHousehold;
    const populationAtRisk = Math.round(totalPopulation * (dynamicCommunityImpact / 10));
    const householdsAtRisk = Math.round(populationAtRisk / avgPeoplePerHousehold);
    const elderlyAtRisk = Math.round(populationAtRisk * 0.14); // 14% elderly
    const childrenAtRisk = Math.round(populationAtRisk * 0.28); // 28% children
    const disabledAtRisk = Math.round(populationAtRisk * 0.03); // 3% disabled

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                                10-14 Day Risk Forecast
                                {simMode && (
                                    <span className="text-sm bg-orange-100 text-orange-600 px-3 py-1 rounded-full animate-pulse border border-orange-200">
                                        SIMULATION ACTIVE
                                    </span>
                                )}
                            </h1>
                            <p className="text-gray-600">
                                {villageInfo.village.name}, {villageInfo.village.district}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Forecast Period: {new Date().toLocaleDateString()} - {
                                    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()
                                }
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(`/dashboard/${villageId}`)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => generatePredictionReportPDF(villageInfo, predictions)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg"
                            >
                                <Download className="w-4 h-4" />
                                Export Prediction PDF
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Simulation Controls */}
                <div className={`bg-white rounded-xl shadow-lg p-6 mb-6 border-2 transition-all duration-300 ${simMode ? 'border-orange-500 ring-2 ring-orange-200' : 'border-transparent'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${simMode ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Scenario Simulator</h2>
                                <p className="text-sm text-gray-500">Test how risk changes under different conditions</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                if (simMode) {
                                    setSimMode(false);
                                    fetchData(); // Reset
                                    toast.success('Simulation stopped. Data reset to baseline.');
                                } else {
                                    setSimMode(true);
                                    toast.loading('Launching simulator...', { duration: 2000 });
                                }
                            }}
                            className={`px-6 py-2 rounded-full font-bold transition-all ripple-button ${simMode
                                ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-200 shadow-lg'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 shadow-lg'}`}
                        >
                            {simMode ? 'Stop Simulation' : 'Launch Simulator'}
                        </button>
                    </div>

                    {simMode && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in">
                            {[
                                { id: 'slr', label: 'Sea Level Rise', min: 1, max: 10, unit: 'mm/y', icon: '🌊' },
                                { id: 'rainfall', label: 'Rainfall Intensity', min: 1, max: 10, unit: 'mm', icon: '🌧️' },
                                { id: 'surge', label: 'Storm Surge', min: 1, max: 10, unit: 'm', icon: '🚢' },
                                { id: 'erosion', label: 'Erosion Level', min: 1, max: 10, unit: 'cm/yr', icon: '⚠️' }
                            ].map((param) => (
                                <div key={param.id} className="space-y-3">
                                    <div className="flex justify-between text-sm font-semibold">
                                        <label className="text-gray-700 flex items-center gap-2">
                                            <span>{param.icon}</span> {param.label}
                                        </label>
                                        <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{simParams[param.id]}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={param.min}
                                        max={param.max}
                                        step="0.1"
                                        value={simParams[param.id]}
                                        onChange={(e) => setSimParams({ ...simParams, [param.id]: parseFloat(e.target.value) })}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                    />
                                    <div className="flex justify-between text-[10px] text-gray-400">
                                        <span>LOW</span>
                                        <span>HIGH</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 14-Day Forecast Calendar */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Calendar className="w-6 h-6" />
                        14-Day Forecast Calendar
                    </h2>

                    <div className="overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
                        <div className="flex gap-4 min-w-max pb-2">
                            {forecast.map((day, index) => {
                                const colors = getRiskColor(day.predicted_risk_score);
                                const category = getRiskCategory(day.predicted_risk_score);
                                const date = new Date(day.for_date);

                                return (
                                    <div
                                        key={index}
                                        className={`${colors.bg} border-2 ${colors.border} rounded-lg p-4 text-center transition-transform hover:scale-105 w-[140px] flex-shrink-0`}
                                    >
                                        <div className="text-sm font-semibold text-gray-600 mb-2">
                                            Day {index + 1}
                                        </div>
                                        <div className="text-xs text-gray-500 mb-3">
                                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900 mb-2">
                                            {Math.round(day.predicted_risk_score)}
                                        </div>
                                        <div className={`${colors.badge} text-white text-[10px] font-bold px-1 py-1 rounded leading-none`}>
                                            {category}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Risk Probability Trend Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Risk Probability Trend
                    </h2>

                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart
                            data={forecast.map((day, index) => ({
                                day: `Day ${index + 1}`,
                                riskScore: Math.round(day.predicted_risk_score)
                            }))}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <ReferenceLine
                                y={60}
                                label="High Risk Threshold"
                                stroke="red"
                                strokeDasharray="5 5"
                            />
                            <Line
                                type="monotone"
                                dataKey="riskScore"
                                stroke="#3B82F6"
                                strokeWidth={3}
                                dot={{ r: 5 }}
                                activeDot={{ r: 7 }}
                                name="Risk Score"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Disaster Type Probability Breakdown */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Disaster Type Probability Breakdown
                    </h2>

                    <div className="space-y-4">
                        {disasterTypes.map((type, index) => (
                            <div key={index}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-gray-900 flex items-center gap-2">
                                        <span className="text-2xl">{type.icon}</span>
                                        {type.name} Risk
                                    </span>
                                    <span className="text-lg font-bold text-gray-900">
                                        <AnimatedNumber value={type.probability} duration={1} />%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${type.probability}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`h-4 rounded-full ${type.probability >= 80 ? 'bg-red-500' :
                                            type.probability >= 60 ? 'bg-orange-500' :
                                                type.probability >= 40 ? 'bg-yellow-500' :
                                                    'bg-green-500'
                                            }`}
                                    ></motion.div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Highest Risk Alert */}
                <div className="bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300 rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                        Which Risk is Highest?
                    </h2>

                    <div className="bg-white rounded-lg p-6">
                        <div className="text-center mb-4">
                            <span className="text-6xl">{highestRisk.icon}</span>
                        </div>
                        <h3 className="text-3xl font-bold text-center text-gray-900 mb-4">
                            {highestRisk.name.toUpperCase()} RISK - {highestRisk.probability}% Probability
                        </h3>
                        <div className="space-y-2 text-gray-700">
                            <p className="flex items-start gap-2">
                                <span className="text-red-600">•</span>
                                <span>Peaks on Day {forecast.indexOf(highestRiskDay) + 1} (Risk Score: {Math.round(highestRiskDay.predicted_risk_score)})</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-red-600">•</span>
                                <span>Remains high from Day {Math.max(1, forecast.indexOf(highestRiskDay) - 1)} to Day {Math.min(14, forecast.indexOf(highestRiskDay) + 3)}</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-red-600">•</span>
                                <span>Combined environmental factors increase overall vulnerability</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-red-600">•</span>
                                <span className="font-semibold text-red-600">Immediate preparedness recommended</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* "MONEY vs PEOPLE" Impact View */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        "Money vs People" Impact Analysis
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Economic Impact Card */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-300 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-green-600 w-14 h-14 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    Economic Impact
                                </h3>
                            </div>

                            {/* Impact Score */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-700 font-semibold">Impact Score</span>
                                    <span className="text-3xl font-bold text-green-700">
                                        <AnimatedNumber value={dynamicEconomicImpact} duration={1} />/10
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${dynamicEconomicImpact * 10}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="bg-green-600 h-3 rounded-full"
                                    ></motion.div>
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="space-y-3">
                                <div>
                                    <p className="font-semibold text-gray-900 mb-1">Infrastructure Damage:</p>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                        <li>Roads: {dynamicEconomicImpact >= 7 ? 'High' : dynamicEconomicImpact >= 4 ? 'Moderate' : 'Low'}</li>
                                        <li>Buildings: {dynamicEconomicImpact >= 7 ? 'High' : dynamicEconomicImpact >= 4 ? 'Moderate' : 'Low'}</li>
                                        <li>Utilities: {dynamicEconomicImpact >= 7 ? 'High' : dynamicEconomicImpact >= 4 ? 'Moderate' : 'Low'}</li>
                                    </ul>
                                </div>

                                <div>
                                    <p className="font-semibold text-gray-900 mb-1">Estimated Cost:</p>
                                    <p className="text-gray-700">
                                        ₹{minCost}-{maxCost} Crores
                                    </p>
                                </div>

                                <div>
                                    <p className="font-semibold text-gray-900 mb-1">Recovery Time:</p>
                                    <p className="text-gray-700">
                                        {dynamicEconomicImpact >= 7 ? '9-15 months' :
                                            dynamicEconomicImpact >= 4 ? '6-9 months' : '3-6 months'}
                                    </p>
                                </div>

                                <div>
                                    <p className="font-semibold text-gray-900 mb-1">Critical Infrastructure at Risk:</p>
                                    <ul className="list-disc list-inside text-gray-700 text-sm">
                                        <li>2-3 schools</li>
                                        <li>1 health center</li>
                                        <li>Main road network</li>
                                        <li>Power distribution</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Community Impact Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-blue-600 w-14 h-14 rounded-lg flex items-center justify-center">
                                    <Users className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    Community Impact
                                </h3>
                            </div>

                            {/* Impact Score */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-700 font-semibold">Impact Score</span>
                                    <span className="text-3xl font-bold text-blue-700">
                                        <AnimatedNumber value={dynamicCommunityImpact} duration={1} />/10
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${dynamicCommunityImpact * 10}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="bg-blue-600 h-3 rounded-full"
                                    ></motion.div>
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="space-y-3">
                                <div>
                                    <p className="font-semibold text-gray-900 mb-1">Population at Risk:</p>
                                    <p className="text-gray-700">
                                        {populationAtRisk.toLocaleString()} people
                                    </p>
                                </div>

                                <div>
                                    <p className="font-semibold text-gray-900 mb-1">Households at Risk:</p>
                                    <p className="text-gray-700">
                                        {householdsAtRisk.toLocaleString()} households
                                    </p>
                                </div>

                                <div>
                                    <p className="font-semibold text-gray-900 mb-1">Vulnerable Groups:</p>
                                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                        <li>Elderly: {elderlyAtRisk.toLocaleString()} people</li>
                                        <li>Children: {childrenAtRisk.toLocaleString()} people</li>
                                        <li>Disabled: {disabledAtRisk.toLocaleString()} people</li>
                                    </ul>
                                </div>

                                <div>
                                    <p className="font-semibold text-gray-900 mb-1">Healthcare Access:</p>
                                    <p className="text-gray-700">
                                        {dynamicCommunityImpact >= 7 ? 'Limited (Primary Health Center 15km away)' :
                                            dynamicCommunityImpact >= 4 ? 'Moderate (Clinic 8km away)' :
                                                'Good (Health center within 3km)'}
                                    </p>
                                </div>

                                <div>
                                    <p className="font-semibold text-gray-900 mb-1">Evacuation Needs:</p>
                                    <ul className="list-disc list-inside text-gray-700 text-sm">
                                        <li>Shelters available: 3</li>
                                        <li>Capacity: {Math.round(populationAtRisk * 0.6).toLocaleString()} people</li>
                                        <li>Additional needed: {Math.round(populationAtRisk * 0.4).toLocaleString()} people</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* High-Risk Days Alert */}
                {highRiskDaysList.length > 0 && (
                    <div className="bg-red-50 border-2 border-red-300 rounded-xl shadow-lg p-6 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                            High-Risk Days Alert
                        </h2>

                        <div className="bg-white rounded-lg p-4 space-y-3">
                            {highRiskDaysList.map((day, index) => {
                                const dayNumber = forecast.indexOf(day) + 1;
                                const date = new Date(day.for_date);
                                const primaryRisk = day.flood_probability > day.cyclone_probability &&
                                    day.flood_probability > day.rainfall_probability ?
                                    'Flood' : day.cyclone_probability > day.rainfall_probability ?
                                        'Cyclone' : 'Rainfall';

                                return (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle className="w-5 h-5 text-red-600" />
                                            <div>
                                                <span className="font-semibold text-gray-900">
                                                    Day {dayNumber} ({date.toLocaleDateString()})
                                                </span>
                                                <span className="mx-2">•</span>
                                                <span className="text-red-600 font-bold">
                                                    Score: {Math.round(day.predicted_risk_score)}
                                                </span>
                                                <span className="mx-2">•</span>
                                                <span className="text-gray-700">
                                                    Primary Risk: {primaryRisk}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                            <p className="text-gray-800 font-semibold">
                                ⚠️ Recommendation: Review safety preparations and evacuation plans for the highlighted days.
                            </p>
                        </div>
                    </div>
                )}

                {/* View Safety Measures Button */}
                <div className="text-center">
                    <button
                        onClick={() => navigate(`/safety/${villageId}`)}
                        className="bg-gradient-to-r from-orange-600 to-red-600 text-white text-lg font-bold py-4 px-12 rounded-full hover:shadow-2xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-3"
                    >
                        <Shield className="w-6 h-6" />
                        View Safety Measures & Evacuation Plans
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PredictionModule;
