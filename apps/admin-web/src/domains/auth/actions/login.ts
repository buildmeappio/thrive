"use server";
import { login } from "../server/handlers/login";

const loginAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const data = { email, password };
  const response = await login(data);
  return response;
};

export default loginAction;
