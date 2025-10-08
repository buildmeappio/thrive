import prisma from "@/lib/db";
import { verifyPasswordToken } from "@/lib/jwt";
import { SetPasswordForm } from "@/domains/auth";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ token: string }>;
}) => {
  const { token } = await searchParams;

  const decoded = verifyPasswordToken(token);

  if (!decoded) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Invalid or Expired Token
        </h1>
      </div>
    );
  }
  const user = await prisma.user.findUnique({
    where: {
      id: decoded.id,
    },
  });
  if (!user) {
    return <div>User not found</div>;
  }
  return (
    <div className="bg-[#F4FBFF]">
      <div className="mx-auto min-h-screen max-w-[900px] p-6">
        <div className="mt-8 mb-4 flex h-[60px] items-center justify-center text-center md:mt-0 md:h-[60px]">
          <h2 className="text-[25px] font-semibold whitespace-nowrap md:text-[40px]">
            Create Your Password
          </h2>
        </div>

        <div
          className="min-h-[350px] rounded-[20px] bg-white px-1 py-5 md:min-h-[400px] md:px-[50px] md:py-0"
          style={{
            boxShadow: "0px 0px 36.35px 0px #00000008",
          }}>
          <div className="-mb-6 pt-1 pb-1 md:mb-0">
            {<SetPasswordForm token={token} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
