import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Em produção (Coolify), usa a mesma origem (reverse proxy nginx)
// Em dev, usa localhost:3333
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3333' : '');

export const api = axios.create({
  baseURL: API_URL,
});

// Interceptor: injeta token de admin em toda request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==========================================
// Funções Helper
// ==========================================

export const getStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export const getCompanies = async () => {
  const response = await api.get('/companies');
  return response.data;
};

export const createCompany = async (data: { name: string; document: string; modules: string[] }) => {
  const response = await api.post('/companies', data);
  return response.data;
};

export const getCompanyById = async (id: string) => {
  const response = await api.get(`/companies/${id}`);
  return response.data;
};

export const updateCompany = async (id: string, data: any) => {
  const response = await api.put(`/companies/${id}`, data);
  return response.data;
};

export const deleteCompany = async (id: string) => {
  const response = await api.delete(`/companies/${id}`);
  return response.data;
};

export const renewLicense = async (id: string) => {
  const response = await api.post(`/companies/${id}/renew`);
  return response.data;
};

export const updateModules = async (id: string, modules: string[]) => {
  const response = await api.put(`/companies/${id}/modules`, { modules });
  return response.data;
};

export const forceSync = async (id: string) => {
  const response = await api.post(`/companies/${id}/force-sync`);
  return response.data;
};

export const getCompanyLogs = async (id: string) => {
  const response = await api.get(`/companies/${id}/logs`);
  return response.data;
};

export const getCompanyTelemetry = async (id: string) => {
  const response = await api.get(`/companies/${id}/telemetry`);
  return response.data;
};
