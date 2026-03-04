// core/models/notification/notification.dto.ts

import { NotificationAction, NotificationCategory, NotificationPriority, NotificationType } from "./notification.types";

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  category?: NotificationCategory;
  action?: NotificationAction;
  priority?: NotificationPriority;
  createdAt: string;
  readAt?: string | null;
  link?: string;
  meta?: {
    entityId?: string;
    entityType?: string;
    additionalData?: Record<string, any>;
  };
  expiresAt?: string;
}

export interface NotificationListResponse {
  items: NotificationDto[];
  total: number;
  unreadCount: number;
  page: number;
  pageSize: number;
}

export interface MarkAsReadRequest {
  notificationIds: string[];
  markAll?: boolean;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  types: Record<NotificationType, boolean>;
  categories: Record<NotificationCategory, boolean>;
}
