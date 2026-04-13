import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getWebContent, invalidateWebContentCache } from '../utils/api';

const WebContentContext = createContext();

export const useWebContent = () => {
  const context = useContext(WebContentContext);
  if (!context) {
    throw new Error('useWebContent must be used within a WebContentProvider');
  }
  return context;
};

export const WebContentProvider = ({ children }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWebContent();
      setContent(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const refresh = useCallback(async () => {
    invalidateWebContentCache();
    await fetchContent();
  }, [fetchContent]);

  return (
    <WebContentContext.Provider value={{
      content,
      loading,
      error,
      refresh,
      header: content?.header || [],
      banner: content?.banner || [],
      slider: content?.slider || [],
      nearSlider: content?.nearSlider || [],
      footer: content?.footer || [],
    }}>
      {children}
    </WebContentContext.Provider>
  );
};

export default WebContentContext;
