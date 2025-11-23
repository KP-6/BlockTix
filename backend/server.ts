import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, setDoc } from 'firebase/firestore';

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

// Get all events
app.get('/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventsCollection = collection(db, 'events');
    const eventsSnapshot = await getDocs(eventsCollection);
    const events = eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(events);
  } catch (error) {
    next(error);
  }
});

// Get event by ID
app.get('/events/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const eventDoc = doc(db, 'events', id);
    const eventSnapshot = await getDoc(eventDoc);
    
    if (!eventSnapshot.exists()) {
      const error: ApiError = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }
    
    res.json({
      id: eventSnapshot.id,
      ...eventSnapshot.data()
    });
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