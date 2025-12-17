"use server";

import { chaperoneHandlers } from "./server";
import { getCurrentUser } from "../auth/server/session";
import { redirect } from "next/navigation";
import { CreateChaperoneInput, UpdateChaperoneInput } from "./types/Chaperone";
import { URLS } from "@/constants/route";

export const createChaperone = async (data: CreateChaperoneInput) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const result = await chaperoneHandlers.createChaperone(data);
  return result;
};

export const updateChaperone = async (
  id: string,
  data: UpdateChaperoneInput,
) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const result = await chaperoneHandlers.updateChaperone(id, data);
  return result;
};

export const getChaperones = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const result = await chaperoneHandlers.getChaperones();
  return result;
};

export const getChaperoneById = async (id: string) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const result = await chaperoneHandlers.getChaperoneById(id);
  return result;
};

export const deleteChaperone = async (id: string) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const result = await chaperoneHandlers.deleteChaperone(id);
  return result;
};
