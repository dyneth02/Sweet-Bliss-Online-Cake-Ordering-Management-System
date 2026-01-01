import React from 'react';
import { motion } from 'framer-motion';

const BentoCard = ({ 
    title, 
    icon, 
    description, 
    onClick, 
    metric, 
    metricLabel, 
    className = '',
    chart,
    list,
    metrics,
    feedback
}) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`bg-gray-800/50 p-6 rounded-xl cursor-pointer 
                       backdrop-blur-sm border border-gray-700 
                       hover:bg-gray-700/50 transition-all duration-300 ${className}`}
        >
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3">
                    {icon}
                    <h3 className="text-lg font-semibold">{title}</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">{description}</p>
                
                {metric && (
                    <div className="mt-auto">
                        <div className="text-2xl font-bold text-white">{metric}</div>
                        <div className="text-sm text-gray-400">{metricLabel}</div>
                    </div>
                )}

                {chart && <div className="mt-auto">{chart}</div>}

                {list && (
                    <ul className="mt-4 space-y-2">
                        {list.map((item, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                )}

                {metrics && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        {metrics.map((item, index) => (
                            <div key={index} className="text-center">
                                <div className="text-xl font-bold text-white">{item.value}</div>
                                <div className="text-xs text-gray-400">{item.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {feedback && (
                    <div className="mt-4 space-y-4">
                        {feedback}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default BentoCard;

