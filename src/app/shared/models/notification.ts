export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface AppNotification {
  id: string;              // uuid/string (mock)
  type: NotificationType;
  title: string;
  message?: string;
  createdAt: string;       // ISO string
  readAt?: string | null;  // ISO ou null
  link?: string;           // rota interna ex: /pedidos/123
  meta?: Record<string, any>;
}
