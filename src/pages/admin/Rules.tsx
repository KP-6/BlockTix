import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { updateResaleRules } from '../../services/admin';

const RulesAdmin: React.FC = () => {
  const [eventId, setEventId] = useState<string>('');
  const [events, setEvents] = useState<any[]>([]);
  const [maxMult, setMaxMult] = useState<number>(1.0);
  const [allowResale, setAllowResale] = useState<boolean>(true);
  const [allowTransfer, setAllowTransfer] = useState<boolean>(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/events');
        setEvents(data);
        if (data.length) setEventId(data[0].id);
      } catch (e) { /* ignore */ }
    };
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!eventId) { setMessage('Select an event'); return; }
    await updateResaleRules(eventId, { maxResalePriceMultiplier: maxMult, allowResale, allowTransfer });
    setMessage('Rules updated');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Resale & Transfer Rules</h2>
      {message && (<div className="mb-4 p-3 rounded bg-success-50 text-success-700 text-sm">{message}</div>)}
      <form onSubmit={save} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">Event</label>
          <select value={eventId} onChange={e=>setEventId(e.target.value)} className="w-full mt-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
            {events.map((ev:any)=> (<option key={ev.id} value={ev.id}>{ev.title}</option>))}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">Max Resale Price Multiplier</label>
          <input type="number" step={0.1} min={0} value={maxMult} onChange={e=>setMaxMult(Number(e.target.value))} className="w-full mt-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
        </div>
        <div className="flex items-center gap-2">
          <input id="allowResale" type="checkbox" checked={allowResale} onChange={e=>setAllowResale(e.target.checked)} />
          <label htmlFor="allowResale" className="text-sm text-gray-600 dark:text-gray-300">Allow Resale</label>
        </div>
        <div className="flex items-center gap-2">
          <input id="allowTransfer" type="checkbox" checked={allowTransfer} onChange={e=>setAllowTransfer(e.target.checked)} />
          <label htmlFor="allowTransfer" className="text-sm text-gray-600 dark:text-gray-300">Allow Transfer</label>
        </div>
        <div className="md:col-span-2">
          <button className="px-4 py-2 rounded bg-primary-600 text-white">Save Rules</button>
        </div>
      </form>
    </div>
  );
};

export default RulesAdmin;
