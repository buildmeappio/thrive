import { Metadata } from "next";
import userActions from "@/domains/user/actions";
import UsersPageContent from "./UsersPageContent";

export const metadata: Metadata = {
  title: "Users | Thrive Admin",
  description: "Manage admin users",
};

export const dynamic = "force-dynamic";

const Page = async () => {
  const users = await userActions.listUsers();
  return <UsersPageContent initialUsers={users} />;
};

export default Page;
