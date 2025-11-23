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

// Mock data for events (until backend is connected)
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Blockchain Developer Conference',
    description: 'Join us for the premier blockchain developer conference featuring keynote speakers from Polygon, Ethereum, and other leading projects. Network with industry experts, attend workshops, and learn about the latest advancements in blockchain technology.',
    date: '2025-06-15T09:00:00.000Z',
    location: 'San Francisco, CA',
    image: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg',
    price: 0.05,
    availableTickets: 120,
    totalTickets: 300,
    category: 'conference',
    isFeatured: true,
    organizer: 'Blockchain Developers Association'
  },
  {
    id: '2',
    title: 'Crypto Music Festival',
    description: 'Experience the world\'s first fully blockchain-powered music festival. All tickets are NFTs, and artists will be releasing exclusive NFT collections during the event. Multiple stages, camping options, and food vendors available.',
    date: '2025-07-22T16:00:00.000Z',
    location: 'Austin, TX',
    image: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg',
    price: 0.15,
    availableTickets: 850,
    totalTickets: 2000,
    category: 'music',
    isFeatured: true,
    organizer: 'Crypto Entertainment Group'
  },
  {
    id: '3',
    title: 'NFT Art Exhibition',
    description: 'Explore the intersection of traditional art and blockchain technology at our NFT Art Exhibition. Featured artists will be displaying physical works alongside their digital NFT counterparts. Interactive displays and VR experiences included.',
    date: '2025-05-10T10:00:00.000Z',
    location: 'New York, NY',
    image: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg',
    price: 0.02,
    availableTickets: 75,
    totalTickets: 200,
    category: 'art',
    isFeatured: false,
    organizer: 'Digital Art Collective'
  },
  {
    id: '4',
    title: 'Web3 Startup Pitch Competition',
    description: 'Watch innovative Web3 startups compete for $100,000 in funding. Teams will pitch their ideas to a panel of industry judges and venture capitalists. Networking opportunities and refreshments provided.',
    date: '2025-08-05T13:00:00.000Z',
    location: 'Miami, FL',
    image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
    price: 0.03,
    availableTickets: 150,
    totalTickets: 300,
    category: 'business',
    isFeatured: false,
    organizer: 'Web3 Founders Club'
  },
  {
    id: '5',
    title: 'Polygon Hackathon',
    description: 'Put your blockchain development skills to the test in this 48-hour hackathon. Build decentralized applications on the Polygon network, compete for prizes, and receive mentorship from Polygon core developers.',
    date: '2025-09-18T09:00:00.000Z',
    location: 'Berlin, Germany',
    image: 'https://images.pexels.com/photos/7103/writing-notes-idea-conference.jpg',
    price: 0.01,
    availableTickets: 50,
    totalTickets: 200,
    category: 'hackathon',
    isFeatured: true,
    organizer: 'Polygon Foundation'
  },
  {
    id: '6',
    title: 'Crypto Sports Cup',
    description: 'Watch top e-sports teams compete in this blockchain-sponsored tournament. Games include League of Legends, Dota 2, and CS:GO. Fan tokens available for team support and exclusive merch.',
    date: '2025-10-05T14:00:00.000Z',
    location: 'Los Angeles, CA',
    image: 'https://images.pexels.com/photos/159745/tablet-screen-devices-computer-159745.jpeg',
    price: 0.05,
    availableTickets: 1000,
    totalTickets: 5000,
    category: 'sports',
    isFeatured: false,
    organizer: 'Crypto Gaming League'
  },
  {
    id: '7',
    title: 'DeFi Summit',
    description: 'Dive deep into the world of decentralized finance at the annual DeFi Summit. Learn about yield farming, lending protocols, stablecoins, and more from the industry\'s leading projects and developers.',
    date: '2025-04-12T08:00:00.000Z',
    location: 'Singapore',
    image: 'https://images.pexels.com/photos/6476254/pexels-photo-6476254.jpeg',
    price: 0.08,
    availableTickets: 0,
    totalTickets: 500,
    category: 'finance',
    isFeatured: false,
    organizer: 'Global DeFi Association'
  },
  {
    id: '8',
    title: 'Blockchain Film Festival',
    description: 'A showcase of films and documentaries about blockchain technology, cryptocurrency, and digital privacy. Special screening of "Trust No One: The Hunt for the Crypto King" followed by director Q&A.',
    date: '2025-11-20T18:00:00.000Z',
    location: 'Toronto, Canada',
    image: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg',
    price: 0.02,
    availableTickets: 200,
    totalTickets: 300,
    category: 'entertainment',
    isFeatured: false,
    organizer: 'Crypto Cinema Collective'
  }
];

// Get all events
export const getEvents = async (): Promise<Event[]> => {
  try {
    // In a real app, this would call the backend API
    // const response = await api.get('/events');
    // return response.data;
    
    // For now, return mock data with a delay to simulate network request
    return new Promise(resolve => {
      setTimeout(() => resolve(mockEvents), 800);
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Get event by ID
export const getEventById = async (id: string): Promise<Event> => {
  try {
    // In a real app, this would call the backend API
    // const response = await api.get(`/events/${id}`);
    // return response.data;
    
    // For now, return mock data with a delay to simulate network request
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const event = mockEvents.find(e => e.id === id);
        if (event) {
          resolve(event);
        } else {
          reject(new Error('Event not found'));
        }
      }, 800);
    });
  } catch (error) {
    console.error(`Error fetching event with id ${id}:`, error);
    throw error;
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