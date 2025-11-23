export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  locationDetails?: string;
  image: string;
  price: number;
  availableTickets: number;
  totalTickets: number;
  category: string;
  isFeatured: boolean;
  organizer: string;
}