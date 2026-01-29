import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
            <p className="text-gray-700 text-lg mb-4">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Try Again
                </button>
            )}
        </div>
    );
};

export default ErrorMessage;
