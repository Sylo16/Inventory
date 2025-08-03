// src/components/RouteChangeLoader.tsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageLoader from './PageLoader';

export default function RouteChangeLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    // simulate load delay (adjust for real-world API latency or data fetching)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // you can tie this to real data fetch logic if needed

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return loading ? <PageLoader /> : null;
}
