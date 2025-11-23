import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getOrders, OrderTx } from '../services/api';
import { Link } from 'react-router-dom';

const OrdersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<OrderTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!currentUser?.email) { setLoading(false); return; }
      try {
        const data = await getOrders(currentUser.email);
        setOrders(data);
      } catch (e: any) {
        setError(e?.response?.data?.message || e.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [currentUser?.email]);

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center">Please <Link to="/login?redirect=/orders" className="text-primary-600">log in</Link> to view your orders.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Your Orders</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-error-600">{error}</p>
      ) : orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/30">
              <tr>
                <th className="text-left p-3">Order ID</th>
                <th className="text-left p-3">Event</th>
                <th className="text-left p-3">Quantity</th>
                <th className="text-left p-3">Amount</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={(o as any).orderId || o.id} className="border-t dark:border-gray-700">
                  <td className="p-3">{(o as any).orderId || o.id}</td>
                  <td className="p-3">{o.eventId}</td>
                  <td className="p-3">{o.quantity || '-'}</td>
                  <td className="p-3">₹{Number(o.amount||0).toFixed(2)}</td>
                  <td className="p-3">{new Date(o.timestamp).toLocaleString()}</td>
                  <td className="p-3"><Link to={`/orders/${(o as any).orderId || o.id}`} className="text-primary-600">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
