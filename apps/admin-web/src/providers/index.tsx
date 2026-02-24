'use client';
import React from 'react';
import SessionProvider from './Session';
import SearchProvider from './Search';
import SidebarProvider from './Sidebar';
import ThemeProvider from './Theme';
import { Toaster } from './Toast';

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <SessionProvider>
        <SearchProvider>
          <SidebarProvider>{children}</SidebarProvider>
          <Toaster richColors position="top-right" closeButton />
        </SearchProvider>
      </SessionProvider>
    </ThemeProvider>
  );
};

export default Provider;
