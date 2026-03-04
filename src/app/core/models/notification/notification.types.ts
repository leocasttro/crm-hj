// core/models/notification/notification.types.ts
export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export type NotificationPriority = 'BAIXA' | 'MEDIA' | 'ALTA';

export type NotificationCategory =
  | 'SISTEMA'
  | 'PEDIDO'
  | 'PACIENTE'
  | 'AGENDAMENTO'
  | 'DOCUMENTO'
  | 'MENSAGEM';

export type NotificationAction =
  | 'CRIADO'
  | 'ATUALIZADO'
  | 'APROVADO'
  | 'REJEITADO'
  | 'AGENDADO'
  | 'CANCELADO'
  | 'PENDENTE'
  | 'DOCUMENTO_ANEXADO'
  | 'MENSAGEM_RECEBIDA';

export interface AppNotification {
  // Identificação
  id: string;                    // UUID
  type: NotificationType;

  // Conteúdo
  title: string;
  message?: string;

  // Categorização (útil para filtros)
  category?: NotificationCategory;  // De onde veio a notificação
  action?: NotificationAction;      // Qual ação gerou

  // Prioridade (para ordenação/destaque)
  priority?: NotificationPriority;

  // Metadados
  createdAt: string;             // ISO string
  readAt?: string | null;        // ISO ou null

  // Ação
  link?: string;                 // rota interna ex: /pedidos/123

  // Dados extras
  meta?: {
    entityId?: string;           // ID do recurso relacionado (pedido, paciente, etc)
    entityType?: string;          // 'pedido', 'paciente', etc
    additionalData?: Record<string, any>;  // Qualquer dado extra
  };

  // Controle de exibição
  expiresAt?: string;            // ISO string - quando expira
  dismissible?: boolean;          // Pode ser dispensada?

  // Ações rápidas (opcional)
  actions?: NotificationQuickAction[];
}

export interface NotificationQuickAction {
  label: string;                  // "Ver pedido", "Marcar como lida"
  action: string;                  // 'view', 'markAsRead', etc
  link?: string;                   // Se for navegação
  icon?: string;                   // Ícone para a ação
}

// Para o estado global de notificações
export interface NotificationState {
  items: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  filters: NotificationFilters;
}

export interface NotificationFilters {
  type?: NotificationType[];
  category?: NotificationCategory[];
  priority?: NotificationPriority[];
  read?: boolean;                   // true = lidas, false = não lidas
  search?: string;
}

// Para o componente de notificações
export interface NotificationGroup {
  date: string;                    // 'Hoje', 'Ontem', 'Esta semana'
  notifications: AppNotification[];
}
