import AuthHeader from '@/components/Layout/AuthHeader';

const OrganizationAuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AuthHeader />
      {children}
    </>
  );
};

export default OrganizationAuthLayout;
