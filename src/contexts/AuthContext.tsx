import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { app } from '../firebase/config';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth(app);

  // Determine if Firebase config is properly set; otherwise use a local mock auth
  const opts: any = (app as any)?.options || {};
  const isMock = !opts?.projectId || String(opts.projectId).includes('your-project-id');

  // Helpers for mock auth (multi-account support)
  type MockUser = { uid: string; email: string; displayName?: string; password: string };
  type MockUsers = Record<string, MockUser>; // key: emailLower
  const USERS_KEY = 'mock_users';
  const LEGACY_KEY = 'mock_user';
  const LAST_USER_KEY = 'mock_last_user';
  const readUsers = (): MockUsers => {
    try {
      // migrate legacy single user if present
      const legacyRaw = localStorage.getItem(LEGACY_KEY);
      const legacy = legacyRaw ? JSON.parse(legacyRaw) : null;
      const raw = localStorage.getItem(USERS_KEY);
      const obj: MockUsers = raw ? JSON.parse(raw) : {};
      if (legacy && legacy.email) {
        const emailLower = String(legacy.email).trim().toLowerCase();
        if (!obj[emailLower]) {
          obj[emailLower] = { uid: legacy.uid || 'mock-'+Date.now(), email: String(legacy.email).trim(), displayName: legacy.displayName, password: legacy.password || 'password123' };
        }
        localStorage.removeItem(LEGACY_KEY);
        localStorage.setItem(USERS_KEY, JSON.stringify(obj));
      }
      return obj;
    } catch { return {}; }
  };
  const writeUsers = (users: MockUsers) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };
  const mapFirebaseError = (e: any): string => {
    const code = e?.code || '';
    if (code.includes('auth/invalid-email')) return 'Invalid email address';
    if (code.includes('auth/user-not-found')) return 'No account found with this email';
    if (code.includes('auth/wrong-password')) return 'Incorrect password';
    if (code.includes('auth/email-already-in-use')) return 'Email already in use';
    if (code.includes('auth/weak-password')) return 'Password should be at least 6 characters';
    return e?.message || 'Authentication error. Please try again.';
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      if (isMock) {
        const e = String(email).trim();
        const n = String(name).trim();
        const p = String(password);
        if (!e || !p) throw new Error('Email and password required');
        const users = readUsers();
        const key = e.toLowerCase();
        if (users[key]) throw new Error('Email already in use');
        const mock: MockUser = { uid: 'mock-' + Date.now(), email: e, displayName: n, password: p };
        users[key] = mock;
        writeUsers(users);
        setCurrentUser(mock as any);
        try { localStorage.setItem(LAST_USER_KEY, key); } catch {}
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(mapFirebaseError(error));
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      if (isMock) {
        const e = String(email).trim();
        const p = String(password);
        const users = readUsers();
        const u = users[e.toLowerCase()];
        if (!u) throw new Error('No account found with this email');
        if (u.password !== p) throw new Error('Incorrect password');
        setCurrentUser(u as any);
        try { localStorage.setItem(LAST_USER_KEY, e.toLowerCase()); } catch {}
        return;
      }
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(mapFirebaseError(error));
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      if (isMock) {
        setCurrentUser(null);
        try { localStorage.removeItem(LAST_USER_KEY); } catch {}
        return;
      }
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout error:', error);
      setError(mapFirebaseError(error));
      throw error;
    }
  };

  useEffect(() => {
    if (isMock) {
      // Initialize from localStorage
      const users = readUsers();
      // Only restore session if a previously logged-in user is remembered
      let remembered: string | null = null;
      try { remembered = localStorage.getItem(LAST_USER_KEY); } catch {}
      const user = remembered ? users[String(remembered).toLowerCase()] : undefined;
      setCurrentUser(user ? (user as any) : null);
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, [auth]);

  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};