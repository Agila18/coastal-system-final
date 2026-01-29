import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getStates = () => api.get('/states');
export const getDistricts = (stateId) => api.get(`/districts/${stateId}`);
export const getVillages = (districtId) => api.get(`/villages/${districtId}`);
export const getVillageRisk = (villageId) => api.get(`/risk/village/${villageId}`);
export const getRiskHistory = (villageId) => api.get(`/risk/village/${villageId}/history`);
export const getPredictions = (villageId, params = {}) => api.get(`/predictions/village/${villageId}`, { params });

export default api;
