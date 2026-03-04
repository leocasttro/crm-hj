// core/models/notification/notification.helpers.ts

import { AppNotification, NotificationPriority, NotificationFilters, NotificationGroup, NotificationType } from './notification.types';

// Cores baseadas no tipo
export function getNotificationColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    INFO: 'bg-info',
    SUCCESS: 'bg-success',
    WARNING: 'bg-warning',
    ERROR: 'bg-danger'
  };
  return colors[type] || 'bg-secondary';
}

// Ícones baseados no tipo
export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    INFO: 'bi-info-circle',
    SUCCESS: 'bi-check-circle',
    WARNING: 'bi-exclamation-triangle',
    ERROR: 'bi-x-circle'
  };
  return icons[type] || 'bi-bell';
}

// Prioridade para ordenação
export function getNotificationPriority(priority: NotificationPriority = 'MEDIA'): number {
  const priorities: Record<NotificationPriority, number> = {
    'ALTA': 3,
    'MEDIA': 2,
    'BAIXA': 1
  };
  return priorities[priority];
}

// Agrupar notificações por data
export function groupNotificationsByDate(notifications: AppNotification[]): NotificationGroup[] {
  const groups: Record<string, AppNotification[]> = {};

  notifications.forEach(notification => {
    const date = new Date(notification.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let groupKey = '';

    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Ontem';
    } else if (date > new Date(today.setDate(today.getDate() - 7))) {
      groupKey = 'Esta semana';
    } else {
      groupKey = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
  });

  return Object.entries(groups).map(([date, notifications]) => ({
    date,
    notifications
  }));
}

// Formatar tempo relativo (ex: "há 5 minutos")
export function getRelativeTime(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'agora mesmo';
  if (diffMins < 60) return `há ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
  if (diffHours < 24) return `há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  if (diffDays < 7) return `há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;

  return past.toLocaleDateString('pt-BR');
}

// Criar notificação para pedido
export function createPedidoNotification(
  pedidoId: string,
  pedidoNumero: string,
  action: 'CRIADO' | 'APROVADO' | 'REJEITADO' | 'AGENDADO'
): AppNotification {
  const baseNotification: Partial<AppNotification> = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    readAt: null,
    dismissible: true,
    meta: {
      entityId: pedidoId,
      entityType: 'pedido'
    },
    link: `/pedidos/${pedidoId}`
  };

  switch (action) {
    case 'CRIADO':
      return {
        ...baseNotification,
        type: 'INFO',
        title: 'Novo pedido criado',
        message: `Pedido ${pedidoNumero} foi criado com sucesso`,
        category: 'PEDIDO',
        action: 'CRIADO',
        priority: 'MEDIA'
      } as AppNotification;

    case 'APROVADO':
      return {
        ...baseNotification,
        type: 'SUCCESS',
        title: 'Pedido aprovado',
        message: `Pedido ${pedidoNumero} foi aprovado`,
        category: 'PEDIDO',
        action: 'APROVADO',
        priority: 'MEDIA'
      } as AppNotification;

    case 'REJEITADO':
      return {
        ...baseNotification,
        type: 'ERROR',
        title: 'Pedido rejeitado',
        message: `Pedido ${pedidoNumero} foi rejeitado`,
        category: 'PEDIDO',
        action: 'REJEITADO',
        priority: 'ALTA'
      } as AppNotification;

    case 'AGENDADO':
      return {
        ...baseNotification,
        type: 'SUCCESS',
        title: 'Cirurgia agendada',
        message: `Pedido ${pedidoNumero} foi agendado`,
        category: 'AGENDAMENTO',
        action: 'AGENDADO',
        priority: 'MEDIA'
      } as AppNotification;
  }
}

// Filtrar notificações
export function filterNotifications(
  notifications: AppNotification[],
  filters: NotificationFilters
): AppNotification[] {
  return notifications.filter(notification => {
    if (filters.type && !filters.type.includes(notification.type)) {
      return false;
    }

    if (filters.category && notification.category &&
        !filters.category.includes(notification.category)) {
      return false;
    }

    if (filters.priority && notification.priority &&
        !filters.priority.includes(notification.priority)) {
      return false;
    }

    if (filters.read !== undefined) {
      const isRead = !!notification.readAt;
      if (filters.read !== isRead) {
        return false;
      }
    }

    if (filters.search && notification.title) {
      return notification.title.toLowerCase().includes(filters.search.toLowerCase()) ||
             notification.message?.toLowerCase().includes(filters.search.toLowerCase());
    }

    return true;
  });
}

// Marcar como lida
export function markAsRead(notification: AppNotification): AppNotification {
  return {
    ...notification,
    readAt: new Date().toISOString()
  };
}

// Contar não lidas
export function countUnread(notifications: AppNotification[]): number {
  return notifications.filter(n => !n.readAt).length;
}
