import { DashboardShell } from '@/layouts/dashboard';
import NewChaperoneClient from './NewChaperoneClient';

export default function NewChaperonePage() {
  return (
    <DashboardShell>
      <NewChaperoneClient />
    </DashboardShell>
  );
}

