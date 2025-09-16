import Footer from '@/layouts/private/Footer';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <>
      <main className="bg-[#FFFFFF]">{children}</main>
      <Footer />
    </>
  );
};
export default AuthLayout;
