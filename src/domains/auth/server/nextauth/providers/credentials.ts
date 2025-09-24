import CredentialsProvider from "next-auth/providers/credentials";
import { login } from "../../handlers/login";

export const credentials = CredentialsProvider({
  name: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(creds) {
    if (!creds?.email || !creds?.password) return null;
    const u = await login({ email: creds.email, password: creds.password });
    console.log(u);
    if (!u) throw new Error("Invalid credentials");
		return {
			id: u.id,
			email: u.email,
			name: u.name,
			image: u.image,
			roleName: u.roleName,
			accountId: u.accountId,
		}
  },
});
