import { redirect } from 'next/navigation';

const SubdomainPage = async ({ params }: { params: Promise<{ subdomain: string }> }) => {
  await params;
  redirect('/hello');
};

export default SubdomainPage;
