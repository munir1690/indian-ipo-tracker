import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthContextType {
  user: User | null;
  role: 'admin' | 'user' | null;
  firstName: string | null;
  lastName: string | null;
  theme: 'light' | 'dark';
  savedIPOs: string[];
  status: 'active' | 'disabled';
  loading: boolean;
  updateTheme: (newTheme: 'light' | 'dark') => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  firstName: null,
  lastName: null,
  theme: 'light',
  savedIPOs: [],
  status: 'active',
  loading: true,
  updateTheme: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [savedIPOs, setSavedIPOs] = useState<string[]>([]);
  const [status, setStatus] = useState<'active' | 'disabled'>('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch role and savedIPOs from Firestore in realtime
        const docRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeDoc = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setRole(data.role || 'user');
            setFirstName(data.firstName || null);
            setLastName(data.lastName || null);
            setTheme(data.theme || 'light');
            setSavedIPOs(data.savedIPOs || []);
            setStatus(data.status || 'active');
          } else {
            setRole('user'); // Default role
            setFirstName(null);
            setLastName(null);
            setTheme('light');
            setSavedIPOs([]);
            setStatus('active');
          }
          setLoading(false);
        }, (err) => {
          console.error("Error fetching user data:", err);
          setRole('user');
          setFirstName(null);
          setLastName(null);
          setTheme('light');
          setSavedIPOs([]);
          setStatus('active');
          setLoading(false);
        });
      } else {
        setRole(null);
        setFirstName(null);
        setLastName(null);
        setTheme('light');
        setSavedIPOs([]);
        setStatus('active');
        setLoading(false);
        if (unsubscribeDoc) unsubscribeDoc();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const updateTheme = async (newTheme: 'light' | 'dark') => {
    if (!user) return;
    try {
      const { updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'users', user.uid), { theme: newTheme });
    } catch (error) {
      console.error("Error updating theme:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, firstName, lastName, theme, savedIPOs, status, loading, updateTheme }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
