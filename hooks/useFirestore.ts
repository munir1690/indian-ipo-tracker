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
    // We remove orderBy('date', 'desc') from the query because older documents
    // might be missing the 'date' field, which causes them to be excluded by Firestore.
    const q = query(collection(db, 'pulse'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        let derivedDate = docData.date;
        if (!derivedDate) {
           // Fallback for docs missing date
           derivedDate = docData.timestamp?.toDate?.()?.toISOString() || new Date().toISOString();
        }
        return {
          ...docData,
          date: derivedDate,
          id: doc.id
        };
      }) as MarketUpdate[];
      
      // Sort in-memory using the guaranteed date field
      data.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
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
