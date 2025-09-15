import Header from "@/layouts/public/header";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa] h-full">
      <Header />
      <main role="main" className="flex-1">{children}</main>
    </div>
  );
};

export default PublicLayout;
