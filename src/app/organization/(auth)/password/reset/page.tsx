type PageProps = {
  searchParams: Promise<{
    token: string;
  }>;
};

const Page: React.FC<PageProps> = async ({ searchParams }) => {
  const { token } = await searchParams;
  console.log(token);
  return <div>Page</div>;
};

export default Page;
