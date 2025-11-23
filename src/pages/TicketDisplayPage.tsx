import { useSearchParams } from 'react-router-dom';

const TicketDisplayPage = () => {
  const [searchParams] = useSearchParams();
  
  const ticketInfo = {
    event: searchParams.get('event') || 'Event',
    orderId: searchParams.get('order') || 'N/A',
    quantity: searchParams.get('qty') || '1',
    category: searchParams.get('cat') || 'General',
    date: searchParams.get('date') || new Date().toLocaleDateString()
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Event Ticket</h1>
          <p className="text-gray-500 mt-1">Present this at the entrance</p>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Event</p>
            <p className="font-medium">{ticketInfo.event}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Order #</p>
              <p className="font-mono">{ticketInfo.orderId}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Tickets</p>
              <p>{ticketInfo.quantity} × {ticketInfo.category}</p>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Date</p>
            <p>{new Date(ticketInfo.date).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">Scan this QR code for entry</p>
        </div>
      </div>
    </div>
  );
};

export default TicketDisplayPage;
