'use client';
import { useState, useEffect } from 'react';
import API from '../api';

export function useDamagedProducts(autoRefresh = false) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await API.get('/damaged-products');
      setData(response.data);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load damaged products');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return { 
    damagedProducts: data, 
    isLoading: loading, 
    error,
    refresh: fetchData 
  };
}
