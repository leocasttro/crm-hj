import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCheck,
  faExclamationTriangle,
  faSpinner,
  faSearch,
  faClock,
  faUser,
  faCalendar
} from '@fortawesome/free-solid-svg-icons';

import { PedidosResumo } from '../../pedidos-resumo/pedidos-resumo';
import { PedidoDto } from '@models/pedido';
import { ChecklistItem } from '@models/checklist';
import { formatarDataPtBr } from '@core/utils';

@Component({
  selector: 'app-fase-em-analise',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    PedidosResumo
  ],
  templateUrl: './fase-em-analise.html',
  styleUrl: './fase-em-analise.scss'
})
export class FaseEmAnalise implements OnInit {
  @Input() pedido!: PedidoDto;
  @Input() checklist: ChecklistItem[] = [];
  @Input() podeAvancar: boolean = false;
  @Input() loading: boolean = false;

  @Output() aprovar = new EventEmitter<void>();
  @Output() solicitarCorrecao = new EventEmitter<void>();

  // Ícones
  faCheck = faCheck;
  faExclamationTriangle = faExclamationTriangle;
  faSpinner = faSpinner;
  faSearch = faSearch;
  faClock = faClock;
  faUser = faUser;
  faCalendar = faCalendar;

  // Propriedades computadas
  totalDocumentos: number = 0;
  documentosConcluidos: number = 0;
  todosDocumentosOk: boolean = false;

  ngOnInit(): void {
    console.log('Checklist recebido:', this.checklist?.length || 0);
    this.calcularProgressoDocumentos();
  }

  /**
   * Calcula o progresso dos documentos do checklist
   */
  private calcularProgressoDocumentos(): void {
    if (!this.checklist || this.checklist.length === 0) {
      this.totalDocumentos = 0;
      this.documentosConcluidos = 0;
      this.todosDocumentosOk = true;
      return;
    }

    this.totalDocumentos = this.checklist.length;
    this.documentosConcluidos = this.checklist.filter(
      item => item.status === 'Concluído'
    ).length;

    // Verifica se todos os documentos obrigatórios estão concluídos
    const obrigatorios = this.checklist.filter(item => item.obrigatorio);
    const obrigatoriosConcluidos = obrigatorios.filter(item => item.status === 'Concluído');
    this.todosDocumentosOk = obrigatorios.length === obrigatoriosConcluidos.length;

    console.log('📊 Progresso dos documentos:', {
      total: this.totalDocumentos,
      concluidos: this.documentosConcluidos,
      obrigatoriosOk: this.todosDocumentosOk
    });
  }

  /**
   * Emite evento para aprovar o pedido
   */
  onAprovar(): void {
    if (this.podeAvancar) {
      console.log('✅ Aprovando pedido...');
      this.aprovar.emit();
    } else {
      console.log('❌ Não é possível aprovar: documentos pendentes');
    }
  }

  /**
   * Emite evento para solicitar correção
   */
  onSolicitarCorrecao(): void {
    console.log('📝 Solicitando correção...');
    this.solicitarCorrecao.emit();
  }

  // ==================== GETTERS ====================

  get dataPedidoFormatada(): string {
    if (!this.pedido?.dataPedido) return 'Não informado';
    return formatarDataPtBr(this.pedido.dataPedido);
  }

  get dataAtualizacaoFormatada(): string {
    if (!this.pedido?.atualizadoEm) return 'Não informado';
    return formatarDataPtBr(this.pedido.atualizadoEm);
  }

  get usuarioCriacao(): string {
    return this.pedido?.usuarioCriacao || '';
  }

  get podeSolicitarCorrecao(): boolean {
    return !this.loading;
  }

  get statusAnalise(): string {
    switch (this.pedido.status) {
      case 'EM_ANALISE':
        return 'Em análise';
      case 'REJEITADO':
        return 'Correções solicitadas';
      default:
        return this.pedido.status || 'Desconhecido';
    }
  }

  get progressoPercentual(): number {
    if (this.totalDocumentos === 0) return 100;
    return Math.round((this.documentosConcluidos / this.totalDocumentos) * 100);
  }

  // ==================== MÉTODOS DE PRIORIDADE ====================

  getPrioridadeClass(): string {
    switch (this.pedido.prioridade) {
      case 'URGENCIA':
        return 'bg-danger';
      case 'PRIORIDADE':
        return 'bg-warning text-dark';
      case 'ELETIVA':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  getPrioridadeIcon(): string {
    switch (this.pedido.prioridade) {
      case 'URGENCIA':
        return 'bi-exclamation-triangle-fill';
      case 'PRIORIDADE':
        return 'bi-flag-fill';
      case 'ELETIVA':
        return 'bi-calendar-check';
      default:
        return 'bi-question-circle';
    }
  }

  getPrioridadeTexto(): string {
    switch (this.pedido.prioridade) {
      case 'URGENCIA':
        return 'Urgência';
      case 'PRIORIDADE':
        return 'Prioridade';
      case 'ELETIVA':
        return 'Eletiva';
      default:
        return this.pedido.prioridade || 'Não definida';
    }
  }

  // ==================== MÉTODOS DE DOCUMENTOS ====================

  /**
   * Retorna a classe CSS para o badge de documentos
   */
  getDocumentosBadgeClass(): string {
    if (this.todosDocumentosOk) {
      return 'bg-success';
    }
    return 'bg-warning';
  }

  /**
   * Retorna o texto para o badge de documentos
   */
  getDocumentosBadgeText(): string {
    return `${this.documentosConcluidos}/${this.totalDocumentos} concluídos`;
  }

  /**
   * Retorna a mensagem de alerta baseada no status
   */
  getAlertaMensagem(): string {
    if (!this.todosDocumentosOk) {
      return 'Complete todos os documentos obrigatórios no checklist acima antes de aprovar.';
    }
    if (this.pedido.status === 'REJEITADO') {
      return 'Correções foram solicitadas para este pedido. Após as correções, ele retornará para análise.';
    }
    return '';
  }

  /**
   * Verifica se deve mostrar o alerta
   */
  deveMostrarAlerta(): boolean {
    return (!this.todosDocumentosOk && !this.loading) || this.pedido.status === 'REJEITADO';
  }

  /**
   * Retorna a classe do alerta baseada no status
   */
  getAlertaClass(): string {
    if (this.pedido.status === 'REJEITADO') {
      return 'alert-info';
    }
    return 'alert-warning';
  }

  /**
   * Retorna o ícone do alerta baseada no status
   */
  getAlertaIcon(): string {
    if (this.pedido.status === 'REJEITADO') {
      return 'bi-info-circle';
    }
    return 'bi-exclamation-triangle';
  }
}
