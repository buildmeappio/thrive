'use client';
import React from 'react';
import SearchProvider from './Search';
import SidebarProvider from './Sidebar';
import ThemeProvider from './Theme';
import { Toaster } from './Toast';

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <SearchProvider>
        <SidebarProvider>{children}</SidebarProvider>
        <Toaster richColors position="top-right" closeButton />
      </SearchProvider>
    </ThemeProvider>
  );
};

export default Provider;
