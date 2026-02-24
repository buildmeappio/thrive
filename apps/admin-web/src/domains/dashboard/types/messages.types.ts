export type MessageType = 'case' | 'examiner' | 'organization' | 'system';
export type MessagePriority = 'urgent' | 'normal' | 'low';

export type DashboardMessage = {
  id: string;
  type: MessageType;
  title: string;
  description?: string;
  entityId?: string;
  entityType?: string;
  priority: MessagePriority;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  actionLabel?: string;
};

export type MessagesFilters = {
  type?: MessageType | 'all';
  isRead?: boolean | 'all';
  page?: number;
  pageSize?: number;
};

export type MessagesResponse = {
  messages: DashboardMessage[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  unreadCount: number;
};
