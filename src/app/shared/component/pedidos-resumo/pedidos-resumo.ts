import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { formatarDataHoraPtBr, formatarDataPtBr } from '@core/utils/date.util';

@Component({
  selector: 'app-pedidos-resumo',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './pedidos-resumo.html',
  styleUrl: './pedidos-resumo.scss',
})
export class PedidosResumo {
  @Input() pedido: any | null = null;

  formatarData = formatarDataPtBr;
  formatarDataHora = formatarDataHoraPtBr;

  constructor(private router: Router) {}

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      RASCUNHO: 'bg-secondary',
      PENDENTE: 'bg-warning',
      EM_ANALISE: 'bg-info',
      AGENDAR: 'bg-primary',
      CONFIRMADO: 'bg-success',
      REALIZADO: 'bg-success',
      CANCELADO: 'bg-danger',
      REJEITADO: 'bg-danger',
    };
    return classes[status] || 'bg-secondary';
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
