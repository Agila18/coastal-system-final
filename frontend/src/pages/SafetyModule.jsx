import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Download, Share2, AlertTriangle, Shield,
    Phone, MapPin, Building, Users, FileText, Home, TrendingUp
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { getVillageRisk } from '../services/api';
import { getRiskColor, getRiskCategory } from '../utils/riskColors';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { generateSafetyGuidePDF } from '../services/pdfGenerator';

const SafetyModule = () => {
    const { villageId } = useParams();
    const navigate = useNavigate();

    const [villageData, setVillageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('preparedness');

    useEffect(() => {
        fetchVillageData();
    }, [villageId]);

    const fetchVillageData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getVillageRisk(villageId);
            setVillageData(response.data);
        } catch (err) {
            console.error('Error fetching village data:', err);
            setError('Failed to load safety information. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
                <LoadingSpinner message="Loading safety information..." />
            </div>
        );
    }

    if (error || !villageData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
                <ErrorMessage
                    message={error || "Village data not found"}
                    onRetry={fetchVillageData}
                />
            </div>
        );
    }

    const riskColors = getRiskColor(villageData.overall_risk_score);
    const riskCategory = getRiskCategory(villageData.overall_risk_score);

    // Determine primary risk type
    const risks = [
        { type: 'Flood', score: villageData.risk_scores.flood },
        { type: 'Cyclone', score: villageData.risk_scores.cyclone },
        { type: 'Rainfall', score: villageData.risk_scores.rainfall },
        { type: 'Erosion', score: villageData.risk_scores.erosion }
    ];
    const primaryRisk = risks.reduce((max, risk) =>
        risk.score > max.score ? risk : max
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">


            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl shadow-lg p-6 mb-6"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                                <Shield className="w-8 h-8 text-blue-600" />
                                Safety & Preparedness Guide
                            </h1>
                            <p className="text-gray-600">
                                {villageData.village.name}, {villageData.village.district}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-sm text-gray-500">Current Risk Level:</span>
                                <span className={`${riskColors.badge} text-white text-sm font-bold px-3 py-1 rounded shadow-sm`}>
                                    {riskCategory}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(`/dashboard/${villageId}`)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors ripple-button"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => generateSafetyGuidePDF(villageData)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors ripple-button"
                            >
                                <Download className="w-4 h-4" />
                                Download Guide
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => alert('Share functionality will be implemented')}
                                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors ripple-button"
                            >
                                <Share2 className="w-4 h-4" />
                                Share
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs with Horizontal Scroll for Mobile */}
                <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
                    <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide scroll-smooth">
                        <div className="flex min-w-max">
                            {[
                                { id: 'preparedness', label: 'Preparedness', icon: FileText },
                                { id: 'evacuation', label: 'Evacuation', icon: MapPin },
                                { id: 'resources', label: 'Emergency Resources', icon: Phone }
                            ].map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all whitespace-nowrap min-h-[56px] ${activeTab === tab.id
                                            ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* Preparedness Tab */}
                        {activeTab === 'preparedness' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className={`${riskColors.bg} border-2 ${riskColors.border} rounded-lg p-6 hover-lift transition-all duration-300`}>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <AlertTriangle className="w-6 h-6" />
                                        PRIMARY RISK: {primaryRisk.type.toUpperCase()}
                                    </h2>
                                    <p className="text-gray-700">
                                        Based on current assessment, {primaryRisk.type.toLowerCase()} poses the highest risk to your village.
                                        Follow the preparedness measures below carefully.
                                    </p>
                                </div>

                                {/* Immediate Actions */}
                                <div className="bg-white border-2 border-orange-300 rounded-xl p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        IMMEDIATE ACTIONS (Next 24-48 hours):
                                    </h3>
                                    <div className="space-y-2">
                                        {[
                                            'Secure all outdoor items and furniture',
                                            'Clear roof drainage and gutters',
                                            'Stock 3-day water supply (15L per person)',
                                            'Charge all electronic devices and power banks',
                                            'Prepare emergency kit (see checklist below)',
                                            'Identify safest room in your home (highest floor, away from windows)',
                                            'Review evacuation routes with family members',
                                            'Fill vehicle fuel tanks'
                                        ].map((action, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * index }}
                                                className="flex items-start gap-2 hover:bg-orange-50 p-1 rounded transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="mt-1 w-5 h-5 text-blue-600 rounded"
                                                    id={`action-${index}`}
                                                />
                                                <label htmlFor={`action-${index}`} className="text-gray-700 cursor-pointer flex-grow">
                                                    {action}
                                                </label>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Emergency Kit Checklist */}
                                <div className="bg-white border-2 border-blue-300 rounded-xl p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        EMERGENCY KIT CHECKLIST:
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            'First aid supplies and medications (7-day supply)',
                                            'Flashlights and extra batteries',
                                            'Important documents in waterproof bag',
                                            'Cash (ATMs may not work)',
                                            'Non-perishable food (3 days minimum)',
                                            'Drinking water (3L per person per day)',
                                            'Water purification tablets',
                                            'Mobile phone + charger + power bank',
                                            'Whistle for signaling help',
                                            'Warm clothes and blankets',
                                            'Toiletries and sanitation items',
                                            'Battery-powered radio'
                                        ].map((item, index) => (
                                            <div key={index} className="flex items-start gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="mt-1 w-5 h-5 text-blue-600"
                                                    id={`kit-${index}`}
                                                />
                                                <label htmlFor={`kit-${index}`} className="text-gray-700 text-sm cursor-pointer">
                                                    {item}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Property Protection */}
                                <div className="bg-white border-2 border-green-300 rounded-xl p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        PROPERTY PROTECTION:
                                    </h3>
                                    <ul className="space-y-2 text-gray-700">
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-600">•</span>
                                            <span>Move valuables and electronics to upper floors</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-600">•</span>
                                            <span>Use sandbags to block vulnerable entry points</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-600">•</span>
                                            <span>Disconnect electrical appliances</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-600">•</span>
                                            <span>Know how to shut off water, gas, and electricity</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-600">•</span>
                                            <span>Board up windows if cyclone warning issued</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-600">•</span>
                                            <span>Trim trees near house (if time permits)</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Communication Plan */}
                                <div className="bg-white border-2 border-purple-300 rounded-xl p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        COMMUNICATION PLAN:
                                    </h3>
                                    <ul className="space-y-2 text-gray-700">
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-600">•</span>
                                            <span>Designate an out-of-area emergency contact person</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-600">•</span>
                                            <span>Share evacuation plans with all family members</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-600">•</span>
                                            <span>Keep emergency contact list accessible (written copy)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-600">•</span>
                                            <span>Register for SMS weather alerts (Text ALERT to 51234)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-600">•</span>
                                            <span>Follow official social media accounts for updates</span>
                                        </li>
                                    </ul>
                                </div>
                            </motion.div>
                        )}

                        {/* Evacuation Tab */}
                        {activeTab === 'evacuation' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* When to Evacuate */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-red-50 border-2 border-red-300 rounded-xl p-6"
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <AlertTriangle className="w-6 h-6 text-red-600" />
                                        WHEN TO EVACUATE:
                                    </h3>
                                    <div className="space-y-3 text-gray-800">
                                        {[
                                            { icon: '🚨', text: 'Immediate evacuation if risk score exceeds 75' },
                                            { icon: '🚨', text: 'When official evacuation order is issued by authorities' },
                                            { icon: '🚨', text: 'If flooding begins or water levels rise rapidly' },
                                            { icon: '🚨', text: 'If your home structure becomes unsafe' }
                                        ].map((item, idx) => (
                                            <motion.p
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * idx }}
                                                className="flex items-start gap-2"
                                            >
                                                <span className="text-red-600 font-bold">{item.icon}</span>
                                                <span className="font-semibold">{item.text}</span>
                                            </motion.p>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Evacuation Centers */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white border-2 border-blue-300 rounded-xl p-6"
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Building className="w-6 h-6" />
                                        NEAREST EVACUATION CENTERS:
                                    </h3>

                                    {/* Placeholder map */}
                                    <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-6">
                                        <p className="text-gray-500">Map showing evacuation centers will be displayed here</p>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            {
                                                name: 'Government High School',
                                                distance: '2.5 km',
                                                capacity: '3,000',
                                                contact: '044-1234-5678',
                                                facilities: ['Clean water', 'Medical aid', 'Food supplies']
                                            },
                                            {
                                                name: 'Community Hall',
                                                distance: '3.1 km',
                                                capacity: '2,500',
                                                contact: '044-1234-5679',
                                                facilities: ['Generator', 'Sanitation', 'Communication']
                                            },
                                            {
                                                name: 'District Collectorate',
                                                distance: '8.2 km',
                                                capacity: '5,000',
                                                contact: '044-1234-5680',
                                                facilities: ['Full facilities', 'Security', 'Transport']
                                            }
                                        ].map((center, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * index }}
                                                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-gray-900 text-lg">{index + 1}. {center.name}</h4>
                                                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                                        {center.distance}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-2">
                                                    <p><span className="font-semibold">Capacity:</span> {center.capacity} people</p>
                                                    <p><span className="font-semibold">Contact:</span> {center.contact}</p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {center.facilities.map((facility, idx) => (
                                                        <span key={idx} className="bg-white text-blue-700 text-xs px-2 py-1 rounded border border-blue-200">
                                                            ✓ {facility}
                                                        </span>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Evacuation Routes */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-white border-2 border-green-300 rounded-xl p-6"
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        EVACUATION ROUTES:
                                    </h3>
                                    <ul className="space-y-2 text-gray-700">
                                        {[
                                            { color: 'text-green-600', text: '<strong>Primary Route:</strong> Via Main Road → Highway 45 (recommended)' },
                                            { color: 'text-green-600', text: '<strong>Secondary Route:</strong> Beach Road → Connect to NH-45' },
                                            { color: 'text-red-600', text: '<strong>Avoid:</strong> Low-lying areas, temporary bridges, and flooded regions' }
                                        ].map((item, idx) => (
                                            <motion.li
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * idx }}
                                                className="flex items-start gap-2"
                                            >
                                                <span className={item.color}>•</span>
                                                <span dangerouslySetInnerHTML={{ __html: item.text }} />
                                            </motion.li>
                                        ))}
                                    </ul>
                                </motion.div>

                                {/* Transportation */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-white border-2 border-purple-300 rounded-xl p-6"
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        TRANSPORTATION OPTIONS:
                                    </h3>
                                    <div className="space-y-3 text-gray-700">
                                        {[
                                            { text: '<strong>Government Buses:</strong> Starting from 6:00 AM from village square' },
                                            { text: '<strong>Emergency Vehicles:</strong> Call 1078 (Disaster Management Helpline)' },
                                            { text: '<strong>Private Vehicles:</strong> Follow designated routes only' },
                                            { text: '<strong>For Disabled/Elderly:</strong> Request priority transport at 1078' }
                                        ].map((item, idx) => (
                                            <motion.p
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * idx }}
                                                className="flex items-start gap-2"
                                            >
                                                <span className="text-purple-600">•</span>
                                                <span dangerouslySetInnerHTML={{ __html: item.text }} />
                                            </motion.p>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* What to Bring */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-white border-2 border-orange-300 rounded-xl p-6"
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        WHAT TO BRING DURING EVACUATION:
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            'Emergency kit (prepared earlier)',
                                            'ID cards and important documents',
                                            'Medications (7-day supply)',
                                            'Change of clothes (2-3 sets)',
                                            'Blankets and sleeping mats',
                                            'Mobile phone and charger',
                                            'Cash and bank cards',
                                            'Baby supplies (if applicable)',
                                            'Prescription glasses/hearing aids',
                                            'Toiletries and sanitation items'
                                        ].map((item, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.05 * index }}
                                                className="flex items-start gap-2"
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="mt-1 w-4 h-4 text-orange-600"
                                                    id={`evac-${index}`}
                                                />
                                                <label htmlFor={`evac-${index}`} className="text-gray-700 text-sm cursor-pointer">
                                                    {item}
                                                </label>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Family Meeting Points */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="bg-white border-2 border-teal-300 rounded-xl p-6"
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        FAMILY MEETING POINTS:
                                    </h3>
                                    <ol className="space-y-2 text-gray-700 list-decimal list-inside">
                                        {[
                                            '<strong>First Point:</strong> Outside your home (for minor emergencies)',
                                            '<strong>Second Point:</strong> Neighborhood gathering spot (village square/temple)',
                                            '<strong>Third Point:</strong> Primary evacuation center (Government High School)'
                                        ].map((item, idx) => (
                                            <motion.li
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * idx }}
                                                dangerouslySetInnerHTML={{ __html: item }}
                                            />
                                        ))}
                                    </ol>
                                    <p className="mt-4 text-sm text-gray-600">
                                        Make sure all family members know these locations and have contact information.
                                    </p>
                                </motion.div>

                                {/* Pets & Animals */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.7 }}
                                    className="bg-white border-2 border-pink-300 rounded-xl p-6"
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        PETS & ANIMALS:
                                    </h3>
                                    <ul className="space-y-2 text-gray-700">
                                        {[
                                            'Keep carriers and leashes ready',
                                            'Pack 3-day food and water supply for pets',
                                            'Carry vaccination records and medications',
                                            'Contact Animal Welfare: 1962 for assistance',
                                            'For livestock: Contact local veterinary office'
                                        ].map((item, idx) => (
                                            <motion.li
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * idx }}
                                                className="flex items-start gap-2"
                                            >
                                                <span className="text-pink-600">•</span>
                                                <span>{item}</span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Emergency Resources Tab */}
                        {activeTab === 'resources' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Emergency Contact Numbers */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-red-50 border-2 border-red-300 rounded-xl p-6"
                                >
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <Phone className="w-6 h-6 text-red-600" />
                                        EMERGENCY CONTACT NUMBERS
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* National Emergency */}
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-3 text-lg">National Emergency:</h4>
                                            <div className="space-y-2">
                                                {[
                                                    { name: 'Disaster Management', number: '1078' },
                                                    { name: 'Police', number: '100' },
                                                    { name: 'Ambulance', number: '108' },
                                                    { name: 'Fire Service', number: '101' },
                                                    { name: 'Women Helpline', number: '1091' },
                                                    { name: 'Child Helpline', number: '1098' }
                                                ].map((contact, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.05 * index }}
                                                        className="bg-white rounded-lg p-3 flex justify-between items-center"
                                                    >
                                                        <span className="text-gray-700">{contact.name}</span>
                                                        <a
                                                            href={`tel:${contact.number}`}
                                                            className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700"
                                                        >
                                                            {contact.number}
                                                        </a>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* State/District */}
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-3 text-lg">State/District Authorities:</h4>
                                            <div className="space-y-2">
                                                {[
                                                    { name: 'State Control Room', number: '044-2345-6789' },
                                                    { name: 'District Collector', number: '044-2345-6790' },
                                                    { name: 'Tahsildar Office', number: '044-2345-6791' },
                                                    { name: 'Block Development Officer', number: '044-2345-6792' },
                                                    { name: 'Revenue Inspector', number: '044-2345-6793' }
                                                ].map((contact, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.05 * index }}
                                                        className="bg-white rounded-lg p-3 flex justify-between items-center"
                                                    >
                                                        <span className="text-gray-700 text-sm">{contact.name}</span>
                                                        <a
                                                            href={`tel:${contact.number}`}
                                                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-blue-700"
                                                        >
                                                            {contact.number}
                                                        </a>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                        {/* Marine & Coast */}
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-3 text-lg">Marine & Coast Guard:</h4>
                                            <div className="space-y-2">
                                                {[
                                                    { name: 'Coast Guard', number: '1554' },
                                                    { name: 'Marine Police', number: '044-2345-6794' },
                                                    { name: 'Fisheries Department', number: '044-2345-6795' }
                                                ].map((contact, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.05 * index }}
                                                        className="bg-white rounded-lg p-3 flex justify-between items-center"
                                                    >
                                                        <span className="text-gray-700">{contact.name}</span>
                                                        <a
                                                            href={`tel:${contact.number}`}
                                                            className="bg-teal-600 text-white px-4 py-2 rounded font-bold hover:bg-teal-700"
                                                        >
                                                            {contact.number}
                                                        </a>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Weather & Alerts */}
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-3 text-lg">Weather & Alerts:</h4>
                                            <div className="space-y-2">
                                                {[
                                                    { name: 'IMD Chennai', number: '044-2345-6796' },
                                                    { name: 'Cyclone Warning Center', number: '044-2345-6797' }
                                                ].map((contact, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.05 * index }}
                                                        className="bg-white rounded-lg p-3 flex justify-between items-center"
                                                    >
                                                        <span className="text-gray-700">{contact.name}</span>
                                                        <a
                                                            href={`tel:${contact.number}`}
                                                            className="bg-orange-600 text-white px-4 py-2 rounded font-bold hover:bg-orange-700"
                                                        >
                                                            {contact.number}
                                                        </a>
                                                    </motion.div>
                                                ))}
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.05 * 2 }}
                                                    className="bg-white rounded-lg p-3"
                                                >
                                                    <p className="text-sm text-gray-700 mb-2">📱 <strong>SMS Alerts:</strong></p>
                                                    <p className="text-sm text-gray-600">Text <code className="bg-gray-100 px-2 py-1 rounded">ALERT</code> to <strong>51234</strong></p>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </div>

                                </motion.div>

                                {/* Nearby Facilities */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white border-2 border-blue-300 rounded-xl p-6"
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <MapPin className="w-6 h-6" />
                                        NEARBY FACILITIES:
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Hospitals */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">🏥 Hospitals & Health Centers:</h4>
                                            <ul className="space-y-2 text-sm text-gray-700">
                                                {[
                                                    '• District Hospital - 8 km (044-2345-6800)',
                                                    '• Primary Health Center - 3 km (044-2345-6801)',
                                                    '• Private Clinic - 5 km (044-2345-6802)'
                                                ].map((item, idx) => (
                                                    <motion.li
                                                        key={idx}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.05 * idx }}
                                                    >
                                                        {item}
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Government Offices */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">🏛️ Government Offices:</h4>
                                            <ul className="space-y-2 text-sm text-gray-700">
                                                {[
                                                    '• Panchayat Office - 1 km (044-2345-6803)',
                                                    '• Police Station - 4 km (044-2345-6804)',
                                                    '• Post Office - 2 km (044-2345-6805)'
                                                ].map((item, idx) => (
                                                    <motion.li
                                                        key={idx}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.05 * idx }}
                                                    >
                                                        {item}
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="mt-4 bg-gray-50 rounded-lg p-4"
                                    >
                                        <p className="text-sm text-gray-600">
                                            📍 View detailed map of all facilities in the Evacuation tab
                                        </p>
                                    </motion.div>
                                </motion.div>

                                {/* NGO Support */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-white border-2 border-green-300 rounded-xl p-6"
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        NGO & COMMUNITY SUPPORT:
                                    </h3>
                                    <div className="space-y-3 text-gray-700">
                                        {[
                                            { text: '<strong>Red Cross:</strong> 044-2345-6810' },
                                            { text: '<strong>Local NGO Network:</strong> 044-2345-6811' },
                                            { text: '<strong>Volunteer Coordination:</strong> 044-2345-6812' },
                                            { text: '<strong>Food Distribution Center:</strong> 044-2345-6813' }
                                        ].map((item, idx) => (
                                            <motion.p
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.05 * idx }}
                                                className="flex items-start gap-2"
                                            >
                                                <span className="text-green-600">•</span>
                                                <span dangerouslySetInnerHTML={{ __html: item.text }} />
                                            </motion.p>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Government Relief */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-white border-2 border-purple-300 rounded-xl p-6"
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        GOVERNMENT RELIEF PROGRAMS:
                                    </h3>
                                    <div className="space-y-3">
                                        {[
                                            { title: '📋 Relief Fund Application', description: 'Visit District Collectorate or apply online at disaster.gov.in' },
                                            { title: '💰 Compensation Scheme', description: 'Check eligibility at revenue office within 15 days of disaster' },
                                            { title: '🏠 Temporary Shelter Program', description: 'Contact Social Welfare Department: 044-2345-6814' }
                                        ].map((item, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.05 * idx }}
                                                className="bg-purple-50 rounded-lg p-4"
                                            >
                                                <p className="font-semibold text-gray-900 mb-2">{item.title}</p>
                                                <p className="text-sm text-gray-600">{item.description}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Quick Action Buttons */}
                                <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl shadow-lg p-6">
                                    <h3 className="text-xl font-bold text-white mb-4 text-center">
                                        QUICK ACTIONS
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {[
                                            { href: 'tel:1078', icon: Phone, text: 'Call Emergency', color: 'text-red-600' },
                                            { onClick: () => alert('Location sharing will be implemented'), icon: MapPin, text: 'Share Location', color: 'text-orange-600' },
                                            { onClick: () => alert('Help request will be implemented'), icon: AlertTriangle, text: 'Request Help', color: 'text-red-600' }
                                        ].map((action, idx) => {
                                            const Icon = action.icon;
                                            const Component = action.href ? 'a' : 'button';
                                            return (
                                                <motion.div
                                                    key={idx}
                                                    whileHover={{ y: -5 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Component
                                                        href={action.href}
                                                        onClick={action.onClick}
                                                        className={`bg-white ${action.color} py-4 px-6 rounded-lg font-bold text-center hover:bg-gray-100 transition-colors flex flex-col items-center gap-2 w-full h-full shadow-sm`}
                                                    >
                                                        <Icon className="w-8 h-8" />
                                                        {action.text}
                                                    </Component>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Risk Timeline */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Current Risk Timeline
                    </h2>
                    <div className="bg-gradient-to-r from-yellow-50 to-red-50 border-2 border-orange-300 rounded-lg p-6">
                        <div className="text-center">
                            <p className="text-lg text-gray-800 mb-2">
                                <strong>Current Risk Level:</strong> <span className={`${riskColors.text} font-bold`}>{riskCategory}</span>
                            </p>
                            <p className="text-gray-600">
                                Risk Score: <strong>{villageData.overall_risk_score}/100</strong>
                            </p>
                            {villageData.overall_risk_score > 60 && (
                                <div className="mt-4 bg-red-100 border border-red-300 rounded-lg p-3">
                                    <p className="text-red-800 font-semibold">
                                        ⚠️ HIGH RISK: Review evacuation plans and stay alert for official warnings
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center">
                    <button
                        onClick={() => navigate(`/predictions/${villageId}`)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                        <TrendingUp className="w-5 h-5" />
                        View Future Predictions
                    </button>
                    <button
                        onClick={() => navigate(`/dashboard/${villageId}`)}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};
export default SafetyModule;
