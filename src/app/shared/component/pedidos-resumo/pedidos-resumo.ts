import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pedidos-resumo',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './pedidos-resumo.html',
  styleUrl: './pedidos-resumo.scss',
})
export class PedidosResumo {
  @Input() pedido: any | null = null;

  constructor(private router: Router) {}

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      RASCUNHO: 'bg-secondary',
      PENDENTE: 'bg-warning',
      EM_ANALISE: 'bg-info',
      AGENDADO: 'bg-primary',
      CONFIRMADO: 'bg-success',
      REALIZADO: 'bg-success',
      CANCELADO: 'bg-danger',
      REJEITADO: 'bg-danger',
    };
    return classes[status] || 'bg-secondary';
  }

  // Métodos auxiliares
  formatarData(data: string): string {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  }

  formatarDataHora(data: string): string {
    if (!data) return '-';
    return new Date(data).toLocaleString('pt-BR');
  }

  getPrimeiroNome(nomeCompleto: string): string {
    if (!nomeCompleto) return '';
    return nomeCompleto.split(' ')[0];
  }

  temCidsSecundarios(): boolean {
    return !!(
      this.pedido?.cidCodigo2 ||
      this.pedido?.cidCodigo3 ||
      this.pedido?.cidCodigo4
    );
  }

  temDadosGuia(): boolean {
    return !!(
      this.pedido?.numeroGuia ||
      this.pedido?.registroAns ||
      this.pedido?.numeroGuiaOperadora
    );
  }
}
