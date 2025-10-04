// components/Blog/PageCacheKeyContext.js
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const PageCacheKeyContext = createContext(null);

export const PageCacheKeyProvider = ({ children }) => {
  const [registeredKeys, setRegisteredKeys] = useState([]);

  // Function to register keys from child components
  const registerCacheKeys = useCallback((keysToRegister) => {
    setRegisteredKeys(prevKeys => {
      // Ensure unique keys and avoid unnecessary re-renders
      const newKeys = new Set([...prevKeys, ...keysToRegister]);
      return Array.from(newKeys);
    });
  }, []);

  // Function to deregister keys when components unmount (optional, but good practice)
  const deregisterCacheKeys = useCallback((keysToDeregister) => {
    setRegisteredKeys(prevKeys => {
      const remainingKeys = prevKeys.filter(
        pk => !keysToDeregister.some(dk => dk.key === pk.key && dk.query === pk.query)
      );
      return remainingKeys;
    });
  }, []);

  return (
    <PageCacheKeyContext.Provider value={{ registeredKeys, registerCacheKeys, deregisterCacheKeys }}>
      {children}
    </PageCacheKeyContext.Provider>
  );
};

// Hook for child components to register their keys
export const usePageCacheKeys = (keys) => {
  const context = useContext(PageCacheKeyContext);
  if (!context) {
    // This will help debug if a component tries to use this hook outside the provider
    console.error('usePageCacheKeys must be used within a PageCacheKeyProvider.');
    return; // Or throw an error if you prefer strictness
  }

  const { registerCacheKeys, deregisterCacheKeys } = context;

  useEffect(() => {
    // Register keys when component mounts
    registerCacheKeys(keys);
    // Deregister keys when component unmounts
    return () => {
      deregisterCacheKeys(keys);
    };
  }, [keys, registerCacheKeys, deregisterCacheKeys]);

  return context.registeredKeys; // Return all registered keys for potential debugging
};

export const usePageContextCacheKeys = () => {
  const context = useContext(PageCacheKeyContext);
  if (!context) {
    throw new Error('usePageContextCacheKeys must be used within a PageCacheKeyProvider');
  }
  return context.registeredKeys;
};