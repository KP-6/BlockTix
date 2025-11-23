import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Ticket, 
  ArrowLeft, 
  AlertCircle,
  Share2,
  Heart,
  Info
} from 'lucide-react';
import { Event } from '../types/Event';
import { getEventById } from '../services/api';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const { isConnected, connectWallet } = useWeb3();
  const { currentUser } = useAuth();

  // Update page title when event loads
  useEffect(() => {
    if (event) {
      document.title = `${event.title} - BlockTix`;
    } else {
      document.title = 'Event Details - BlockTix';
    }
  }, [event]);

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getEventById(id);
        setEvent(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details. Please try again later.');
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleQuantityChange = (value: number) => {
    if (value < 1) return;
    if (event && value > event.availableTickets) return;
    setQuantity(value);
  };

  const handlePurchase = () => {
    if (!isConnected) {
      connectWallet();
      return;
    }
    
    if (!currentUser) {
      // Redirect to login
      window.location.href = `/login?redirect=/events/${id}`;
      return;
    }
    
    // Purchase logic would go here
    alert(`Purchasing ${quantity} tickets for event: ${event?.title}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: `Check out this event: ${event?.title}`,
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch((err) => console.error('Failed to copy: ', err));
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 w-3/4 mb-4 rounded"></div>
          <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded-lg mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 w-1/2 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 w-full rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 w-full rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 w-3/4 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-40 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <AlertCircle className="h-16 w-16 text-error-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {error || 'Event not found'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          We couldn't find the event you're looking for. It may have been removed or the URL might be incorrect.
        </p>
        <Link 
          to="/events" 
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Link>
      </div>
    );
  }

  const totalPrice = event.price * quantity;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link 
          to="/events" 
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Events
        </Link>
      </div>

      {/* Event header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            {event.title}
          </h1>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-full ${
                isLiked 
                  ? 'text-error-500 bg-error-50 dark:bg-error-900/20' 
                  : 'text-gray-500 hover:text-error-500 bg-gray-100 dark:bg-gray-800 hover:bg-error-50 dark:hover:bg-error-900/20'
              } transition-colors`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={handleShare}
              className="p-2 rounded-full text-gray-500 hover:text-primary-500 bg-gray-100 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
            {event.category}
          </span>
          
          {event.isFeatured && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300">
              Featured
            </span>
          )}
          
          {event.availableTickets < 10 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-300">
              Limited Tickets
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1.5" />
            <span>{formatDate(event.date)}</span>
          </div>
          
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1.5" />
            <span>{formatTime(event.date)}</span>
          </div>
          
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1.5" />
            <span>{event.location}</span>
          </div>
          
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1.5" />
            <span>{event.availableTickets} tickets left</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Event details */}
        <div className="md:col-span-2">
          {/* Event image */}
          <div className="rounded-xl overflow-hidden mb-8 aspect-[16/9]">
            <img 
              src={event.image} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Event description */}
          <div className="prose dark:prose-invert max-w-none">
            <h2>About This Event</h2>
            <p>{event.description}</p>
            
            <h3>Event Schedule</h3>
            <p>Doors Open: {formatTime(new Date(new Date(event.date).getTime() - 60 * 60 * 1000).toString())}</p>
            <p>Event Starts: {formatTime(event.date)}</p>
            
            <h3>Location Details</h3>
            <p>{event.locationDetails || event.location}</p>
          </div>
        </div>
        
        {/* Ticket purchase */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-24">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Get Tickets
            </h3>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">Price per ticket:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {event.price === 0 ? 'Free' : `${event.price} MATIC`}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                <div className="flex items-center">
                  <button 
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-l-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 disabled:opacity-50"
                  >
                    -
                  </button>
                  <input 
                    type="text" 
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) handleQuantityChange(val);
                    }}
                    className="w-12 h-8 border-y border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-center text-gray-900 dark:text-white"
                  />
                  <button 
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= event.availableTickets}
                    className="w-8 h-8 flex items-center justify-center rounded-r-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-4"></div>
              
              <div className="flex justify-between items-center mb-6">
                <span className="font-medium text-gray-900 dark:text-white">Total:</span>
                <span className="text-xl font-bold text-primary-600">
                  {totalPrice === 0 ? 'Free' : `${totalPrice} MATIC`}
                </span>
              </div>
              
              <button
                onClick={handlePurchase}
                disabled={event.availableTickets === 0}
                className="w-full py-3 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!isConnected ? (
                  <>
                    <Wallet className="h-5 w-5 mr-2" />
                    Connect Wallet
                  </>
                ) : !currentUser ? (
                  <>
                    <Ticket className="h-5 w-5 mr-2" />
                    Sign In to Purchase
                  </>
                ) : event.availableTickets === 0 ? (
                  'Sold Out'
                ) : (
                  <>
                    <Ticket className="h-5 w-5 mr-2" />
                    Purchase Tickets
                  </>
                )}
              </button>
              
              {event.availableTickets <= 10 && event.availableTickets > 0 && (
                <div className="mt-3 text-sm text-error-600 dark:text-error-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Only {event.availableTickets} tickets left!
                </div>
              )}
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 flex items-start">
              <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-primary-500" />
              <p>
                Tickets are delivered as NFTs to your connected wallet. Each NFT represents one ticket and can be transferred or resold on our marketplace.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;