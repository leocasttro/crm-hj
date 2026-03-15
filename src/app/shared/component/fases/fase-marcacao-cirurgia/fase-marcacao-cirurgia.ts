import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSpinner,
  faCalendarCheck,
  faClock,
  faBuilding,
  faTruck,
  faFileText,
  faExclamationTriangle,
  faSave,
  faInfoCircle,
  faMapMarked,
  faArrowAltCircleRight,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';

import { PedidosResumo } from '../../pedidos-resumo/pedidos-resumo';
import { PedidoDto } from '@models/pedido';
import { ChecklistItem } from '@models/checklist';
import { formatarDataPtBr } from '@core/utils';
import { ToastService } from '@services/utils';

@Component({
  selector: 'app-fase-marcacao-cirurgia',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, PedidosResumo],
  templateUrl: './fase-marcacao-cirurgia.html',
  styleUrls: ['./fase-marcacao-cirurgia.scss'],
})
export class FaseMarcacaoCirurgia implements OnInit {
  @Input() pedido!: PedidoDto;
  @Input() checklist: ChecklistItem[] = [];
  @Input() podeAvancar: boolean = false;
  @Input() loading: boolean = false;

  @Output() agendar = new EventEmitter<any>();
  @Output() salvarRascunho = new EventEmitter<any>();

  @Output() hospitalChange = new EventEmitter<string>();
  @Output() fornecedorChange = new EventEmitter<string>();
  @Output() dataChange = new EventEmitter<string>();
  @Output() horarioChange = new EventEmitter<string>();
  @Output() localChange = new EventEmitter<string>();
  @Output() riscoChange = new EventEmitter<string>();

  @Output() aprovarAgendamento = new EventEmitter<void>();
  @Output() rejeitarAgendamento = new EventEmitter<string>();

  // Ícones
  faSpinner = faSpinner;
  faCalendarCheck = faCalendarCheck;
  faClock = faClock;
  faBuilding = faBuilding;
  faTruck = faTruck;
  faPinMap = faMapMarked;
  faFileText = faFileText;
  faExclamationTriangle = faExclamationTriangle;
  faSave = faSave;
  faArrowRightCircle = faArrowAltCircleRight;
  faInfoCircle = faInfoCircle;
  faFileCheck = faCheckCircle;

  // Dados do agendamento - APENAS OS CAMPOS SOLICITADOS
  hospital: string = '';
  fornecedor: string = '';
  dataCirurgia: string = '';
  horario: string = '';
  local: string = '';
  riscoCirurgico: string = '';
  motivoRejeicao: string = '';

  // Upload do termo
  termoSelecionado: File | null = null;
  salvandoTermo: boolean = false;
  progressoUpload: number = 0;

  // Controles
  dataMinima: string = new Date().toISOString().split('T')[0];
  dataMaxima: string = new Date(new Date().setMonth(new Date().getMonth() + 6))
    .toISOString()
    .split('T')[0];

  // Documentos
  totalDocumentos: number = 0;
  documentosConcluidos: number = 0;
  todosDocumentosOk: boolean = false;

  constructor(private toast: ToastService) {}

  ngOnInit(): void {
    this.calcularProgressoDocumentos();
    this.carregarDadosAgendamento();
  }

  /**
   * Carrega dados de agendamento existentes
   */
  private carregarDadosAgendamento(): void {
    this.hospital = this.pedido.agendamentoHospital || '';
    this.fornecedor = this.pedido.agendamentoFornecedor || '';
    this.local = this.pedido.agendamentoLocal || '';
    this.riscoCirurgico = this.pedido.agendamentoRiscoCirurgico || '';

    // Data e hora
    if (this.pedido.agendamentoDataHora) {
      const data = new Date(this.pedido.agendamentoDataHora);
      this.dataCirurgia = data.toISOString().split('T')[0];

      const hora = data.getHours().toString().padStart(2, '0');
      const minutos = data.getMinutes().toString().padStart(2, '0');
      this.horario = `${hora}:${minutos}`;
    }
  }

  /**
   * Calcula o progresso dos documentos
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
      (item) => item.status === 'Concluído',
    ).length;

    const obrigatorios = this.checklist.filter((item) => item.obrigatorio);
    const obrigatoriosConcluidos = obrigatorios.filter(
      (item) => item.status === 'Concluído',
    );
    this.todosDocumentosOk =
      obrigatorios.length === obrigatoriosConcluidos.length;
  }

  onAprovar(): void {
    this.aprovarAgendamento.emit();
  }

  onRejeitar(): void {
    if (!this.motivoRejeicao.trim()) {
      this.toast.warning('Informe o motivo da rejeição');
      return;
    }
    this.rejeitarAgendamento.emit(this.motivoRejeicao);
    this.motivoRejeicao = '';
  }

  get isAguardandoAprovacao(): boolean {
    return this.pedido?.status === 'AGUARDANDO_APROVACAO_AGENDAMENTO';
  }

  /**
   * Salva rascunho (dados podem estar incompletos)
   */
  onSalvarRascunho(): void {
    const dados = {
      hospital: this.hospital,
      fornecedor: this.fornecedor,
      dataCirurgia: this.dataCirurgia,
      horario: this.horario,
      local: this.local,
      riscoCirurgico: this.riscoCirurgico,
    };

    this.salvarRascunho.emit(dados);
    this.toast.success('Rascunho salvo com sucesso!');
  }

  /**
   * Avança para próxima fase (dados podem estar incompletos)
   */
  onAvancar(): void {
    // Monta data e hora completa se existir
    let dataHoraFormatada = null;
    if (this.dataCirurgia) {
      if (this.horario) {
        dataHoraFormatada = `${this.dataCirurgia}T${this.horario}:00`;
      } else {
        dataHoraFormatada = `${this.dataCirurgia}T00:00:00`;
      }
    }

    const agendamento = {
      hospital: this.hospital,
      fornecedor: this.fornecedor,
      dataAgendamento: dataHoraFormatada,
      local: this.local,
      riscoCirurgico: this.riscoCirurgico,
    };

    this.agendar.emit(agendamento);
  }

  // ==================== MÉTODOS DO TERMO ====================

  onTermoSelecionado(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.toast.warning('Arquivo muito grande. Tamanho máximo: 5MB');
      return;
    }

    const tipo = file.type;
    if (!tipo.includes('pdf') && !tipo.includes('image')) {
      this.toast.warning('Formato não permitido. Use PDF ou imagem (JPG/PNG)');
      return;
    }

    this.termoSelecionado = file;
  }

  async salvarTermo(): Promise<void> {
    if (!this.termoSelecionado) return;

    this.salvandoTermo = true;
    this.progressoUpload = 0;

    try {
      const interval = setInterval(() => {
        this.progressoUpload += 10;
        if (this.progressoUpload >= 90) {
          clearInterval(interval);
        }
      }, 100);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      clearInterval(interval);
      this.progressoUpload = 100;

      this.pedido.termoConsentimentoUrl = 'url-do-termo';
      this.pedido.termoConsentimentoNome = this.termoSelecionado.name;

      this.toast.success('Termo enviado com sucesso!');
      this.termoSelecionado = null;

      setTimeout(() => {
        this.progressoUpload = 0;
      }, 1500);
    } catch (error) {
      console.error('Erro ao enviar termo:', error);
      this.toast.error('Erro ao enviar termo');
      this.progressoUpload = 0;
    } finally {
      this.salvandoTermo = false;
    }
  }

  async removerTermo(): Promise<void> {
    if (!confirm('Tem certeza que deseja remover o termo?')) return;

    try {
      this.pedido.termoConsentimentoUrl = undefined;
      this.pedido.termoConsentimentoNome = undefined;
      this.toast.success('Termo removido');
    } catch (error) {
      console.error('Erro ao remover termo:', error);
      this.toast.error('Erro ao remover termo');
    }
  }

  visualizarTermo(): void {
    if (this.pedido.termoConsentimentoUrl) {
      window.open(this.pedido.termoConsentimentoUrl, '_blank');
    }
  }

  // ==================== GETTERS ====================

  get dataValidadeFormatada(): string {
    if (!this.pedido.validadeAutorizacao) return '';
    return formatarDataPtBr(this.pedido.validadeAutorizacao);
  }

  getStatusAutorizacaoClass(): string {
    switch (this.pedido.statusAutorizacao) {
      case 'AUTORIZADO':
        return 'bg-success';
      case 'AUTORIZADO_PARCIAL':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary';
    }
  }

  getStatusAutorizacaoTexto(): string {
    switch (this.pedido.statusAutorizacao) {
      case 'AUTORIZADO':
        return 'Autorizado';
      case 'AUTORIZADO_PARCIAL':
        return 'Autorizado Parcialmente';
      default:
        return this.pedido.statusAutorizacao || 'Não informado';
    }
  }

  isValidadeProxima(): boolean {
    if (!this.pedido.validadeAutorizacao) return false;

    const hoje = new Date();
    const validade = new Date(this.pedido.validadeAutorizacao);
    const diffTime = validade.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 7 && diffDays > 0;
  }

  getValidadeClass(): string {
    if (!this.pedido.validadeAutorizacao) return '';

    const hoje = new Date();
    const validade = new Date(this.pedido.validadeAutorizacao);

    if (validade < hoje) {
      return 'text-danger';
    }

    if (this.isValidadeProxima()) {
      return 'text-warning';
    }

    return '';
  }

  getDocumentosBadgeClass(): string {
    if (this.todosDocumentosOk) {
      return 'bg-success';
    }
    return 'bg-warning';
  }

  getDocumentosBadgeText(): string {
    return `${this.documentosConcluidos}/${this.totalDocumentos} concluídos`;
  }

  get temTermo(): boolean {
    return !!this.pedido.termoConsentimentoUrl;
  }
}
