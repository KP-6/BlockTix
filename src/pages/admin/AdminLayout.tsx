import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const NavLink: React.FC<{ to: string; label: string }> = ({ to, label }) => {
  const location = useLocation();
  const active = location.pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-primary-600 text-white'
          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {label}
    </Link>
  );
};

const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <aside className="border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 p-4 md:p-6 bg-white dark:bg-gray-900">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Organizer Admin</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Manage events and tickets</p>
        </div>
        <nav className="space-y-1">
          <NavLink to="/admin" label="Dashboard" />
          <NavLink to="/admin/events" label="Events" />
          <NavLink to="/admin/rules" label="Resale Rules" />
          <NavLink to="/admin/access" label="Access Control" />
          <NavLink to="/admin/tx" label="Transactions" />
          <NavLink to="/admin/analytics-categories" label="Category Analytics" />
        </nav>
        <div className="mt-6">
          <button
            onClick={() => { localStorage.removeItem('ADMIN_API_KEY'); window.location.reload(); }}
            className="w-full px-3 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="p-4 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-[calc(100vh-64px)]">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
