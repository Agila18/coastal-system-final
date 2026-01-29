import React from 'react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, RadarChart, Radar,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line,
    AreaChart, Area
} from 'recharts';

// Color constants
const COLORS = {
    red: '#EF4444',
    orange: '#F97316',
    yellow: '#F59E0B',
    blue: '#3B82F6',
    teal: '#14B8A6',
    purple: '#A855F7',
    green: '#10B981',
    gray: '#6B7280'
};

// 1. Risk Distribution Pie Chart
export const RiskDistributionPieChart = ({ data }) => {
    const chartData = [
        { name: 'Sea Level Rise', value: 35, color: COLORS.red },
        { name: 'Population Risk', value: 25, color: COLORS.orange },
        { name: 'Infrastructure', value: 20, color: COLORS.yellow },
        { name: 'Other Factors', value: 20, color: COLORS.gray }
    ];

    return (
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent, x, y }) => (
                        <text
                            x={x}
                            y={y}
                            fill="#374151"
                            textAnchor={x > 150 ? 'start' : 'end'}
                            dominantBaseline="central"
                            className="text-[10px] sm:text-xs"
                        >
                            {`${name} ${(percent * 100).toFixed(0)}%`}
                        </text>
                    )}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    );
};

// 2. Environmental Indicators Bar Chart (Supports Vertical or Horizontal Bars)
export const EnvironmentalBarChart = ({ data, type = 'all', barLayout = 'horizontal' }) => {
    // barLayout: 'horizontal' = Horizontal Bars (default)
    // barLayout: 'vertical'   = Vertical Columns

    const allData = [
        { name: 'Sea Level Rise', value: data.sea_level_rise || 8.5, color: COLORS.red, types: ['flood', 'all'] },
        { name: 'Cyclone Frequency', value: data.cyclone_frequency || 7.2, color: COLORS.orange, types: ['cyclone', 'all'] },
        { name: 'Storm Surge Height', value: data.storm_surge_height || 8.0, color: COLORS.yellow, types: ['flood', 'cyclone', 'all'] },
        { name: 'Erosion Rate', value: data.erosion_rate || 7.5, color: COLORS.orange, types: ['erosion', 'all'] },
        { name: 'Extreme Rainfall', value: data.extreme_rainfall || 8.8, color: COLORS.red, types: ['flood', 'cyclone', 'all'] }
    ];

    const chartData = allData.filter(item => item.types.includes(type));
    const isVerticalColumns = barLayout === 'vertical';
    const rechartsLayout = isVerticalColumns ? 'horizontal' : 'vertical';

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart
                data={chartData}
                layout={rechartsLayout}
                margin={{ top: 5, right: 30, left: 20, bottom: isVerticalColumns ? 60 : 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />

                {isVerticalColumns ? (
                    // Vertical Columns: X=Name, Y=Value
                    <>
                        <XAxis
                            dataKey="name"
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            tick={{ fontSize: 10 }}
                        />
                        <YAxis type="number" domain={[0, 10]} />
                    </>
                ) : (
                    // Horizontal Bars: X=Value, Y=Name
                    <>
                        <XAxis type="number" domain={[0, 10]} hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={100}
                            tick={{ fontSize: 10 }}
                        />
                    </>
                )}

                <Tooltip />
                <Bar dataKey="value" radius={isVerticalColumns ? [8, 8, 0, 0] : [0, 8, 8, 0]}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

// 3. Environmental Risk Radar Chart
export const EnvironmentalRadarChart = ({ data }) => {
    const chartData = [
        { indicator: 'Sea Level Rise', value: data.sea_level_rise || 8.5 },
        { indicator: 'Cyclone Frequency', value: data.cyclone_frequency || 7.2 },
        { indicator: 'Storm Surge', value: data.storm_surge_height || 8.0 },
        { indicator: 'Erosion Rate', value: data.erosion_rate || 7.5 },
        { indicator: 'Extreme Rainfall', value: data.extreme_rainfall || 8.8 }
    ];

    return (
        <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="indicator" />
                <PolarRadiusAxis angle={90} domain={[0, 10]} />
                <Radar
                    name="Environmental Risk"
                    dataKey="value"
                    stroke={COLORS.blue}
                    fill={COLORS.blue}
                    fillOpacity={0.6}
                />
                <Tooltip />
            </RadarChart>
        </ResponsiveContainer>
    );
};

// 4. Settlement Indicators Vertical Bar Chart
export const SettlementBarChart = ({ data }) => {
    const chartData = [
        { name: 'Population Density', value: data.population_density || 9.0, color: COLORS.red },
        { name: 'Households', value: data.households || 8.5, color: COLORS.orange },
        { name: 'Distance From Shore', value: data.distance_from_shore || 2.0, color: COLORS.red },
        { name: 'Infrastructure Score', value: data.infrastructure_score || 3.0, color: COLORS.orange }
    ];

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 10 }}
                />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

// 5. Settlement Risk Radar Chart
export const SettlementRadarChart = ({ data }) => {
    const chartData = [
        { indicator: 'Population Density', value: data.population_density || 9.0 },
        { indicator: 'Households', value: data.households || 8.5 },
        { indicator: 'Infrastructure Score', value: data.infrastructure_score || 3.0 }
    ];

    return (
        <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="indicator" />
                <PolarRadiusAxis angle={90} domain={[0, 10]} />
                <Radar
                    name="Settlement Risk"
                    dataKey="value"
                    stroke={COLORS.purple}
                    fill={COLORS.purple}
                    fillOpacity={0.6}
                />
                <Tooltip />
            </RadarChart>
        </ResponsiveContainer>
    );
};

// 6. Trend Line Chart (Historical)
export const TrendLineChart = ({ historicalData }) => {
    // Sample data structure - replace with actual historical data
    const chartData = historicalData || [
        { year: '2017', seaLevel: 5.5, cyclone: 2.3, erosion: 2.5 },
        { year: '2018', seaLevel: 5.9, cyclone: 2.4, erosion: 2.7 },
        { year: '2019', seaLevel: 6.1, cyclone: 2.4, erosion: 2.9 },
        { year: '2020', seaLevel: 6.5, cyclone: 2.6, erosion: 3.2 },
        { year: '2021', seaLevel: 7.0, cyclone: 2.5, erosion: 3.5 },
        { year: '2022', seaLevel: 7.5, cyclone: 2.7, erosion: 3.9 },
        { year: '2023', seaLevel: 8.0, cyclone: 2.6, erosion: 4.2 },
        { year: '2024', seaLevel: 8.5, cyclone: 2.7, erosion: 4.5 },
        { year: '2025', seaLevel: 9.0, cyclone: 2.5, erosion: 4.3 }
    ];

    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis domain={[0, 12]} />
                <Tooltip />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="seaLevel"
                    stroke={COLORS.red}
                    strokeWidth={2}
                    name="Sea Level Rise"
                    dot={{ r: 4 }}
                />
                <Line
                    type="monotone"
                    dataKey="cyclone"
                    stroke={COLORS.yellow}
                    strokeWidth={2}
                    name="Cyclone Frequency"
                    dot={{ r: 4 }}
                />
                <Line
                    type="monotone"
                    dataKey="erosion"
                    stroke={COLORS.blue}
                    strokeWidth={2}
                    name="Erosion Rate"
                    dot={{ r: 4 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

// 7. Extreme Rainfall Area Chart
export const RainfallAreaChart = ({ historicalData }) => {
    const chartData = historicalData || [
        { year: '2017', rainfall: 195 },
        { year: '2018', rainfall: 202 },
        { year: '2019', rainfall: 208 },
        { year: '2020', rainfall: 215 },
        { year: '2021', rainfall: 225 },
        { year: '2022', rainfall: 235 },
        { year: '2023', rainfall: 242 },
        { year: '2024', rainfall: 250 },
        { year: '2025', rainfall: 258 }
    ];

    return (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis domain={[0, 280]} />
                <Tooltip />
                <Area
                    type="monotone"
                    dataKey="rainfall"
                    stroke={COLORS.blue}
                    fill={COLORS.blue}
                    fillOpacity={0.6}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

// Main component to switch between different chart views
export const RiskChartsTabView = ({ activeTab, environmentalData, settlementData, historicalData }) => {
    return (
        <div className="mt-6">
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Risk Distribution</h3>
                        <RiskDistributionPieChart />
                    </div>
                </div>
            )}

            {activeTab === 'flood' && (
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Flood Risk Indicators</h3>
                        <EnvironmentalBarChart data={environmentalData} type="flood" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Environmental Risk Profile</h3>
                        <EnvironmentalRadarChart data={environmentalData} />
                    </div>
                </div>
            )}

            {activeTab === 'cyclone' && (
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Cyclone Risk Factors</h3>
                        <EnvironmentalBarChart data={environmentalData} type="cyclone" barLayout="vertical" />
                    </div>
                </div>
            )}

            {activeTab === 'rainfall' && (
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Rainfall Trend</h3>
                        <RainfallAreaChart historicalData={historicalData} />
                    </div>
                </div>
            )}

            {activeTab === 'erosion' && (
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Settlement Vulnerability</h3>
                        <SettlementBarChart data={settlementData} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Settlement Risk Profile</h3>
                        <SettlementRadarChart data={settlementData} />
                    </div>
                </div>
            )}

            {activeTab === 'trends' && (
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Historical Trends (2017-2025)</h3>
                        <TrendLineChart historicalData={historicalData} />
                    </div>
                </div>
            )}
        </div>
    );
};
