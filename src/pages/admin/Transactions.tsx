import React, { useEffect, useState } from 'react';
import { getRecentTransactions } from '../../services/admin';

interface TxItem {
  id: string;
  from?: string;
  to?: string;
  type?: string;
  amount?: number;
  eventId?: string;
  txHash?: string;
  timestamp?: string;
}

const Transactions: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<TxItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const data = await getRecentTransactions();
        setItems(data);
      } catch (e: any) {
        setError(e?.response?.data?.message || e.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Transactions</h2>
      {loading ? (
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      ) : error ? (
        <p className="text-error-600 dark:text-error-400">{error}</p>
      ) : (
        <div className="overflow-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                <th className="p-3">Time</th>
                <th className="p-3">Type</th>
                <th className="p-3">From</th>
                <th className="p-3">To</th>
                <th className="p-3">Event</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Tx Hash</th>
              </tr>
            </thead>
            <tbody>
              {items.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="p-3">{tx.timestamp ? new Date(tx.timestamp).toLocaleString() : '-'}</td>
                  <td className="p-3">{tx.type || '-'}</td>
                  <td className="p-3">{tx.from || '-'}</td>
                  <td className="p-3">{tx.to || '-'}</td>
                  <td className="p-3">{tx.eventId || '-'}</td>
                  <td className="p-3">{typeof tx.amount === 'number' ? tx.amount : '-'}</td>
                  <td className="p-3">
                    {tx.txHash ? (
                      <a className="text-primary-600" href={`https://polygonscan.com/tx/${tx.txHash}`} target="_blank" rel="noreferrer">{tx.txHash.slice(0,10)}...</a>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Transactions;
