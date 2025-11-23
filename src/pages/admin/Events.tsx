import React, { useEffect, useState } from 'react';
import { upsertEvent, publishEvent, deleteEvent } from '../../services/admin';
import api from '../../services/api';

interface EventForm {
  id?: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image?: string;
  price: number;
  totalTickets: number;
  category: string;
  isFeatured: boolean;
  categories: Array<{ name: string; price: number; total: number; available?: number; }>;
}

const defaultForm: EventForm = {
  title: '',
  description: '',
  date: '',
  location: '',
  image: '',
  price: 0,
  totalTickets: 0,
  category: 'general',
  isFeatured: false,
  categories: [],
};

const EventsAdmin: React.FC = () => {
  const [form, setForm] = useState<EventForm>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  const loadEvents = async () => {
    try {
      setError(null);
      const { data } = await api.get('/events');
      setEvents(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Failed to load events');
    }
  };

  useEffect(() => { loadEvents(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Normalize categories: drop empty names and non-positive totals
      const categories = (form.categories || [])
        .map(c => ({
          name: c.name.trim(),
          price: Number(c.price) || 0,
          total: Number(c.total) || 0,
          available: typeof c.available === 'number' ? Number(c.available) : Number(c.total) || 0,
        }))
        .filter(c => c.name && c.total > 0);

      await upsertEvent({ ...form, categories });
      setForm(defaultForm);
      await loadEvents();
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Events</h2>

      {error && (
        <div className="mb-4 p-3 rounded bg-error-50 text-error-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-8">
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">Title</label>
          <input className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">Location</label>
          <input className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" value={form.location} onChange={e=>setForm({...form, location:e.target.value})} required />
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">Date/Time</label>
          <input type="datetime-local" className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} required />
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">Image URL</label>
          <input className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" value={form.image} onChange={e=>setForm({...form, image:e.target.value})} />
        </div>
        {/* Base price and totals (used when categories are not provided). If categories exist, these are ignored by backend. */}
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">Base Price (INR)</label>
          <input type="number" min={0} step={0.01} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" value={form.price} onChange={e=>setForm({...form, price:Number(e.target.value)})} />
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">Total Tickets</label>
          <input type="number" min={0} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" value={form.totalTickets} onChange={e=>setForm({...form, totalTickets:Number(e.target.value)})} />
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">Category</label>
          <input className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" value={form.category} onChange={e=>setForm({...form, category:e.target.value})} />
        </div>
        <div className="flex items-center gap-2">
          <input id="featured" type="checkbox" checked={form.isFeatured} onChange={e=>setForm({...form, isFeatured:e.target.checked})} />
          <label htmlFor="featured" className="text-sm text-gray-600 dark:text-gray-300">Featured</label>
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-gray-600 dark:text-gray-300">Description</label>
          <textarea className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" rows={3} value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
        </div>

        {/* Seat Categories */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">Seat Categories</h4>
            <button type="button" className="px-3 py-1 rounded bg-primary-600 text-white" onClick={()=> setForm({...form, categories: [...form.categories, { name: '', price: 0, total: 0 }]})}>Add Category</button>
          </div>
          {form.categories.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">No seat categories added. The base price and total tickets will be used.</p>
          ) : (
            <div className="space-y-3">
              {form.categories.map((c, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                  <div className="md:col-span-4">
                    <label className="text-sm text-gray-600 dark:text-gray-300">Name</label>
                    <input className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" value={c.name} onChange={e=>{
                      const next=[...form.categories]; next[idx] = { ...next[idx], name:e.target.value }; setForm({...form, categories: next});
                    }} placeholder="VIP / Standard" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-sm text-gray-600 dark:text-gray-300">Price (INR)</label>
                    <input type="number" min={0} step={0.01} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" value={c.price} onChange={e=>{
                      const next=[...form.categories]; next[idx] = { ...next[idx], price:Number(e.target.value) }; setForm({...form, categories: next});
                    }} />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-sm text-gray-600 dark:text-gray-300">Total</label>
                    <input type="number" min={0} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" value={c.total} onChange={e=>{
                      const next=[...form.categories]; const total=Number(e.target.value); const avail = typeof next[idx].available === 'number' ? Math.min(Number(next[idx].available), total) : total; next[idx] = { ...next[idx], total, available: avail }; setForm({...form, categories: next});
                    }} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600 dark:text-gray-300">Available</label>
                    <input type="number" min={0} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" value={typeof c.available === 'number' ? c.available : c.total} onChange={e=>{
                      const next=[...form.categories]; const newAvail = Number(e.target.value); next[idx] = { ...next[idx], available: newAvail }; setForm({...form, categories: next});
                    }} />
                  </div>
                  <div className="md:col-span-12">
                    <button type="button" className="text-sm text-error-600" onClick={()=>{
                      const next=[...form.categories]; next.splice(idx,1); setForm({...form, categories: next});
                    }}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Computed summary */}
        {form.categories.length > 0 && (
          <div className="md:col-span-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <span className="font-medium">Computed Base Price:</span>{' '}
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Math.min(...form.categories.map(c=>Number(c.price||0))))}
            </div>
            <div>
              <span className="font-medium">Computed Total Tickets:</span>{' '}
              {form.categories.reduce((s,c)=> s + Number(c.total||0), 0)}
            </div>
            <div>
              <span className="font-medium">Computed Available Tickets:</span>{' '}
              {form.categories.reduce((s,c)=> s + Number((typeof c.available==='number'? c.available : c.total)||0), 0)}
            </div>
          </div>
        )}
        <div className="md:col-span-2 flex gap-3">
          <button disabled={loading} className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60">{form.id ? 'Update Event' : 'Create Event'}</button>
          <button type="button" className="px-4 py-2 rounded border" onClick={()=>setForm(defaultForm)}>Reset</button>
        </div>
      </form>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Existing Events</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((ev) => (
          <div key={ev.id} className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">{ev.title}</div>
                <div className="text-xs text-gray-500">{ev.status || 'draft'}</div>
              </div>
              <div className="flex gap-2">
                <button className="text-sm px-3 py-1 rounded border" onClick={()=>setForm({
                  id: ev.id,
                  title: ev.title || '',
                  description: ev.description || '',
                  date: ev.date || '',
                  location: ev.location || '',
                  image: ev.image || '',
                  price: Number(ev.price || 0),
                  totalTickets: Number(ev.totalTickets || 0),
                  category: ev.category || 'general',
                  isFeatured: Boolean(ev.isFeatured),
                  categories: Array.isArray(ev.categories) ? ev.categories.map((c:any)=>({
                    name: String(c.name || ''),
                    price: Number(c.price || 0),
                    total: Number(c.total || 0),
                    available: typeof c.available === 'number' ? Number(c.available) : Number(c.total || 0),
                  })) : [],
                })}>Edit</button>
                <button className="text-sm px-3 py-1 rounded bg-primary-600 text-white" onClick={async()=>{ await publishEvent(ev.id); await loadEvents(); }}>Publish</button>
                <button className="text-sm px-3 py-1 rounded bg-error-600 text-white" onClick={async()=>{ await deleteEvent(ev.id); await loadEvents(); }}>Delete</button>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">{ev.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsAdmin;
