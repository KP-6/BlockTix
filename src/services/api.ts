import axios from 'axios';
import { Event } from '../types/Event';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simple local cache helpers
const EVENTS_CACHE_KEY = 'events_cache_v2';
const EVENTS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

type EventsCache = { ts: number; items: Event[] };

export const getCachedEvents = (): Event[] | null => {
  try {
    const raw = localStorage.getItem(EVENTS_CACHE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw) as EventsCache;
    if (!obj?.ts || !Array.isArray(obj.items)) return null;
    const fresh = Date.now() - obj.ts < EVENTS_CACHE_TTL_MS;
    return fresh ? obj.items : null;
  } catch { return null; }
};

const setCachedEvents = (items: Event[]) => {
  try {
    const obj: EventsCache = { ts: Date.now(), items };
    localStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify(obj));
  } catch {}
};

const withTimeout = async <T>(p: Promise<T>, ms = 2000): Promise<T> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    // @ts-ignore extend axios config with signal via request interceptor
    const resp: any = await (p as any);
    clearTimeout(timer);
    return resp;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
};

// Mock data for events (until backend is connected)
const mockEvents: Event[] = [
  {
    id: 'sunburn2025',
    title: 'Sunburn Music Festival – Goa 2025',
    description: 'Asia\'s biggest music festival in Goa. Experience top EDM artists over 3 days!',
    date: '2025-12-27T16:00:00+05:30',
    location: 'Vagator Beach, Goa',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1600&auto=format&fit=crop',
    price: 4999, // base = min category price in INR
    availableTickets: 20000,
    totalTickets: 20000,
    category: 'Music',
    isFeatured: true,
    organizer: 'Sunburn',
    categories: [
      { name: 'General Pass (Per Day)', price: 4999, total: 15000, available: 15000 },
      { name: 'VIP Pass (3 Days)', price: 12000, total: 5000, available: 5000 }
    ]
  },
  {
    id: 'indvsaus-t20-2026',
    title: 'India vs Australia – T20 Match',
    description: 'High-voltage India vs Australia T20 cricket match in Bengaluru! Limited seats.',
    date: '2026-02-14T19:00:00+05:30',
    location: 'M. Chinnaswamy Stadium, Bengaluru',
    image: 'https://images.news18.com/ibnlive/uploads/2023/09/india-australia-1st-odi-live-score-ind-vs-aus-2023-09-2502936abd62ce512f51496b9d397181-16x9.jpg?impolicy=website&width=640&height=360',
    price: 1500,
    availableTickets: 35000,
    totalTickets: 35000,
    category: 'Sports',
    isFeatured: true,
    organizer: 'BCCI',
    categories: [
      { name: 'Stand Tickets', price: 1500, total: 20000, available: 20000 },
      { name: 'Premium Pavilion', price: 4500, total: 12000, available: 12000 },
      { name: 'Corporate Box', price: 12000, total: 3000, available: 3000 }
    ]
  },
  {
    id: 'arijit-2026-mumbai',
    title: 'Arijit Singh Live Concert',
    description: 'An evening with Arijit Singh performing his best hits live at NSCI Dome.',
    date: '2026-01-10T18:30:00+05:30',
    location: 'NSCI Dome, Mumbai',
    image: 'https://www.tottenhamhotspurstadium.com/media/xrhfsdgm/2v8a4968.jpg?width=960&height=582&rnd=133898957726470000',
    price: 1200,
    availableTickets: 10000,
    totalTickets: 10000,
    category: 'Concert',
    isFeatured: false,
    organizer: 'BookMyShow',
    categories: [
      { name: 'Silver', price: 1200, total: 6000, available: 6000 },
      { name: 'Gold', price: 2500, total: 3000, available: 3000 },
      { name: 'Platinum', price: 6000, total: 1000, available: 1000 }
    ]
  },
  {
    id: 'puri-ratha-yatra-2026',
    title: 'Ratha Yatra – Jagannath Puri Darshan Pass',
    description: 'Special darshan passes for Ratha Yatra. General entry is free; priority darshan available.',
    date: '2026-07-07T05:00:00+05:30',
    location: 'Jagannath Temple, Puri, Odisha',
    image: 'https://i0.wp.com/indiacurrents.com/wp-content/uploads/2025/06/Puri-Jagannath-Rath-Yatra.jpg?fit=1200%2C674&ssl=1',
    price: 0,
    availableTickets: 100000,
    totalTickets: 100000,
    category: 'Pilgrimage',
    isFeatured: true,
    organizer: 'Shree Jagannath Temple',
    categories: [
      { name: 'General Entry', price: 0, total: 90000, available: 90000 },
      { name: 'Priority Darshan', price: 500, total: 10000, available: 10000 }
    ]
  },
  {
    id: 'indian-tech-summit-2026',
    title: 'Indian Tech Summit 2026',
    description: 'India\'s premier technology summit with talks, workshops, and networking over 3 days.',
    date: '2026-03-15T09:00:00+05:30',
    location: 'Pragati Maidan, New Delhi',
    image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=1600&auto=format&fit=crop',
    price: 800,
    availableTickets: 8000,
    totalTickets: 8000,
    category: 'Conference',
    isFeatured: false,
    organizer: 'NASSCOM',
    categories: [
      { name: 'Student Pass', price: 800, total: 3000, available: 3000 },
      { name: 'Regular', price: 2000, total: 4000, available: 4000 },
      { name: 'VIP + Networking', price: 5000, total: 1000, available: 1000 }
    ]
  }
];

// Get all events (use backend with graceful fallback to mock)
export const getEvents = async (): Promise<Event[]> => {
  try {
    // Try fast network with timeout
    const response = await Promise.race([
      api.get('/events'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
    ]) as any;
    const data = response.data as Event[];
    setCachedEvents(data);
    return data;
  } catch (error) {
    const cached = getCachedEvents();
    if (cached) return cached;
    console.warn('Backend /events failed or timed out, falling back to mock data:', error);
    return new Promise(resolve => {
      setTimeout(() => resolve(mockEvents), 200);
    });
  }
};

// Get event by ID (use backend with graceful fallback to mock)
export const getEventById = async (id: string): Promise<Event> => {
  try {
    const response = await Promise.race([
      api.get(`/events/${id}`),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
    ]) as any;
    return response.data as Event;
  } catch (error) {
    // Try cache first
    const cached = getCachedEvents();
    if (cached) {
      const hit = cached.find(e => e.id === id);
      if (hit) return hit;
    }
    console.warn('Backend /events/:id failed or timed out, falling back to mock data:', error);
    const event = mockEvents.find(e => e.id === id);
    if (!event) throw error;
    return event;
  }
};

// Submit contact form
export const submitContactForm = async (data: { name: string; email: string; subject: string; message: string }): Promise<void> => {
  try {
    // In a real app, this would call the backend API
    // await api.post('/contact', data);
    
    // For now, simulate API call with delay
    return new Promise(resolve => {
      setTimeout(() => resolve(), 1500);
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw error;
  }
};

// Add JWT token to requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Export the API instance for direct use
export default api;

// Additional helpers for ticket flows
export const purchaseTickets = async (payload: { eventId: string; wallet: string; quantity: number; price?: number; }) => {
  const { data } = await api.post('/purchase', payload);
  return data;
};

export const resellTicket = async (payload: { eventId: string; seller: string; buyer: string; price: number; }) => {
  const { data } = await api.post('/resell', payload);
  return data;
};

export const transferTicket = async (payload: { eventId: string; from: string; to: string; }) => {
  const { data } = await api.post('/transfer', payload);
  return data;
};

// Email OTP helpers
export const sendOtp = async (email: string) => {
  const { data } = await api.post('/auth/send-otp', { email });
  return data as { sent: boolean; dev?: { code: string }; expiresInSec: number };
};

export const verifyOtp = async (email: string, code: string) => {
  const { data } = await api.post('/auth/verify-otp', { email, code });
  return data as { verified: boolean };
};

// Orders (history)
export type OrderTx = {
  id?: string;
  type: 'purchase' | 'resell' | 'transfer';
  eventId: string;
  eventTitle?: string; // Added for convenience
  from: string | null;
  to: string | null;
  amount: number;
  quantity?: number;
  categoryName?: string | null;
  timestamp: string;
  orderId?: string;
};

export const getOrders = async (email: string): Promise<OrderTx[]> => {
  const { data } = await api.get('/orders', { params: { email } });
  return data as OrderTx[];
};

export const getOrder = async (orderId: string): Promise<OrderTx> => {
  const { data } = await api.get(`/orders/${orderId}`);
  return data as OrderTx;
};