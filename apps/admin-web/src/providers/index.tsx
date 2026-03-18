'use client';
import React from 'react';
import SearchProvider from './Search';
import SidebarProvider from './Sidebar';
import ThemeProvider from './Theme';
import SessionProvider from './Session';
import { Toaster } from './Toast';

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <ThemeProvider>
        <SearchProvider>
          <SidebarProvider>{children}</SidebarProvider>
          <Toaster richColors position="top-right" closeButton />
        </SearchProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default Provider;
