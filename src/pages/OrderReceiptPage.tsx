import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder, getEventById, OrderTx } from '../services/api';
import { AlertCircle, ArrowLeft, Download, Share2 } from 'lucide-react';
import TicketQRCode from '../components/TicketQRCode';

const OrderReceiptPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderTx | null>(null);
  const [eventTitle, setEventTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!orderId) { setLoading(false); return; }
      try {
        const o = await getOrder(orderId);
        setOrder(o);
        try {
          const ev = await getEventById(o.eventId);
          setEventTitle(ev.title);
        } catch {}
      } catch (e: any) {
        setError(e?.response?.data?.message || e.message || 'Failed to load receipt');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [orderId]);

  if (loading) {
    return <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">Loading...</div>;
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <AlertCircle className="h-16 w-16 text-error-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">{error || 'Receipt not found'}</h2>
        <Link to="/orders" className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg">Back to Orders</Link>
      </div>
    );
  }

  const amountInr = `₹${Number(order.amount || 0).toFixed(2)}`;
  const when = new Date(order.timestamp).toLocaleString();
  const orderNumber = (order as any).orderId || orderId || '';

  const handleDownload = () => {
    // This would be implemented to download the ticket as an image
    console.log('Download ticket');
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `My Ticket for ${eventTitle}`,
          text: `Check out my ticket for ${eventTitle}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6">
        <Link to="/orders" className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Orders
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Ticket QR Code */}
        <div className="lg:col-span-1">
          <TicketQRCode
            orderId={orderNumber}
            eventTitle={eventTitle || order.eventId}
            quantity={order.quantity || 1}
            categoryName={order.categoryName}
            amount={order.amount || 0}
            timestamp={order.timestamp}
          />
          
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </button>
          </div>
        </div>

        {/* Right column - Order Details */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Order Confirmation</h1>
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Event Details</h2>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white">{eventTitle || order.eventId}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {new Date(order.timestamp).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Order Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Order Number</p>
                    <p className="font-medium">{orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Order Date</p>
                    <p className="font-medium">{when}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <p className="font-medium text-green-600 dark:text-green-400">Confirmed</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Ticket Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ticket Type</p>
                    <p className="font-medium">{order.categoryName || 'General Admission'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                    <p className="font-medium">{order.quantity || '1'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                    <p className="font-medium">{amountInr}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Need Help?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                If you have any questions about your order, please contact our support team.
              </p>
              <div className="flex flex-wrap gap-3">
                <a 
                  href="mailto:support@blocktix.com" 
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Contact Support
                </a>
                <Link 
                  to="/faq" 
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  View FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReceiptPage;
