import React, { useState } from 'react';
import { addToWhitelist, addToBlacklist } from '../../services/admin';

const AccessAdmin: React.FC = () => {
  const [wallets, setWallets] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);

  const parseWallets = () => wallets.split(/[,\n\s]+/).map(w => w.trim()).filter(Boolean);

  const addWL = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const list = parseWallets();
    if (!list.length) { setMessage('Enter at least one wallet'); return; }
    await addToWhitelist(list);
    setMessage('Added to whitelist');
  };

  const addBL = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const list = parseWallets();
    if (!list.length) { setMessage('Enter at least one wallet'); return; }
    await addToBlacklist(list);
    setMessage('Added to blacklist');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Access Control</h2>
      {message && (<div className="mb-4 p-3 rounded bg-success-50 text-success-700 text-sm">{message}</div>)}
      <form className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 max-w-3xl">
        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Wallet addresses (comma, space, or newline separated)</label>
        <textarea className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" rows={6} value={wallets} onChange={e=>setWallets(e.target.value)} placeholder="0xabc..., 0xdef..., ..." />
        <div className="mt-3 flex gap-3">
          <button onClick={addWL} className="px-4 py-2 rounded bg-primary-600 text-white">Add to Whitelist</button>
          <button onClick={addBL} className="px-4 py-2 rounded bg-error-600 text-white">Add to Blacklist</button>
        </div>
      </form>
    </div>
  );
};

export default AccessAdmin;
