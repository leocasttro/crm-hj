import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pedidos-resumo',
  imports: [CommonModule],
  standalone: true, // 🔥 OBRIGATÓRIO
  templateUrl: './pedidos-resumo.html',
  styleUrl: './pedidos-resumo.scss',
})
export class PedidosResumo {
  @Input() pedido: any | null = null;

  getStatusClass(status: string): string {
    const classes = {
      RASCUNHO: 'bg-secondary',
      PENDENTE: 'bg-warning',
      EM_ANALISE: 'bg-info',
      AGENDADO: 'bg-primary',
      CONFIRMADO: 'bg-success',
      REALIZADO: 'bg-success',
      CANCELADO: 'bg-danger',
      REJEITADO: 'bg-danger',
    };
    return classes[status as keyof typeof classes] || 'bg-secondary';
  }
}
