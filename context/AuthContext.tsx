import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthContextType {
  user: User | null;
  role: 'admin' | 'user' | null;
  firstName: string | null;
  lastName: string | null;
  savedIPOs: string[];
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  firstName: null,
  lastName: null,
  savedIPOs: [],
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [savedIPOs, setSavedIPOs] = useState<string[]>([]);
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
            setSavedIPOs(data.savedIPOs || []);
          } else {
            setRole('user'); // Default role
            setFirstName(null);
            setLastName(null);
            setSavedIPOs([]);
          }
          setLoading(false);
        }, (err) => {
          console.error("Error fetching user data:", err);
          setRole('user');
          setFirstName(null);
          setLastName(null);
          setSavedIPOs([]);
          setLoading(false);
        });
      } else {
        setRole(null);
        setFirstName(null);
        setLastName(null);
        setSavedIPOs([]);
        setLoading(false);
        if (unsubscribeDoc) unsubscribeDoc();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, firstName, lastName, savedIPOs, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
