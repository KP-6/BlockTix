import React, { useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

const AdminKeyGate: React.FC<Props> = ({ children }) => {
  const [key, setKey] = useState<string>('');
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ADMIN_API_KEY');
    if (saved) setHasKey(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!key.trim()) {
      setError('Please enter an admin API key');
      return;
    }
    localStorage.setItem('ADMIN_API_KEY', key.trim());
    setHasKey(true);
  };

  if (!hasKey) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Admin Access</h2>
          {error && (
            <div className="mb-3 p-2 rounded bg-error-50 text-error-700 text-sm">{error}</div>
          )}
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Admin API Key</label>
          <input
            type="password"
            className="w-full mb-4 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Paste your ADMIN_API_KEY"
          />
          <button type="submit" className="w-full py-2 rounded bg-primary-600 text-white hover:bg-primary-700">Continue</button>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">You can clear the key anytime from browser storage.</p>
        </form>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminKeyGate;
