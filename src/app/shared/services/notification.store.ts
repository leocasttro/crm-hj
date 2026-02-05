import { computed, Injectable, signal } from '@angular/core';
import { AppNotification, NotificationType } from '../models/notification';

function nowIso() {
  return new Date().toISOString();
}

function uid() {
  return crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

@Injectable({ providedIn: 'root' })
export class NotificationStore {
  private _items = signal<AppNotification[]>([]);

  items = computed(() => this._items());
  unreadCount = computed(() => this._items().filter((n) => !n.readAt).length);

  push(input: {
    type?: NotificationType;
    title: string;
    message?: string;
    link?: string;
    meta?: Record<string, any>;
  }) {
    const notif: AppNotification = {
      id: uid(),
      type: input.type ?? 'INFO',
      title: input.title,
      message: input.message,
      link: input.link,
      meta: input.meta,
      createdAt: nowIso(),
      readAt: null,
    };

    this._items.update((list) => [notif, ...list]);
  }

  markRead(id: string) {
    this._items.update((list) =>
      list.map((n) => (n.id === id ? { ...n, readAt: nowIso() } : n)),
    );
  }

  markAllRead() {
    const t = nowIso();
    this._items.update((list) =>
      list.map((n) => (n.readAt ? n : { ...n, readAt: t })),
    );
  }

  remove(id: string) {
    this._items.update((list) => list.filter((n) => n.id !== id));
  }

  clear() {
    this._items.set([]);
  }

  seedMock() {
    this._items.set([
      {
        id: uid(),
        type: 'SUCCESS',
        title: 'Pedido aprovado',
        message: 'O pedido #123 foi aprovado e seguiu para marcação.',
        createdAt: nowIso(),
        readAt: null,
        link: '/pedidos',
        meta: { pedidoId: 123 },
      },
      {
        id: uid(),
        type: 'WARNING',
        title: 'Correção solicitada',
        message: 'O pedido #124 precisa de ajustes antes de seguir.',
        createdAt: nowIso(),
        readAt: null,
        link: '/pedidos',
        meta: { pedidoId: 124 },
      },
    ]);
  }
}
