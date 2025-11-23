import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit as fsLimit } from 'firebase/firestore';

// Load environment variables
dotenv.config();

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Dev auto-seed helpers
const getSampleEvents = () => ([
  {
    title: 'Sunburn Music Festival – Goa 2025',
    location: 'Vagator Beach, Goa',
    date: '2025-12-27T16:00:00+05:30',
    description: 'Asia\'s biggest music festival in Goa. Experience top EDM artists over 3 days!',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1600&auto=format&fit=crop',
    category: 'Music',
    isFeatured: true,
    categories: [
      { name: 'General Pass (Per Day)', price: 4999, total: 15000 },
      { name: 'VIP Pass (3 Days)', price: 12000, total: 5000 },
    ],
    rules: { allowResale: true, maxResalePriceMultiplier: 1.0, minAge: 18 },
  },
  {
    title: 'India vs Australia – T20 Match',
    location: 'M. Chinnaswamy Stadium, Bengaluru',
    date: '2026-02-14T19:00:00+05:30',
    description: 'High-voltage India vs Australia T20 cricket match in Bengaluru! Limited seats.',
    image: 'https://images.news18.com/ibnlive/uploads/2023/09/india-australia-1st-odi-live-score-ind-vs-aus-2023-09-2502936abd62ce512f51496b9d397181-16x9.jpg?impolicy=website&width=640&height=360',
    category: 'Sports',
    isFeatured: true,
    categories: [
      { name: 'Stand Tickets', price: 1500, total: 20000 },
      { name: 'Premium Pavilion', price: 4500, total: 12000 },
      { name: 'Corporate Box', price: 12000, total: 3000 },
    ],
    rules: { maxTicketsPerWallet: 4, allowResale: true, maxResalePriceMultiplier: 1.2 },
  },
  {
    title: 'Arijit Singh Live Concert',
    location: 'NSCI Dome, Mumbai',
    date: '2026-01-10T18:30:00+05:30',
    description: 'An evening with Arijit Singh performing his best hits live at NSCI Dome.',
    image: 'https://www.tottenhamhotspurstadium.com/media/xrhfsdgm/2v8a4968.jpg?width=960&height=582&rnd=133898957726470000',
    category: 'Concert',
    isFeatured: false,
    categories: [
      { name: 'Silver', price: 1200, total: 6000 },
      { name: 'Gold', price: 2500, total: 3000 },
      { name: 'Platinum', price: 6000, total: 1000 },
    ],
    rules: { allowTransfer: false, allowResale: true, maxResalePriceMultiplier: 1.0 },
  },
  {
    title: 'Ratha Yatra – Jagannath Puri Darshan Pass',
    location: 'Jagannath Temple, Puri, Odisha',
    date: '2026-07-07T05:00:00+05:30',
    description: 'Special darshan passes for Ratha Yatra. General entry is free; priority darshan available.',
    image: 'https://i0.wp.com/indiacurrents.com/wp-content/uploads/2025/06/Puri-Jagannath-Rath-Yatra.jpg?fit=1200%2C674&ssl=1',
    category: 'Pilgrimage',
    isFeatured: true,
    categories: [
      { name: 'General Entry', price: 0, total: 90000 },
      { name: 'Priority Darshan', price: 500, total: 10000 },
    ],
    rules: { singleUse: true, allowTransfer: false, allowResale: false },
  },
  {
    title: 'Indian Tech Summit 2026',
    location: 'Pragati Maidan, New Delhi',
    date: '2026-03-15T09:00:00+05:30',
    description: 'India\'s premier technology summit with talks, workshops, and networking over 3 days.',
    image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=1600&auto=format&fit=crop',
    category: 'Conference',
    isFeatured: false,
    categories: [
      { name: 'Student Pass', price: 800, total: 3000 },
      { name: 'Regular', price: 2000, total: 4000 },
      { name: 'VIP + Networking', price: 5000, total: 1000 },
    ],
    rules: { refundUntil: '2026-03-10', allowResale: true, maxResalePriceMultiplier: 1.0 },
  },
]);

const autoSeedDev = () => {
  const samples = getSampleEvents();
  DEV_EVENTS = samples.map((s) => {
    const id = slug(`${s.title}-${s.date}`);
    const price = Math.min(...s.categories.map((c:any)=>Number(c.price||0)));
    const totalTickets = s.categories.reduce((sum:any,c:any)=> sum+Number(c.total||0),0);
    const availableTickets = s.categories.reduce((sum:any,c:any)=> sum+Number(c.total||0),0);
    DEV_RULES[id] = s.rules || {};
    return {
      id,
      title: s.title,
      description: s.description,
      date: s.date,
      location: s.location,
      image: s.image,
      category: s.category,
      isFeatured: s.isFeatured,
      categories: s.categories.map((c:any)=>({ ...c, available: Number(c.total||0) })),
      price, totalTickets, availableTickets,
      status: 'live',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

// Dev: auto-seed on server start
if (IN_DEV && DEV_EVENTS.length === 0) {
  autoSeedDev();
}
};

const sendTicketEmail = async (to: string, payload: { title: string; date: string; location: string; quantity: number; categoryName?: string | null; orderId: string; totalAmount: number; }) => {
  if (!emailConfigured) {
    console.warn('SMTP not configured: skipping ticket email');
    return;
  }
  const tx = getMailer();
  if (!tx) return;
  const html = `
    <div style="font-family:Arial,sans-serif;">
      <h2>Your BlockTix Ticket</h2>
      <p>Thank you for your purchase. Here are your ticket details:</p>
      <ul>
        <li><strong>Event:</strong> ${payload.title}</li>
        <li><strong>Date & Time:</strong> ${new Date(payload.date).toLocaleString()}</li>
        <li><strong>Location:</strong> ${payload.location}</li>
        <li><strong>Quantity:</strong> ${payload.quantity}</li>
        ${payload.categoryName ? `<li><strong>Category:</strong> ${payload.categoryName}</li>` : ''}
        <li><strong>Order ID:</strong> ${payload.orderId}</li>
        <li><strong>Total Paid:</strong> ₹${payload.totalAmount.toFixed(2)}</li>
      </ul>
      <p>Show this email at the venue along with your ID if required. Enjoy the event!</p>
    </div>
  `;
  await tx.sendMail({ from: SMTP_FROM as string, to, subject: `Your Ticket: ${payload.title}`, html });
};

// Dev/offline mode if Firebase not configured
const IN_DEV = !firebaseConfig.projectId || String(firebaseConfig.projectId).includes('your-project-id');
type DevEvent = any;
let DEV_EVENTS: DevEvent[] = [];
let DEV_RULES: Record<string, any> = {};
let DEV_TXS: any[] = [];
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
// Simple OTP store (dev/offline)
type OtpEntry = { code: string; expiresAt: number; verified?: boolean };
const OTP_STORE: Record<string, OtpEntry> = {};

// Email (SMTP) configuration
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM;

const emailConfigured = !!(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && SMTP_FROM);

let mailer: nodemailer.Transporter | null = null;
const getMailer = () => {
  if (!emailConfigured) return null;
  if (mailer) return mailer;
  mailer = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for others
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return mailer;
};

const sendOtpEmail = async (to: string, code: string) => {
  const tx = getMailer();
  if (!tx) throw new Error('Email not configured on server');
  const html = `
    <div style="font-family:Arial,sans-serif;">
      <h2>Your BlockTix Verification Code</h2>
      <p>Use the following One-Time Password (OTP) to verify your email address:</p>
      <p style="font-size:24px;font-weight:bold;letter-spacing:4px;">${code}</p>
      <p>This code is valid for 10 minutes. If you did not request this, you can ignore this email.</p>
    </div>
  `;
  await tx.sendMail({ from: SMTP_FROM as string, to, subject: 'Your BlockTix OTP Code', html });
};

// Admin API key middleware
const requireAdminKey = (req: Request, res: Response, next: NextFunction) => {
  const headerKey = req.header('x-admin-key') || req.header('X-Admin-Key');
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) {
    return res.status(500).json({ message: 'Server missing ADMIN_API_KEY' });
  }
  if (!headerKey || headerKey !== expected) {
    return res.status(401).json({ message: 'Invalid or missing admin key' });
  }
  return next();
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Orders listing (purchase history) by email
app.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'email query param required' });
    if (IN_DEV) {
      const txs = DEV_TXS.filter(t => t.type==='purchase' && String(t.to||'').toLowerCase() === email);
      return res.json(txs);
    }
    const colTx = collection(db, 'transactions');
    const qTx = query(colTx, where('type','==','purchase'), where('to','==', email), orderBy('timestamp','desc'));
    const snaps = await getDocs(qTx);
    const txs = snaps.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json(txs);
  } catch (error) { next(error); }
});

// Single order receipt by orderId
app.get('/orders/:orderId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    if (IN_DEV) {
      const tx = DEV_TXS.find(t => t.orderId === orderId);
      if (!tx) return res.status(404).json({ message: 'Order not found' });
      return res.json(tx);
    }
    // Firestore: search last 1000 transactions for matching orderId (if not indexed)
    const colTx = collection(db, 'transactions');
    const qTx = query(colTx, orderBy('timestamp','desc'), fsLimit(1000));
    const snaps = await getDocs(qTx);
    const hit = snaps.docs.map(d => ({ id: d.id, ...d.data() })).find((t:any) => t.orderId === orderId);
    if (!hit) return res.status(404).json({ message: 'Order not found' });
    return res.json(hit);
  } catch (error) { next(error); }
});

// =====================
// Admin Routes
// =====================

// Create or update event (draft by default)
app.post('/admin/events', requireAdminKey, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, title, description, date, location, image, price, totalTickets, category, isFeatured, categories } = req.body || {};
    // If categories are provided, aggregate totals and set base price as the cheapest for reference
    let agg = { total: Number(totalTickets) || 0, available: Number(totalTickets) || 0, basePrice: Number(price) || 0 };
    let normalizedCategories: any[] | undefined = undefined;
    if (Array.isArray(categories) && categories.length > 0) {
      normalizedCategories = categories.map((c: any) => ({
        name: String(c.name || '').trim(),
        price: Number(c.price) || 0,
        total: Number(c.total) || 0,
        available: Number(c.available ?? c.total) || 0,
      }));
      agg.total = normalizedCategories.reduce((s, c) => s + Number(c.total || 0), 0);
      agg.available = normalizedCategories.reduce((s, c) => s + Number(c.available || 0), 0);
      agg.basePrice = Math.min(...normalizedCategories.map(c => Number(c.price || 0)));
    }
    const eventsCol = collection(db, 'events');
    if (id) {
      const ref = doc(db, 'events', id);
      await updateDoc(ref, {
        title, description, date, location, image: image || '', price: normalizedCategories ? agg.basePrice : Number(price) || 0,
        totalTickets: normalizedCategories ? agg.total : Number(totalTickets) || 0,
        availableTickets: normalizedCategories ? agg.available : Number(totalTickets) || 0,
        category: category || 'general',
        isFeatured: Boolean(isFeatured),
        categories: normalizedCategories ?? null,
        status: 'draft',
        updatedAt: new Date().toISOString(),
      });
      const updated = await getDoc(ref);
      return res.json({ id: updated.id, ...updated.data() });
    } else {
      const created = await addDoc(eventsCol, {
        title, description, date, location, image: image || '', price: normalizedCategories ? agg.basePrice : Number(price) || 0,
        totalTickets: normalizedCategories ? agg.total : Number(totalTickets) || 0,
        availableTickets: normalizedCategories ? agg.available : Number(totalTickets) || 0,
        category: category || 'general',
        isFeatured: Boolean(isFeatured),
        categories: normalizedCategories ?? null,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      const snap = await getDoc(doc(db, 'events', created.id));
      return res.status(201).json({ id: snap.id, ...snap.data() });
    }
  } catch (error) {
    next(error);
  }
});

// =====================
// Auth: Email OTP Flow
// =====================

// Send OTP to email
app.post('/auth/send-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: 'Email required' });
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const ttlMs = 10 * 60 * 1000;
    const key = String(email).trim().toLowerCase();
    OTP_STORE[key] = { code, expiresAt: Date.now() + ttlMs };
    if (!emailConfigured) {
      console.warn('SMTP not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM');
      return res.status(500).json({ message: 'Email not configured on server' });
    }
    await sendOtpEmail(email, code);
    return res.json({ sent: true, expiresInSec: Math.floor(ttlMs / 1000) });
  } catch (error) { next(error); }
});

// Verify OTP and mark email as verified
app.post('/auth/verify-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = req.body || {};
    if (!email || !code) return res.status(400).json({ message: 'Email and code required' });
    const key = String(email).trim().toLowerCase();
    const entry = OTP_STORE[key];
    if (!entry) return res.status(400).json({ message: 'No OTP requested for this email' });
    if (Date.now() > entry.expiresAt) return res.status(400).json({ message: 'OTP expired' });
    if (String(code) !== entry.code) return res.status(400).json({ message: 'Invalid OTP' });
    entry.verified = true;
    return res.json({ verified: true });
  } catch (error) { next(error); }
});

// ===== Helpers for enforcement =====
const getRules = async (eventId: string) => {
  const rulesRef = doc(db, 'resale_rules', eventId);
  const rulesSnap = await getDoc(rulesRef);
  const data = rulesSnap.exists() ? rulesSnap.data() as any : {};
  return {
    allowResale: data.allowResale !== false,
    allowTransfer: data.allowTransfer !== false,
    maxResalePriceMultiplier: typeof data.maxResalePriceMultiplier === 'number' ? data.maxResalePriceMultiplier : 1.0,
  };
};

const isBlacklisted = async (wallet: string) => {
  const col = collection(db, 'blacklist');
  const snaps = await getDocs(col);
  for (const d of snaps.docs) {
    const list = (d.data() as any).wallets || [];
    if (Array.isArray(list) && list.some((w: string) => w.toLowerCase() === wallet.toLowerCase())) return true;
  }
  return false;
};

const isWhitelistedIfEnforced = async (wallet: string) => {
  // If at least one whitelist doc exists, require membership; otherwise allow all
  const col = collection(db, 'whitelist');
  const snaps = await getDocs(col);
  if (snaps.size === 0) return true;
  for (const d of snaps.docs) {
    const list = (d.data() as any).wallets || [];
    if (Array.isArray(list) && list.some((w: string) => w.toLowerCase() === wallet.toLowerCase())) return true;
  }
  return false;
};

// ===== Ticketing endpoints (baseline, centralized ledger in Firestore) =====

// Purchase tickets
app.post('/purchase', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId, wallet, quantity = 1, price, categoryName } = req.body || {};
    if (!eventId || !wallet || !quantity) return res.status(400).json({ message: 'Missing required fields' });
    if (await isBlacklisted(wallet)) return res.status(403).json({ message: 'Wallet blacklisted' });
    if (!(await isWhitelistedIfEnforced(wallet))) return res.status(403).json({ message: 'Wallet not whitelisted' });

    // Dev/offline mode: operate on in-memory data
    if (IN_DEV) {
      const evIdx = DEV_EVENTS.findIndex(e => e.id === eventId);
      if (evIdx === -1) return res.status(404).json({ message: 'Event not found' });
      const ev: any = DEV_EVENTS[evIdx];
      if (ev.status !== 'live') return res.status(400).json({ message: 'Event not live' });

      // Rules enforcement (optional basic)
      const rules = DEV_RULES[eventId] || {};
      const maxPerWallet = rules.singleUse ? 1 : rules.maxTicketsPerWallet;
      if (maxPerWallet && Number(maxPerWallet) > 0) {
        const prior = DEV_TXS.filter(t => t.type==='purchase' && t.eventId===eventId && t.to===wallet)
          .reduce((s, t) => s + Number(t.quantity||0), 0);
        if (prior + Number(quantity) > Number(maxPerWallet)) {
          return res.status(400).json({ message: `Limit exceeded: max ${maxPerWallet} per user` });
        }
        if (rules.singleUse && Number(quantity) > 1) {
          return res.status(400).json({ message: 'Only one pass allowed per user' });
        }
      }

      let unitPrice = Number(price ?? ev.price) || 0;
      if (Array.isArray(ev.categories) && ev.categories.length > 0) {
        if (!categoryName) return res.status(400).json({ message: 'categoryName required' });
        const idx = ev.categories.findIndex((c: any) => String(c.name).toLowerCase() === String(categoryName).toLowerCase());
        if (idx === -1) return res.status(400).json({ message: 'Category not found' });
        const cat = ev.categories[idx];
        const catAvail = Number(cat.available ?? cat.total ?? 0);
        if (catAvail < quantity) return res.status(400).json({ message: 'Not enough category tickets available' });
        unitPrice = Number(price ?? cat.price) || 0;
        const newCats = [...ev.categories];
        newCats[idx] = { ...cat, available: catAvail - quantity };
        const newAvail = Number(ev.availableTickets || 0) - Number(quantity);
        DEV_EVENTS[evIdx] = { ...ev, categories: newCats, availableTickets: newAvail, updatedAt: new Date().toISOString() };
      } else {
        const avail = Number(ev.availableTickets || 0);
        if (avail < quantity) return res.status(400).json({ message: 'Not enough tickets available' });
        DEV_EVENTS[evIdx] = { ...ev, availableTickets: avail - quantity, updatedAt: new Date().toISOString() };
      }
      const totalAmount = unitPrice * Number(quantity);
      const orderId = `DEV-${Date.now()}-${Math.floor(Math.random()*100000)}`;
      DEV_TXS.unshift({ type: 'purchase', eventId, from: null, to: wallet, amount: totalAmount, quantity, categoryName: categoryName || null, timestamp: new Date().toISOString(), orderId });
      // Send ticket email (best-effort)
      try { await sendTicketEmail(wallet, { title: ev.title, date: ev.date, location: ev.location, quantity, categoryName, orderId, totalAmount }); } catch (e) { console.warn('ticket email failed', e); }
      return res.status(201).json({ success: true, orderId });
    }

    const ref = doc(db, 'events', eventId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return res.status(404).json({ message: 'Event not found' });
    const ev: any = snap.data();
    if (ev.status !== 'live') return res.status(400).json({ message: 'Event not live' });

    // Load rules for special enforcement
    const rules = await getRules(eventId);
    // singleUse implies at most 1 ticket per wallet overall
    const maxPerWallet = (rules as any).singleUse ? 1 : (rules as any).maxTicketsPerWallet;
    if (maxPerWallet && Number(maxPerWallet) > 0) {
      // Sum prior purchases for this wallet for this event
      const txCol = collection(db, 'transactions');
      const qTx = query(txCol, where('type', '==', 'purchase'), where('eventId', '==', eventId), where('to', '==', wallet));
      const priorSnaps = await getDocs(qTx);
      let priorQty = 0;
      priorSnaps.forEach(d => { priorQty += Number((d.data() as any).quantity || 0); });
      if (priorQty + Number(quantity) > Number(maxPerWallet)) {
        return res.status(400).json({ message: `Limit exceeded: max ${maxPerWallet} per user` });
      }
      if ((rules as any).singleUse && Number(quantity) > 1) {
        return res.status(400).json({ message: 'Only one pass allowed per user' });
      }
    }
    let totalAmount = Number(price ?? ev.price) * Number(quantity);
    // If categories exist, enforce category availability and pricing
    if (Array.isArray(ev.categories) && ev.categories.length > 0) {
      if (!categoryName) return res.status(400).json({ message: 'categoryName required' });
      const idx = ev.categories.findIndex((c: any) => String(c.name).toLowerCase() === String(categoryName).toLowerCase());
      if (idx === -1) return res.status(400).json({ message: 'Category not found' });
      const cat = ev.categories[idx];
      const catAvail = Number(cat.available || 0);
      if (catAvail < quantity) return res.status(400).json({ message: 'Not enough category tickets available' });
      totalAmount = Number(price ?? cat.price) * Number(quantity);
      const newCats = [...ev.categories];
      newCats[idx] = { ...cat, available: catAvail - quantity };
      const newAvail = Number(ev.availableTickets || 0) - Number(quantity);
      await updateDoc(ref, { categories: newCats, availableTickets: newAvail, updatedAt: new Date().toISOString() });
    } else {
      const avail = Number(ev.availableTickets || 0);
      if (avail < quantity) return res.status(400).json({ message: 'Not enough tickets available' });
      await updateDoc(ref, { availableTickets: avail - quantity, updatedAt: new Date().toISOString() });
    }
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random()*100000)}`;
    await addDoc(collection(db, 'transactions'), {
      type: 'purchase', eventId, from: null, to: wallet, amount: totalAmount, quantity, categoryName: categoryName || null,
      timestamp: new Date().toISOString(), orderId
    });
    try { await sendTicketEmail(wallet, { title: ev.title, date: ev.date, location: ev.location, quantity, categoryName, orderId, totalAmount }); } catch (e) { console.warn('ticket email failed', e); }
    return res.status(201).json({ success: true, orderId });
  } catch (error) { next(error); }
});

// Seed sample Indian events (idempotent-ish by title+date). Admin only.
app.post('/admin/seed/sample', requireAdminKey, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const samples = [
      {
        title: 'Sunburn Music Festival – Goa 2025',
        location: 'Vagator Beach, Goa',
        date: '2025-12-27T16:00:00+05:30',
        description: 'Asia\'s biggest music festival in Goa. Experience top EDM artists over 3 days!',
        image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1600&auto=format&fit=crop',
        category: 'Music',
        isFeatured: true,
        categories: [
          { name: 'General Pass (Per Day)', price: 4999, total: 15000 },
          { name: 'VIP Pass (3 Days)', price: 12000, total: 5000 },
        ],
        rules: { allowResale: true, maxResalePriceMultiplier: 1.0, minAge: 18 },
      },
      {
        title: 'India vs Australia – T20 Match',
        location: 'M. Chinnaswamy Stadium, Bengaluru',
        date: '2026-02-14T19:00:00+05:30',
        description: 'High-voltage India vs Australia T20 cricket match in Bengaluru! Limited seats.',
        image: 'https://images.news18.com/ibnlive/uploads/2023/09/india-australia-1st-odi-live-score-ind-vs-aus-2023-09-2502936abd62ce512f51496b9d397181-16x9.jpg?impolicy=website&width=640&height=360',
        category: 'Sports',
        isFeatured: true,
        categories: [
          { name: 'Stand Tickets', price: 1500, total: 20000 },
          { name: 'Premium Pavilion', price: 4500, total: 12000 },
          { name: 'Corporate Box', price: 12000, total: 3000 },
        ],
        rules: { maxTicketsPerWallet: 4, allowResale: true, maxResalePriceMultiplier: 1.2 },
      },
      {
        title: 'Arijit Singh Live Concert',
        location: 'NSCI Dome, Mumbai',
        date: '2026-01-10T18:30:00+05:30',
        description: 'An evening with Arijit Singh performing his best hits live at NSCI Dome.',
        image: 'https://www.tottenhamhotspurstadium.com/media/xrhfsdgm/2v8a4968.jpg?width=960&height=582&rnd=133898957726470000',
        category: 'Concert',
        isFeatured: false,
        categories: [
          { name: 'Silver', price: 1200, total: 6000 },
          { name: 'Gold', price: 2500, total: 3000 },
          { name: 'Platinum', price: 6000, total: 1000 },
        ],
        rules: { allowTransfer: false, allowResale: true, maxResalePriceMultiplier: 1.0 },
      },
      {
        title: 'Ratha Yatra – Jagannath Puri Darshan Pass',
        location: 'Jagannath Temple, Puri, Odisha',
        date: '2026-07-07T05:00:00+05:30',
        description: 'Special darshan passes for Ratha Yatra. General entry is free; priority darshan available.',
        image: 'https://i0.wp.com/indiacurrents.com/wp-content/uploads/2025/06/Puri-Jagannath-Rath-Yatra.jpg?fit=1200%2C674&ssl=1',
        category: 'Pilgrimage',
        isFeatured: true,
        categories: [
          { name: 'General Entry', price: 0, total: 90000 },
          { name: 'Priority Darshan', price: 500, total: 10000 },
        ],
        rules: { singleUse: true, allowTransfer: false, allowResale: false },
      },
      {
        title: 'Indian Tech Summit 2026',
        location: 'Pragati Maidan, New Delhi',
        date: '2026-03-15T09:00:00+05:30',
        description: 'India\'s premier technology summit with talks, workshops, and networking over 3 days.',
        image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=1600&auto=format&fit=crop',
        category: 'Conference',
        isFeatured: false,
        categories: [
          { name: 'Student Pass', price: 800, total: 3000 },
          { name: 'Regular', price: 2000, total: 4000 },
          { name: 'VIP + Networking', price: 5000, total: 1000 },
        ],
        rules: { refundUntil: '2026-03-10', allowResale: true, maxResalePriceMultiplier: 1.0 },
      },
    ];

    // Dev mode: seed in-memory only (no Firestore calls)
    if (IN_DEV) {
      DEV_EVENTS = samples.map((s) => {
        const id = slug(`${s.title}-${s.date}`);
        const price = Math.min(...s.categories.map((c:any)=>Number(c.price||0)));
        const totalTickets = s.categories.reduce((sum:any,c:any)=> sum+Number(c.total||0),0);
        const availableTickets = s.categories.reduce((sum:any,c:any)=> sum+Number(c.total||0),0);
        DEV_RULES[id] = s.rules || {};
        return {
          id,
          title: s.title,
          description: s.description,
          date: s.date,
          location: s.location,
          image: s.image,
          category: s.category,
          isFeatured: s.isFeatured,
          categories: s.categories.map((c:any)=>({ ...c, available: Number(c.total||0) })),
          price, totalTickets, availableTickets,
          status: 'live',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });
      return res.json({ ok: true, count: DEV_EVENTS.length, events: DEV_EVENTS.map(e=>({ id: e.id, title: e.title })) });
    }

    const created: any[] = [];
    for (const s of samples) {
      // Upsert by (title+date)
      const evsCol = collection(db, 'events');
      const q = query(evsCol, where('title', '==', s.title), where('date', '==', s.date));
      const snaps = await getDocs(q);
      if (snaps.size > 0) {
        const d = snaps.docs[0];
        // Update basics and categories
        await updateDoc(d.ref, {
          description: s.description,
          location: s.location,
          image: s.image,
          category: s.category,
          isFeatured: s.isFeatured,
          categories: s.categories,
          price: Math.min(...s.categories.map((c:any)=>Number(c.price||0))),
          totalTickets: s.categories.reduce((sum:any,c:any)=> sum+Number(c.total||0),0),
          availableTickets: s.categories.reduce((sum:any,c:any)=> sum+Number((typeof c.available==='number'? c.available : c.total)||0),0),
          status: 'live',
          updatedAt: new Date().toISOString(),
        });
        // Rules doc
        await setDoc(doc(db, 'resale_rules', d.id), s.rules, { merge: true });
        created.push({ id: d.id, title: s.title, updated: true });
      } else {
        const newDoc = await addDoc(evsCol, {
          title: s.title,
          description: s.description,
          date: s.date,
          location: s.location,
          image: s.image,
          category: s.category,
          isFeatured: s.isFeatured,
          categories: s.categories,
          price: Math.min(...s.categories.map((c:any)=>Number(c.price||0))),
          totalTickets: s.categories.reduce((sum:any,c:any)=> sum+Number(c.total||0),0),
          availableTickets: s.categories.reduce((sum:any,c:any)=> sum+Number((typeof c.available==='number'? c.available : c.total)||0),0),
          status: 'live',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await setDoc(doc(db, 'resale_rules', newDoc.id), s.rules, { merge: true });
        created.push({ id: newDoc.id, title: s.title, created: true });
      }
    }
    return res.json({ ok: true, count: created.length, events: created });
  } catch (error) { next(error); }
});

// Resell tickets (record only, price rule enforced)
app.post('/resell', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId, seller, buyer, price, categoryName } = req.body || {};
    if (!eventId || !seller || !buyer || typeof price !== 'number') return res.status(400).json({ message: 'Missing fields' });
    if (await isBlacklisted(seller) || await isBlacklisted(buyer)) return res.status(403).json({ message: 'Blacklisted wallet' });
    if (!(await isWhitelistedIfEnforced(seller)) || !(await isWhitelistedIfEnforced(buyer))) return res.status(403).json({ message: 'Not whitelisted' });

    const evSnap = await getDoc(doc(db, 'events', eventId));
    if (!evSnap.exists()) return res.status(404).json({ message: 'Event not found' });
    const ev: any = evSnap.data();
    const rules = await getRules(eventId);
    if (!rules.allowResale) return res.status(400).json({ message: 'Resale disabled' });
    let base = Number(ev.price || 0);
    if (Array.isArray(ev.categories) && ev.categories.length > 0 && categoryName) {
      const cat = ev.categories.find((c: any) => String(c.name).toLowerCase() === String(categoryName).toLowerCase());
      if (!cat) return res.status(400).json({ message: 'Category not found' });
      base = Number(cat.price || base);
    }
    const maxPrice = base * Number(rules.maxResalePriceMultiplier || 1);
    if (price > maxPrice) return res.status(400).json({ message: 'Price exceeds allowed maximum' });

    await addDoc(collection(db, 'transactions'), {
      type: 'resell', eventId, from: seller, to: buyer, amount: price, categoryName: categoryName || null, timestamp: new Date().toISOString(),
    });
    return res.status(201).json({ success: true });
  } catch (error) { next(error); }
});

// Transfer ticket (no price)
app.post('/transfer', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId, from, to } = req.body || {};
    if (!eventId || !from || !to) return res.status(400).json({ message: 'Missing fields' });
    if (await isBlacklisted(from) || await isBlacklisted(to)) return res.status(403).json({ message: 'Blacklisted wallet' });
    if (!(await isWhitelistedIfEnforced(from)) || !(await isWhitelistedIfEnforced(to))) return res.status(403).json({ message: 'Not whitelisted' });
    const rules = await getRules(eventId);
    if (!rules.allowTransfer) return res.status(400).json({ message: 'Transfer disabled' });
    await addDoc(collection(db, 'transactions'), {
      type: 'transfer', eventId, from, to, timestamp: new Date().toISOString(),
    });
    return res.status(201).json({ success: true });
  } catch (error) { next(error); }
});

// Publish event
app.post('/admin/events/:id/publish', requireAdminKey, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ref = doc(db, 'events', req.params.id);
    await updateDoc(ref, { status: 'live', publishedAt: new Date().toISOString() });
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return res.status(404).json({ message: 'Event not found' });
    }
    return res.json({ id: snap.id, ...snap.data() });
  } catch (error) { next(error); }
});

// Delete event
app.delete('/admin/events/:id', requireAdminKey, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ref = doc(db, 'events', req.params.id);
    await deleteDoc(ref);
    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Configure resale rules
app.put('/admin/events/:id/rules', requireAdminKey, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { maxResalePriceMultiplier = 1.0, allowResale = true, allowTransfer = true } = req.body || {};
    const ref = doc(db, 'resale_rules', req.params.id);
    await setDoc(ref, {
      eventId: req.params.id,
      maxResalePriceMultiplier: Number(maxResalePriceMultiplier),
      allowResale: Boolean(allowResale),
      allowTransfer: Boolean(allowTransfer),
      updatedAt: new Date().toISOString(),
    });
    const snap = await getDoc(ref);
    return res.json({ id: snap.id, ...snap.data() });
  } catch (error) {
    next(error);
  }
});

// Whitelist/Blacklist management
app.post('/admin/whitelist', requireAdminKey, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { wallets = [] } = req.body || {};
    const col = collection(db, 'whitelist');
    const write = await addDoc(col, { wallets, createdAt: new Date().toISOString() });
    return res.status(201).json({ id: write.id, wallets });
  } catch (error) { next(error); }
});

app.post('/admin/blacklist', requireAdminKey, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { wallets = [] } = req.body || {};
    const col = collection(db, 'blacklist');
    const write = await addDoc(col, { wallets, createdAt: new Date().toISOString() });
    return res.status(201).json({ id: write.id, wallets });
  } catch (error) { next(error); }
});

// Analytics summary
app.get('/admin/analytics/summary', requireAdminKey, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    if (IN_DEV) {
      const total = DEV_EVENTS.reduce((s,e)=> s + Number(e.totalTickets||0), 0);
      const remaining = DEV_EVENTS.reduce((s,e)=> s + Number(e.availableTickets||0), 0);
      const sold = Math.max(0, total - remaining);
      return res.json({ totalTickets: total, soldTickets: sold, remainingTickets: remaining, events: DEV_EVENTS.length });
    }
    const eventsCol = collection(db, 'events');
    const snaps = await getDocs(eventsCol);
    let total = 0, sold = 0, remaining = 0;
    snaps.forEach((d) => {
      const data: any = d.data();
      total += Number(data.totalTickets || 0);
      remaining += Number(data.availableTickets || 0);
    });
    sold = Math.max(0, total - remaining);
    return res.json({ totalTickets: total, soldTickets: sold, remainingTickets: remaining, events: snaps.size });
  } catch (error) { next(error); }
});

// Transactions (stub: latest 50 from a collection if exists)
app.get('/admin/analytics/transactions', requireAdminKey, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    if (IN_DEV) {
      const out = DEV_TXS.slice(0,50).map((t:any) => ({ id: t.orderId || `${t.eventId}-${t.timestamp}`, ...t }));
      return res.json(out);
    }
    const col = collection(db, 'transactions');
    const q = query(col, orderBy('timestamp', 'desc'), fsLimit(50));
    const snaps = await getDocs(q);
    const txs = snaps.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json(txs);
  } catch (error) { next(error); }
});

// Category breakdown (recent 1000 transactions)
app.get('/admin/analytics/categories', requireAdminKey, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const col = collection(db, 'transactions');
    const q = query(col, orderBy('timestamp', 'desc'), fsLimit(1000));
    const snaps = await getDocs(q);
    const acc: Record<string, { eventId: string; categoryName: string | null; purchases: number; resales: number; totalAmount: number; } > = {};
    snaps.forEach((d) => {
      const t: any = d.data();
      const key = `${t.eventId || 'unknown'}::${t.categoryName || 'none'}`;
      if (!acc[key]) acc[key] = { eventId: t.eventId || 'unknown', categoryName: t.categoryName || null, purchases: 0, resales: 0, totalAmount: 0 };
      if (t.type === 'purchase') acc[key].purchases += Number(t.quantity || 1);
      if (t.type === 'resell') acc[key].resales += 1;
      acc[key].totalAmount += Number(t.amount || 0);
    });
    const rows = Object.values(acc);
    return res.json(rows);
  } catch (error) { next(error); }
});
app.use(limiter);

// Custom error handler
interface ApiError extends Error {
  statusCode?: number;
}

const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

// JWT Authentication middleware
interface AuthRequest extends Request {
  user?: any;
}

const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    const error: ApiError = new Error('No token provided');
    error.statusCode = 401;
    return next(error);
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (error) {
    const err: ApiError = new Error('Invalid token');
    err.statusCode = 401;
    next(err);
  }
};

// Routes

// Get all public (live) events
app.get('/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (IN_DEV) {
      if (DEV_EVENTS.length === 0) autoSeedDev();
      return res.json(DEV_EVENTS);
    }
    const eventsCollection = collection(db, 'events');
    const qLive = query(eventsCollection, where('status', '==', 'live'));
    const eventsSnapshot = await getDocs(qLive);
    const events = eventsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(events);
  } catch (error) {
    next(error);
  }
});

// Get event by ID
app.get('/events/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (IN_DEV) {
      const ev = DEV_EVENTS.find(e=>e.id===id);
      if (!ev) {
        const error: ApiError = new Error('Event not found');
        error.statusCode = 404;
        throw error;
      }
      return res.json(ev);
    }
    const eventDoc = doc(db, 'events', id);
    const eventSnapshot = await getDoc(eventDoc);
    if (!eventSnapshot.exists()) {
      const error: ApiError = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }
    res.json({ id: eventSnapshot.id, ...eventSnapshot.data() });
  } catch (error) {
    next(error);
  }
});

// User signup
app.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      const error: ApiError = new Error('Missing required fields');
      error.statusCode = 400;
      throw error;
    }
    
    // In a real app, you would use Firebase Authentication directly
    // Here we're just storing user data in Firestore
    const usersCollection = collection(db, 'users');
    const newUser = await addDoc(usersCollection, {
      name,
      email,
      createdAt: new Date().toISOString()
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { uid: newUser.id, email, name },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser.id,
        name,
        email
      }
    });
  } catch (error) {
    next(error);
  }
});

// Submit contact form
app.post('/contact', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !message) {
      const error: ApiError = new Error('Missing required fields');
      error.statusCode = 400;
      throw error;
    }
    
    const contactCollection = collection(db, 'contact_submissions');
    await addDoc(contactCollection, {
      name,
      email,
      subject: subject || '',
      message,
      submittedAt: new Date().toISOString()
    });
    
    res.status(201).json({ message: 'Form submitted successfully' });
  } catch (error) {
    next(error);
  }
});

// Protected route example
app.get('/profile', authenticate, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// Apply error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;