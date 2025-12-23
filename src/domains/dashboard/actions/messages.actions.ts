"use server";

import {
  getRecentMessages,
  getMessages,
  getUnreadMessagesCount,
} from "../server/messages.service";
import type {
  DashboardMessage,
  MessagesFilters,
  MessagesResponse,
} from "../types/messages.types";

export async function fetchRecentMessages(
  limit = 5,
): Promise<DashboardMessage[]> {
  return await getRecentMessages(limit);
}

export async function fetchMessages(
  filters?: MessagesFilters,
): Promise<MessagesResponse> {
  return await getMessages(filters);
}

export async function fetchUnreadMessagesCount(): Promise<number> {
  return await getUnreadMessagesCount();
}
