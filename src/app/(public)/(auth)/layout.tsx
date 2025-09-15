import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const PublicLayout = ({ children }: AuthLayoutProps) => {
  return <main className="min-h-screen bg-gray-50">{children}</main>;
};
export default PublicLayout;
