'use server';

import { getRecentUpdates, getUpdates } from '../server/updates.service';
import type { DashboardUpdate, UpdatesFilters, UpdatesResponse } from '../types/updates.types';

export async function fetchRecentUpdates(limit = 9): Promise<DashboardUpdate[]> {
  return await getRecentUpdates(limit);
}

export async function fetchUpdates(filters?: UpdatesFilters): Promise<UpdatesResponse> {
  return await getUpdates(filters);
}
