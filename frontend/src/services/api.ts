import axios from 'axios';
import type { Company } from '../types';

// O endereço base do seu backend
const API_URL = 'http://localhost:3333';

const api = axios.create({
  baseURL: API_URL,
});

export const getCompanies = async (): Promise<Company[]> => {
  try {
    const response = await api.get('/companies');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    // Em uma aplicação real, você poderia tratar o erro de forma mais robusta
    // (ex: mostrar uma notificação para o usuário)
    throw error;
  }
};
