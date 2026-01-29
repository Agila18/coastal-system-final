import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const RiskCharts = ({ riskData, activeTab }) => {
    if (!riskData) return null;

    // Transform data based on active tab
    const getChartContent = () => {
        switch (activeTab) {
            case 'flood':
                return renderFloodChart();
            case 'cyclone':
                return renderCycloneChart();
            case 'rainfall':
                return renderRainfallChart();
            case 'erosion':
                return renderErosionChart();
            default:
                return <p>Select a risk type to view details.</p>;
        }
    };

    const renderFloodChart = () => {
        // Mock historical data or specific flood metrics if available, 
        // otherwise verify what we have. API returns risk scores. 
        // We can visualize the components contributing to Flood Risk.
        const data = [
            { name: 'Sea Level', value: riskData.environmental.sea_level_rise, fullMark: 10 },
            { name: 'Surge', value: riskData.environmental.storm_surge_height, fullMark: 10 },
            { name: 'Rainfall', value: riskData.environmental.extreme_rainfall, fullMark: 10 },
            { name: 'Infra', value: (10 - riskData.settlement.infrastructure_score), fullMark: 10 }, // Infra weakness
        ];

        return (
            <div className="h-80 w-full">
                <h3 className="text-center font-bold text-gray-700 mb-4">Flood Risk Contributors</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 10]} />
                        <YAxis dataKey="name" type="category" width={80} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#3B82F6" name="Impact Score" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    };

    const renderCycloneChart = () => {
        // Radar chart for Cyclone factors
        const data = [
            { subject: 'Frequency', A: riskData.environmental.cyclone_frequency, fullMark: 10 },
            { subject: 'Surge', A: riskData.environmental.storm_surge_height, fullMark: 10 },
            { subject: 'Wind', A: 8, fullMark: 10 }, // Placeholder if not in API, assummed high
            { subject: 'Density', A: riskData.settlement.population_density, fullMark: 10 },
            { subject: 'Shelter', A: 5, fullMark: 10 }, // Placeholder
        ];

        return (
            <div className="h-80 w-full">
                <h3 className="text-center font-bold text-gray-700 mb-4">Cyclone Vulnerability Profile</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} />
                        <Radar name="Risk Factors" dataKey="A" stroke="#F97316" fill="#F97316" fillOpacity={0.6} />
                        <Legend />
                        <Tooltip />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        );
    };

    const renderRainfallChart = () => {
        // Rainfall Comparison (Current vs Avg) - Mocking Avg for visualization
        const data = [
            { name: 'Current Intensity', value: riskData.environmental.extreme_rainfall },
            { name: 'Regional Avg', value: 5.5 },
            { name: 'Threshold', value: 8.0 },
        ];

        return (
            <div className="h-80 w-full">
                <h3 className="text-center font-bold text-gray-700 mb-4">Rainfall Intensity Index</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#60A5FA" barSize={60} radius={[4, 4, 0, 0]} >
                            {
                                data.map((entry, index) => (
                                    <cell key={`cell-${index}`} fill={entry.name === 'Threshold' ? '#EF4444' : '#60A5FA'} />
                                ))
                            }
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    };

    const renderErosionChart = () => {
        // Area chart to visualize shore distance vs erosion rate
        const data = [
            { name: 'Erosion Rate', rate: riskData.environmental.erosion_rate, dist: 0 },
            { name: 'Proximity Risk', rate: (10 - riskData.settlement.distance_from_shore), dist: 0 },
        ];

        return (
            <div className="h-80 w-full flex items-center justify-center">
                <div className="w-full max-w-md">
                    <h3 className="text-center font-bold text-gray-700 mb-4">Coastal Stability Matrix</h3>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm text-gray-500">Erosion Rate</p>
                            <p className="text-3xl font-bold text-yellow-600">{riskData.environmental.erosion_rate}/10</p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm text-gray-500">Proximity Risk</p>
                            <p className="text-3xl font-bold text-yellow-600">{(10 - riskData.settlement.distance_from_shore).toFixed(1)}/10</p>
                        </div>
                    </div>
                    <div className="mt-4 p-4 bg-slate-50 text-sm text-gray-600 rounded-lg">
                        {riskData.environmental.erosion_rate > 7
                            ? "High erosion rate detected. Structural reinforcement recommended for properties within 500m of shoreline."
                            : "Erosion levels are currently stable. Routine monitoring advised."
                        }
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in">
            {getChartContent()}
        </div>
    );
};

export default RiskCharts;
