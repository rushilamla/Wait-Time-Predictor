/**
 * API service for communicating with the Wait Time Predictor backend.
 */

import axios from 'axios';

// Use /api prefix to go through Vite proxy, or direct URL if VITE_API_URL is set
const API_BASE_URL = import.meta.env.VITE_API_URL;


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Predict wait time based on queue parameters.
 * 
 * @param {Object} data - Prediction parameters
 * @param {number} data.queue_size - Number of people in queue
 * @param {number} data.avg_service_time - Average service time per person (seconds)
 * @param {number} [data.arrival_rate] - Arrival rate (people per minute, optional)
 * @returns {Promise<Object>} Prediction response
 */
export const predictWaitTime = async (data) => {
  try {
    const response = await api.post('/predict', data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    // Handle network errors
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      return {
        success: false,
        error: 'Cannot connect to backend server. Please make sure the backend is running on http://localhost:8000',
      };
    }
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Prediction failed',
    };
  }
};

/**
 * Train/retrain the prediction model.
 * 
 * @param {string} [modelType='linear'] - Type of model to train ('linear' or 'random_forest')
 * @returns {Promise<Object>} Training response
 */
export const trainModel = async (modelType = 'linear') => {
  try {
    const response = await api.post(`/train?model_type=${modelType}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Training failed',
    };
  }
};

/**
 * Check API health status.
 * 
 * @returns {Promise<Object>} Health check response
 */
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    // Handle network errors
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      return {
        success: false,
        error: 'Cannot connect to backend server. Please make sure the backend is running on http://localhost:8000',
      };
    }
    return {
      success: false,
      error: error.message || 'Health check failed',
    };
  }
};

export default api;
