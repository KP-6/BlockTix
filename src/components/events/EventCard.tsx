import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { Event } from '../../types/Event';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { id, title, date, location, image, price, availableTickets, totalTickets } = event;

  // Calculate percentage of tickets sold
  const soldPercentage = Math.floor(((totalTickets - availableTickets) / totalTickets) * 100);
  
  // Format date
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  
  // Format time
  const formattedTime = new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Link 
      to={`/events/${id}`}
      className="group flex flex-col bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Image container */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-70"></div>
        
        {/* Price tag */}
        <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
          {price === 0 ? 'Free' : `${price} MATIC`}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-5 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {title}
        </h3>
        
        <div className="space-y-2 mb-4 flex-1">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="text-sm">{formattedDate}</span>
          </div>
          
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-2" />
            <span className="text-sm">{formattedTime}</span>
          </div>
          
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm line-clamp-1">{location}</span>
          </div>
        </div>
        
        {/* Tickets availability */}
        <div className="mt-auto">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{availableTickets} available</span>
            </div>
            <span>{soldPercentage}% sold</span>
          </div>
          
          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                soldPercentage > 80 ? 'bg-error-500' : soldPercentage > 50 ? 'bg-warning-500' : 'bg-success-500'
              }`}
              style={{ width: `${soldPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;