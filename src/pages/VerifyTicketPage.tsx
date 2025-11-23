import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder, getEventById, OrderTx } from '../services/api';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

const VerifyTicketPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderTx | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Remove verificationStatus as it's not being used effectively

  useEffect(() => {
    const verifyTicket = async () => {
      if (!orderId) {
        setError('No ticket ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Check if we're in an iframe (common in some QR code scanners)
        const isInIframe = window !== window.parent;
        if (isInIframe) {
          // If in iframe, we might need to handle it differently
          console.log('Running in iframe context');
        }

        // Get the order details
        const ticketData = await getOrder(orderId);
        
        // If we don't have an event title, try to fetch it
        if (!ticketData.eventTitle && ticketData.eventId) {
          try {
            const eventData = await getEventById(ticketData.eventId);
            ticketData.eventTitle = eventData.title;
          } catch (e) {
            console.warn('Could not fetch event details', e);
          }
        }
        
        setOrder(ticketData);
        setLoading(false);
        
      } catch (err: any) {
        console.error('Error verifying ticket:', err);
        setError(err?.response?.data?.message || 'Failed to verify ticket. Please check your internet connection and try again.');
        setLoading(false);
      }
    };

    verifyTicket();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Verifying Ticket</h2>
          <p className="text-gray-600 dark:text-gray-400">Please wait while we verify your ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Ticket Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn't find a ticket with the provided ID. Please check the code and try again.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Format date and time
  const eventDate = new Date(order.timestamp);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-white/20 mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Ticket Verified</h1>
            <p className="text-primary-100">This ticket is valid for entry</p>
          </div>

          {/* Ticket Info */}
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{order.eventTitle || 'Event'}</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {formattedDate} • {formattedTime}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Order #</p>
                  <p className="font-medium">{orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ticket Type</p>
                  <p className="font-medium">{order.categoryName || 'General Admission'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                  <p className="font-medium">{order.quantity || '1'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    Valid
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Ticket Holder Information</h3>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="font-medium">Issued To</p>
                <p className="text-gray-600 dark:text-gray-300">
                  {order.to ? `${order.to.substring(0, 6)}...${order.to.substring(order.to.length - 4)}` : 'Guest User'}
                </p>
                {order.timestamp && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Purchased on {new Date(order.timestamp).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Powered by <span className="font-medium text-primary-600 dark:text-primary-400">BlockTix</span>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyTicketPage;
