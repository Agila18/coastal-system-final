import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="relative h-screen w-full overflow-hidden">
            {/* Background Image with Overlays */}
            <div className="absolute inset-0">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: 'url(/coastal-hero-bg.jpg)',
                        backgroundPosition: 'center center',
                    }}
                >
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/80 via-[#0A1628]/50 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
                <div className="w-full px-4">
                    <div className="ml-4 sm:ml-20 lg:ml-28 max-w-4xl">
                        <h1 className="text-white leading-tight mb-6 font-bold text-5xl md:text-7xl">
                            Protecting Tamil Nadu's Coastline with Intelligent Risk Prediction
                        </h1>
                        <p className="text-[#B8D4E8] mb-10 max-w-[560px] text-xl">
                            AI-powered coastal monitoring and flood risk analysis for safer communities
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 mb-16">
                            <button
                                onClick={() => navigate('/selection')}
                                className="px-8 py-4 bg-[#0D9488] text-white font-semibold rounded-lg hover:bg-[#0f857a] hover:scale-105 transition-all duration-300 shadow-lg"
                            >
                                Select a Village
                            </button>
                            <button className="px-8 py-4 bg-transparent text-white font-semibold rounded-lg border-2 border-white hover:bg-white/10 hover:scale-105 transition-all duration-300">
                                View Live Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
