import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { IPOListing, MarketUpdate } from '../types';

export function useIPOs() {
  const [ipos, setIpos] = useState<IPOListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'ipos'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as IPOListing[];
      setIpos(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { ipos, loading };
}

export function usePulse() {
  const [pulse, setPulse] = useState<MarketUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'pulse'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as MarketUpdate[];
      setPulse(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { pulse, loading };
}

export function useIPODetail(id: string) {
  const [ipo, setIpo] = useState<IPOListing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(doc(db, 'ipos', id), (snapshot) => {
      if (snapshot.exists()) {
        setIpo({ ...snapshot.data(), id: snapshot.id } as IPOListing);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  return { ipo, loading };
}
