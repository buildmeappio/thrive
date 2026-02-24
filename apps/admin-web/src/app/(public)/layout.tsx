import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thrive IME Platform',
  description: 'Independent Medical Examiner Platform',
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
