import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminApi.interceptors.request.use((config) => {
  const key = localStorage.getItem('ADMIN_API_KEY') || '';
  if (key) config.headers['X-Admin-Key'] = key;
  return config;
});

// Events
export const upsertEvent = async (payload: any) => {
  const { data } = await adminApi.post('/admin/events', payload);
  return data;
};

export const publishEvent = async (id: string) => {
  const { data } = await adminApi.post(`/admin/events/${id}/publish`);
  return data;
};

export const deleteEvent = async (id: string) => {
  const { data } = await adminApi.delete(`/admin/events/${id}`);
  return data;
};

// Rules
export const updateResaleRules = async (eventId: string, rules: {
  maxResalePriceMultiplier?: number;
  allowResale?: boolean;
  allowTransfer?: boolean;
}) => {
  const { data } = await adminApi.put(`/admin/events/${eventId}/rules`, rules);
  return data;
};

// Access control
export const addToWhitelist = async (wallets: string[]) => {
  const { data } = await adminApi.post('/admin/whitelist', { wallets });
  return data;
};

export const addToBlacklist = async (wallets: string[]) => {
  const { data } = await adminApi.post('/admin/blacklist', { wallets });
  return data;
};

// Analytics
export const getAnalyticsSummary = async () => {
  const { data } = await adminApi.get('/admin/analytics/summary');
  return data;
};

export const getRecentTransactions = async () => {
  const { data } = await adminApi.get('/admin/analytics/transactions');
  return data;
};

export const getCategoryBreakdown = async () => {
  const { data } = await adminApi.get('/admin/analytics/categories');
  return data as Array<{
    eventId: string;
    categoryName: string | null;
    purchases: number;
    resales: number;
    totalAmount: number;
  }>;
};

export default adminApi;
