const SubdomainPage = async ({ params }: { params: Promise<{ subdomain: string }> }) => {
  const { subdomain } = await params;
  console.log('subdomain', subdomain);
  return <div>SubdomainPage {subdomain}</div>;
};

export default SubdomainPage;
