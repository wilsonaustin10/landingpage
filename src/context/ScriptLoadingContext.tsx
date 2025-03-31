'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface ScriptLoadingContextType {
  isGoogleMapsLoaded: boolean;
  setGoogleMapsLoaded: (loaded: boolean) => void;
}

const ScriptLoadingContext = createContext<ScriptLoadingContextType | undefined>(
  undefined
);

export const ScriptLoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  const setGoogleMapsLoaded = useCallback((loaded: boolean) => {
    console.log(`Setting Google Maps loaded status to: ${loaded}`);
    setIsGoogleMapsLoaded(loaded);
  }, []);

  return (
    <ScriptLoadingContext.Provider value={{ isGoogleMapsLoaded, setGoogleMapsLoaded }}>
      {children}
    </ScriptLoadingContext.Provider>
  );
};

export const useScriptLoading = (): ScriptLoadingContextType => {
  const context = useContext(ScriptLoadingContext);
  if (context === undefined) {
    throw new Error(
      'useScriptLoading must be used within a ScriptLoadingProvider'
    );
  }
  return context;
}; 