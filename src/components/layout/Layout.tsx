import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppContext } from '../../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { activeDocument } = useAppContext();
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 ${activeDocument ? 'bg-white' : 'bg-gray-50'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};