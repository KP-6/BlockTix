import { QRCodeSVG } from 'qrcode.react';
import { Ticket } from 'lucide-react';

interface TicketQRCodeProps {
  orderId: string;
  eventTitle: string;
  quantity: number;
  categoryName?: string;
  amount: number;
  timestamp: string;
}

const TicketQRCode: React.FC<TicketQRCodeProps> = ({
  orderId,
  eventTitle,
  quantity,
  categoryName,
  amount,
  timestamp
}) => {
  // Use environment variable for production URL, fallback to current origin
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const verificationUrl = `${baseUrl}/ticket?event=${encodeURIComponent(eventTitle)}&order=${orderId}&qty=${quantity}&cat=${encodeURIComponent(categoryName || 'General')}&date=${new Date(timestamp).toISOString().split('T')[0]}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
          <Ticket className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your E-Ticket</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Show this QR code at the event entrance</p>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 mb-4">
          <QRCodeSVG 
            value={verificationUrl}
            size={200}
            level="H" // High error correction level
            includeMargin={true}
            className="w-full h-auto"
          />
        </div>
        
        <div className="space-y-4 w-full">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Event</p>
              <p className="font-medium text-gray-900 dark:text-white">{eventTitle}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Date</p>
              <p className="font-medium text-gray-900 dark:text-white">{new Date(timestamp).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Tickets</p>
              <p className="font-medium text-gray-900 dark:text-white">{quantity} × {categoryName || 'General'}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Amount</p>
              <p className="font-medium text-gray-900 dark:text-white">₹{amount.toFixed(2)}</p>
            </div>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Order #</p>
            <p className="font-mono text-sm text-gray-900 dark:text-white">{orderId}</p>
          </div>
          
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Show this QR code at the event entrance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketQRCode;
