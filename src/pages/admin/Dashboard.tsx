import React, { useEffect, useState } from 'react';
import { getAnalyticsSummary } from '../../services/admin';

const Stat: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5">
    <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
  </div>
);

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ totalTickets: number; soldTickets: number; remainingTickets: number; events: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const data = await getAnalyticsSummary();
        setStats(data);
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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sales Dashboard</h2>
      {loading ? (
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      ) : error ? (
        <p className="text-error-600 dark:text-error-400">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Events" value={stats?.events ?? 0} />
          <Stat label="Tickets Issued" value={stats?.totalTickets ?? 0} />
          <Stat label="Tickets Sold" value={stats?.soldTickets ?? 0} />
          <Stat label="Remaining" value={stats?.remainingTickets ?? 0} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
