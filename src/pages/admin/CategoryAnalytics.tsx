import React, { useEffect, useState } from 'react';
import { getCategoryBreakdown, getRecentTransactions } from '../../services/admin';

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
        let data = await getCategoryBreakdown();
        // Fallback: if backend returns empty (e.g., dev mode without Firestore),
        // derive breakdown from recent transactions endpoint.
        if (!Array.isArray(data) || data.length === 0) {
          const txs: any[] = await getRecentTransactions();
          const acc: Record<string, Row> = {};
          for (const t of txs) {
            const key = `${t.eventId || 'unknown'}::${t.categoryName || 'none'}`;
            if (!acc[key]) acc[key] = { eventId: t.eventId || 'unknown', categoryName: t.categoryName || null, purchases: 0, resales: 0, totalAmount: 0 };
            if (t.type === 'purchase') acc[key].purchases += Number(t.quantity || 1);
            if (t.type === 'resell') acc[key].resales += 1;
            acc[key].totalAmount += Number(t.amount || 0);
          }
          data = Object.values(acc);
        }
        setRows(data as Row[]);
      } catch (e: any) {
        try {
          // Last-chance fallback: compute from recent transactions if categories call failed outright
          const txs: any[] = await getRecentTransactions();
          const acc: Record<string, Row> = {};
          for (const t of txs) {
            const key = `${t.eventId || 'unknown'}::${t.categoryName || 'none'}`;
            if (!acc[key]) acc[key] = { eventId: t.eventId || 'unknown', categoryName: t.categoryName || null, purchases: 0, resales: 0, totalAmount: 0 };
            if (t.type === 'purchase') acc[key].purchases += Number(t.quantity || 1);
            if (t.type === 'resell') acc[key].resales += 1;
            acc[key].totalAmount += Number(t.amount || 0);
          }
          setRows(Object.values(acc));
        } catch (e2: any) {
          setError(e2?.response?.data?.message || e?.response?.data?.message || e2?.message || e?.message || 'Failed to load analytics');
        }
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
