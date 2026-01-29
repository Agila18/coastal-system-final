export const getRiskColor = (score) => {
    if (score >= 76) return {
        bg: 'bg-red-100',
        border: 'border-red-300',
        text: 'text-red-700',
        badge: 'bg-red-500',
        hex: '#EF4444'
    };
    if (score >= 51) return {
        bg: 'bg-orange-100',
        border: 'border-orange-300',
        text: 'text-orange-700',
        badge: 'bg-orange-500',
        hex: '#F97316'
    };
    if (score >= 26) return {
        bg: 'bg-yellow-100',
        border: 'border-yellow-300',
        text: 'text-yellow-700',
        badge: 'bg-yellow-500',
        hex: '#F59E0B'
    };
    return {
        bg: 'bg-green-100',
        border: 'border-green-300',
        text: 'text-green-700',
        badge: 'bg-green-500',
        hex: '#10B981'
    };
};

export const getRiskCategory = (score) => {
    if (score >= 76) return 'EXTREME';
    if (score >= 51) return 'HIGH';
    if (score >= 26) return 'MODERATE';
    return 'LOW';
};

export const getMarkerColor = (score) => {
    if (score >= 76) return 'red';
    if (score >= 51) return 'orange';
    if (score >= 26) return '#F59E0B'; // yellow-orange
    return 'green';
};
