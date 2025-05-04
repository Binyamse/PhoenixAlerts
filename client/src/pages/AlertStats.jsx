import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Skeleton } from '@chakra-ui/react';

const AlertStats = ({ type }) => {
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        let url = '/api/alerts/stats';
        
        // Different endpoints depending on stat type
        if (type === 'total') {
          url = '/api/alerts/stats/total';
        } else if (type === 'critical') {
          url = '/api/alerts/stats/critical';
        } else if (type === 'active') {
          url = '/api/alerts/stats/active';
        } else if (type === 'silenced') {
          url = '/api/alerts/stats/silenced';
        }
        
        const response = await axios.get(url);
        setCount(response.data.count);
        setLoading(false);
      } catch (error) {
        console.error(`Error fetching ${type} alert stats:`, error);
        setCount('N/A');
        setLoading(false);
      }
    };

    fetchStats();
    
    // Refresh stats every minute
    const interval = setInterval(fetchStats, 60 * 1000);
    return () => clearInterval(interval);
  }, [type]);

  if (loading) {
    return <Skeleton height="24px" width="60px" />;
  }

  return <>{count}</>;
};

export default AlertStats;