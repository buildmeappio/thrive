'use server';

import { revalidatePath } from 'next/cache';
import {
  getRecentMessages,
  getMessages,
  getUnreadMessagesCount,
  markMessageAsRead,
  markMessageAsUnread,
} from '../server/messages.service';
import type { DashboardMessage, MessagesFilters, MessagesResponse } from '../types/messages.types';

export async function fetchRecentMessages(limit = 5): Promise<DashboardMessage[]> {
  return await getRecentMessages(limit);
}

export async function fetchMessages(filters?: MessagesFilters): Promise<MessagesResponse> {
  return await getMessages(filters);
}

export async function fetchUnreadMessagesCount(): Promise<number> {
  return await getUnreadMessagesCount();
}

export async function markMessageAsReadAction(messageId: string): Promise<void> {
  await markMessageAsRead(messageId);
  // Revalidate both dashboard and messages pages
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/messages');
}

export async function markMessageAsUnreadAction(messageId: string): Promise<void> {
  await markMessageAsUnread(messageId);
  // Revalidate both dashboard and messages pages
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/messages');
}
