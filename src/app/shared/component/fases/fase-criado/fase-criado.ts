import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChecklistItem } from '@core/models';
import { PedidoDto } from '@core/models/pedido/pedido.dto';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCheckCircle,
  faEnvelope,
  faExclamationTriangle,
  faFileMedical,
  faInfoCircle,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { PedidosResumo } from '@shared/component/pedidos-resumo/pedidos-resumo';

@Component({
  selector: 'app-fase-criado',
  imports: [CommonModule, FontAwesomeModule, PedidosResumo, FormsModule],
  templateUrl: './fase-criado.html',
  styleUrl: './fase-criado.scss',
})
export class FaseCriado {
  @Input() pedido!: PedidoDto;
  @Input() checklist: ChecklistItem[] = [];
  @Input() podeAvancar: boolean = false;
  @Input() loading: boolean = false;

  @Output() avancar = new EventEmitter<void>();
  @Output() visualizarChecklist = new EventEmitter<void>();

  // Ícones
  faFileMedical = faFileMedical;
  faSend = faEnvelope;
  faInfoCircle = faInfoCircle;
  faCheckCircle = faCheckCircle;
  faExclamationTriangle = faExclamationTriangle;
  faSpinner = faSpinner;

  // Propriedades computadas
  totalDocumentos: number = 0;
  documentosConcluidos: number = 0;
  todosDocumentosOk: boolean = false;

  ngOnInit(): void {
    this.calcularProgressoDocumentos();
  }

  private calcularProgressoDocumentos(): void {
    if (!this.checklist || this.checklist.length === 0) {
      this.totalDocumentos = 0;
      this.documentosConcluidos = 0;
      this.todosDocumentosOk = true;
      return;
    }

    this.totalDocumentos = this.checklist.length;
    this.documentosConcluidos = this.checklist.filter(
      (item) => item.status === 'Concluído',
    ).length;

    // Verifica se todos os documentos obrigatórios estão concluídos
    const obrigatorios = this.checklist.filter((item) => item.obrigatorio);
    const obrigatoriosConcluidos = obrigatorios.filter(
      (item) => item.status === 'Concluído',
    );
    this.todosDocumentosOk =
      obrigatorios.length === obrigatoriosConcluidos.length;
  }

  onEnviarParaAnalise(): void {
    if (this.podeAvancar) {
      this.avancar.emit();
    }
  }

  onVisualizarChecklist(): void {
    this.visualizarChecklist.emit();
  }

  // Formatar data de criação
  get dataCriacaoFormatada(): string {
    if (!this.pedido?.criadoEm) return '';
    return new Date(this.pedido.criadoEm).toLocaleDateString('pt-BR');
  }

  get horaCriacaoFormatada(): string {
    if (!this.pedido?.criadoEm) return '';
    return new Date(this.pedido.criadoEm).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
