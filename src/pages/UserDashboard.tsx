import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getOrders, OrderTx, getEventById } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

const Stat: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5">
    <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
  </div>
);

const UserDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventTitles, setEventTitles] = useState<Record<string, string>>({});

  useEffect(() => {
    const run = async () => {
      if (!currentUser?.email) { setLoading(false); return; }
      try {
        setLoading(true);
        const data = await getOrders(currentUser.email);
        setOrders(data);
        // Fetch event titles in the background
        const ids = Array.from(new Set(data.map(d => d.eventId)));
        const titles: Record<string, string> = {};
        await Promise.all(ids.map(async (id) => {
          try {
            const ev = await getEventById(id);
            titles[id] = ev.title;
          } catch {}
        }));
        setEventTitles(titles);
      } catch (e: any) {
        setError(e?.response?.data?.message || e.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [currentUser?.email]);

  const totals = useMemo(() => {
    const totalOrders = orders.length;
    const tickets = orders.reduce((s, o) => s + Number(o.quantity || 0), 0);
    const spent = orders.reduce((s, o) => s + Number(o.amount || 0), 0);
    return { totalOrders, tickets, spent };
  }, [orders]);

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center">Please <Link to="/login?redirect=/dashboard" className="text-primary-600">log in</Link> to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Dashboard</h1>
          <div className="text-gray-600 dark:text-gray-400 text-sm">{currentUser.displayName || currentUser.email}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>navigate('/orders')} className="px-3 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">View All Orders</button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-error-600">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Stat label="Total Orders" value={totals.totalOrders} />
            <Stat label="Tickets Purchased" value={totals.tickets} />
            <Stat label="Total Spent (₹)" value={totals.spent.toFixed(2)} />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-800">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 font-semibold">Recent Orders</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/30">
                  <tr>
                    <th className="text-left p-3">Order ID</th>
                    <th className="text-left p-3">Event</th>
                    <th className="text-left p-3">Qty</th>
                    <th className="text-left p-3">Amount</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 10).map((o) => (
                    <tr key={(o as any).orderId || o.id} className="border-t dark:border-gray-800">
                      <td className="p-3">{(o as any).orderId || o.id}</td>
                      <td className="p-3">{eventTitles[o.eventId] || o.eventId}</td>
                      <td className="p-3">{o.quantity || '-'}</td>
                      <td className="p-3">₹{Number(o.amount || 0).toFixed(2)}</td>
                      <td className="p-3">{new Date(o.timestamp).toLocaleString()}</td>
                      <td className="p-3">
                        <Link to={`/orders/${(o as any).orderId || o.id}`} className="text-primary-600">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserDashboard;
