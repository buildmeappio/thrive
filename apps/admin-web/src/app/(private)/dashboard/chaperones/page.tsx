import { Metadata } from 'next';
import ChaperonesPageContent from './ChaperonePageContent';
import { getChaperones } from '@/domains/services/actions';

export const metadata: Metadata = {
  title: 'Chaperone | Thrive Admin',
  description: 'Manage chaperones in the Thrive Admin dashboard.',
};

export const dynamic = 'force-dynamic';

const Page = async () => {
  const chaperones = await getChaperones();

  if (!chaperones.success) {
    return <ChaperonesPageContent chaperoneList={[]} />;
  }

  return <ChaperonesPageContent chaperoneList={chaperones.result} />;
};

export default Page;
