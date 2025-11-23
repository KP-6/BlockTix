import React, { useEffect, useState } from 'react';
import { getCategoryBreakdown } from '../../services/admin';

interface Row {
  eventId: string;
  categoryName: string | null;
  purchases: number;
  resales: number;
  totalAmount: number;
}

const CategoryAnalytics: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const data = await getCategoryBreakdown();
        setRows(data);
      } catch (e: any) {
        setError(e?.response?.data?.message || e.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Category Analytics</h2>
      {loading ? (
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      ) : error ? (
        <p className="text-error-600 dark:text-error-400">{error}</p>
      ) : (
        <div className="overflow-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                <th className="p-3">Event ID</th>
                <th className="p-3">Category</th>
                <th className="p-3">Purchases</th>
                <th className="p-3">Resales</th>
                <th className="p-3">Total Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="p-3">{r.eventId}</td>
                  <td className="p-3">{r.categoryName || '—'}</td>
                  <td className="p-3">{r.purchases}</td>
                  <td className="p-3">{r.resales}</td>
                  <td className="p-3">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(r.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CategoryAnalytics;
