export type UpdateType = 'examiner' | 'case' | 'organization' | 'service' | 'user' | 'interview';

export type DashboardUpdate = {
  id: string;
  type: UpdateType;
  title: string;
  description?: string;
  entityId?: string;
  entityType?: string;
  createdAt: Date;
  createdBy?: string;
  metadata?: Record<string, any>;
};

export type UpdatesFilters = {
  type?: UpdateType | 'all';
  dateRange?: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'all';
  page?: number;
  pageSize?: number;
};

export type UpdatesResponse = {
  updates: DashboardUpdate[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
