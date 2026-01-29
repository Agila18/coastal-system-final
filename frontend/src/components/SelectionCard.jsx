import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const SelectionCard = ({
    title,
    options,
    selectedId,
    onSelect,
    loading = false
}) => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const item = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
    };

    const handleRipple = (e) => {
        const button = e.currentTarget;
        const circle = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${e.clientY - button.offsetTop - radius}px`;
        circle.classList.add("ripple");

        const ripple = button.getElementsByClassName("ripple")[0];
        if (ripple) {
            ripple.remove();
        }

        button.appendChild(circle);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6 w-full sm:min-w-[280px] sm:max-w-[320px] hover-glow"
        >
            {/* Card Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-blue-200 pb-3">
                {title}
            </h2>

            {/* Loading State */}
            {loading ? (
                <LoadingSpinner message="Loading..." />
            ) : (
                /* Options List */
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-3"
                >
                    {options && options.length > 0 ? (
                        options.map((option) => (
                            <motion.button
                                key={option.id}
                                variants={item}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={(e) => {
                                    handleRipple(e);
                                    onSelect(option);
                                }}
                                className={`
                                    ripple-button w-full text-left px-4 py-3 rounded-lg font-medium
                                    transition-all duration-200 flex items-center justify-between group
                                    ${selectedId === option.id
                                        ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-md'
                                        : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:shadow-md'}
                                `}
                            >
                                <span>{option.name}</span>
                                <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${selectedId === option.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                            </motion.button>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-8">No options available</p>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
};

export default SelectionCard;
