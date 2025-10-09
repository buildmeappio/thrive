import CredentialsProvider from "next-auth/providers/credentials";
import login from "../../handlers/login";
import ErrorMessages from "@/constants/ErrorMessages";

export const credentials = CredentialsProvider({
  name: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(creds) {
    if (!creds?.email || !creds?.password) return null;
    const u = await login(creds.email, creds.password);
    console.log(u);
    if (!u) throw new Error(ErrorMessages.INVALID_CREDENTIALS);
    return {
      id: u.id,
      email: u.email,
      name: `${u.firstName} ${u.lastName}`,
      image: null,
      roleName: u.roleName,
      accountId: u.accountId,
    };
  },
});
