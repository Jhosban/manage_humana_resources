import { createContext, useState, useContext, type ReactNode } from 'react';

interface DataContextType {
  refreshDashboard: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [refreshCount, setRefreshCount] = useState(0);

  const refreshDashboard = () => {
    setRefreshCount((prev) => prev + 1);
  };

  return (
    <DataContext.Provider value={{ refreshDashboard }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};