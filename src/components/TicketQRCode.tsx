import { QRCodeSVG } from 'qrcode.react';
import { Ticket, Clock } from 'lucide-react';
import { useEffect, useState, useCallback, useMemo } from 'react';

// Browser-compatible function to generate a time-based token that changes every 10 seconds
const generateTimeBasedToken = async (baseString: string): Promise<string> => {
  try {
    const now = Math.floor(Date.now() / 30000); // Changes every 30 seconds
    const msgUint8 = new TextEncoder().encode(`${baseString}-${now}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, 8); // Use first 8 chars of hash as token
  } catch (error) {
    console.error('Error generating token:', error);
    // Fallback to a simple timestamp-based token if Web Crypto fails
    return Math.floor(Math.random() * 100000000).toString(16).padStart(8, '0');
  }
};

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
  const [currentToken, setCurrentToken] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(30);

  // Update the token and reset the timer
  const updateToken = useCallback(async () => {
    try {
      const newToken = await generateTimeBasedToken(`${orderId}-${eventTitle}`);
      setCurrentToken(newToken);
      setTimeLeft(30); // Reset the countdown to 30 seconds
      console.log('Token updated at:', new Date().toISOString());
    } catch (error) {
      console.error('Failed to update token:', error);
      // Fallback to a simple timestamp-based token
      setCurrentToken(Math.floor(Date.now() / 1000).toString(36).slice(-8));
    }
  }, [orderId, eventTitle]);

  // Set up the timer
  useEffect(() => {
    let isMounted = true;
    let tokenInterval: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;
    
    const init = async () => {
      // Initial token update
      await updateToken();
      
      if (!isMounted) return;
      
      // Update token every 30 seconds
      tokenInterval = setInterval(updateToken, 30000);

      // Update countdown every second
      countdownInterval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            return 30; // Reset to 30, but don't update the token here
          }
          return prev - 1;
        });
      }, 1000);
    };

    init();

    return () => {
      isMounted = false;
      clearInterval(tokenInterval);
      clearInterval(countdownInterval);
    };
  }, [updateToken]);
  // Memoize the QR code value to prevent unnecessary re-renders
  const qrValue = useMemo(() => {
    const generatedAt = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    return `BLOCK TIX TICKET

EVENT: ${eventTitle}
ORDER: ${orderId}
TICKET: ${quantity}x ${categoryName || 'General'}
AMOUNT: ₹${amount.toFixed(2)}
EVENT DATE: ${new Date(timestamp).toLocaleDateString()}
GENERATED: ${generatedAt}
TOKEN: ${currentToken}

This QR code refreshes every 30 seconds`;
  }, [currentToken, eventTitle, orderId, quantity, categoryName, amount, timestamp]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
          <Ticket className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your E-Ticket</h2>
        <div className="flex items-center justify-center mt-2 text-sm text-gray-600 dark:text-gray-300">
          <Clock className="h-4 w-4 mr-1" />
          <span>Refreshes in: {timeLeft}s (Token: {currentToken.substring(0, 4)}...)</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This QR code automatically updates every 30 seconds</p>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 mb-4">
          <div className="w-[200px] h-[200px] flex items-center justify-center">
            <QRCodeSVG 
              value={qrValue}
              size={200}
              level="H" // High error correction level
              includeMargin={true}
              className="w-full h-auto"
            />
          </div>
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
