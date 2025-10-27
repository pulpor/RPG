import { API_URL } from '../config.js';

const BASE_URL = API_URL;

export const API = {
    async request(endpoint, options = {}) {
        try {
            // Não adicionar Accept ou Content-Type se for FormData
            const isFormData = options.body instanceof FormData;

            const headers = {
                ...options.headers
            };

            // Só adicionar Accept se não for FormData
            if (!isFormData) {
                headers['Accept'] = 'application/json';
            }

            const response = await fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro na requisição');
            }

            return response.json();
        } catch (error) {
            console.error('Erro na API:', error);
            throw error;
        }
    }
};
