import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSpinner,
  faCalendarCheck,
  faClock,
  faHeartPulse,
  faExclamationTriangle,
  faCheckCircle,
  faInfoCircle,
  faFileMedical,
  faBuilding,
  faMapPin,
  faPerson,
  faCircleArrowRight,
  faFile,
  faCalendar,
} from '@fortawesome/free-solid-svg-icons';

import { PedidosResumo } from '../../pedidos-resumo/pedidos-resumo';
import { PedidoDto } from '@models/pedido';
import { ChecklistItem } from '@models/checklist';
import { formatarDataPtBr, formatarDataHoraPtBr } from '@core/utils';
import { ToastService } from '@services/utils';

@Component({
  selector: 'app-fase-consulta-pre-operatoria',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    PedidosResumo
  ],
  templateUrl: './fase-consulta-pre-operatoria.html',
  styleUrls: ['./fase-consulta-pre-operatoria.scss']
})
export class FaseConsultaPreOperatoria implements OnInit {
  @Input() pedido!: PedidoDto;
  @Input() checklist: ChecklistItem[] = [];
  @Input() podeAvancar: boolean = false;
  @Input() loading: boolean = false;

  @Output() agendar = new EventEmitter<any>();
  @Output() confirmarAgendamento = new EventEmitter<any>();
  @Output() confirmarConsulta = new EventEmitter<void>();
  @Output() iniciarProcedimento = new EventEmitter<void>();
  @Output() reagendar = new EventEmitter<void>();

  @Output() dataChange = new EventEmitter<string>();
  @Output() horaChange = new EventEmitter<string>();
  @Output() localChange = new EventEmitter<string>();
  @Output() medicoChange = new EventEmitter<string>();
  @Output() cuidadosChange = new EventEmitter<string>();
  @Output() observacoesChange = new EventEmitter<string>();
  @Output() onToggleDocumento = new EventEmitter<ChecklistItem>();

  // Ícones
  faSpinner = faSpinner;
  faCalendarCheck = faCalendarCheck;
  faClock = faClock;
  faPinMap = faMapPin;
  faPersonBadge = faPerson;
  faHeartPulse = faHeartPulse;
  faExclamationTriangle = faExclamationTriangle;
  faCheckCircle = faCheckCircle;
  faArrowRightCircle = faCircleArrowRight;
  faCalendarX = faCalendar;
  faInfoCircle = faInfoCircle;
  faFileMedical = faFileMedical;
  faBuilding = faBuilding;
  faFileCheck = faFile;

  // Dados da consulta
  dataConsulta: string = '';
  horaConsulta: string = '';
  localConsulta: string = '';
  medicoResponsavel: string = '';
  cuidados: string = '';
  observacoesEspeciais: string = '';

  // Controles
  dataMinima: string = new Date().toISOString().split('T')[0];
  dataMaxima: string = new Date(new Date().setMonth(new Date().getMonth() + 3))
    .toISOString()
    .split('T')[0];

  constructor(private toast: ToastService) {}

  ngOnInit(): void {
    this.carregarDadosConsulta();
  }

  /**
   * Carrega dados da consulta existentes
   */
  private carregarDadosConsulta(): void {
    if (this.pedido.consultaPreDataHora) {
      const data = new Date(this.pedido.consultaPreDataHora);
      this.dataConsulta = data.toISOString().split('T')[0];

      const hora = data.getHours().toString().padStart(2, '0');
      const minutos = data.getMinutes().toString().padStart(2, '0');
      this.horaConsulta = `${hora}:${minutos}`;
    }

    this.localConsulta = this.pedido.consultaPreLocal || '';
    this.medicoResponsavel = this.pedido.consultaPreMedico || '';
    this.cuidados = this.pedido.consultaPreCuidados || '';
    this.observacoesEspeciais = this.pedido.consultaPreObservacoesEspeciais || '';
  }

  /**
   * Filtra apenas os itens do checklist relacionados à consulta pré
   */
  getChecklistConsulta(): ChecklistItem[] {
    return this.checklist.filter(
      (item) =>
        item.categoria === 'CONSULTA_PRE' ||
        item.titulo.toLowerCase().includes('consulta') ||
        item.titulo.toLowerCase().includes('pré') ||
        item.titulo.toLowerCase().includes('pre')
    );
  }

  /**
   * Retorna a quantidade de itens pendentes na consulta
   */
  get itensPendentesConsulta(): number {
    return this.getChecklistConsulta().filter(
      (item) => item.status === 'Pendente' && item.obrigatorio
    ).length;
  }

  /**
   * Retorna o total de itens da consulta
   */
  get totalItensConsulta(): number {
    return this.getChecklistConsulta().length;
  }

  /**
   * Verifica se todos os documentos da consulta estão ok
   */
  get documentosConsultaOk(): boolean {
    const itensConsulta = this.getChecklistConsulta();
    const obrigatorios = itensConsulta.filter(item => item.obrigatorio);
    const obrigatoriosConcluidos = obrigatorios.filter(item => item.status === 'Concluído');
    return obrigatorios.length === obrigatoriosConcluidos.length;
  }

  /**
   * Verifica se pode agendar a consulta
   */
  get podeAgendar(): boolean {
    return this.documentosConsultaOk && !!this.dataConsulta;
  }

  /**
   * Verifica se pode iniciar o procedimento
   */
  get podeIniciarProcedimento(): boolean {
    return this.documentosConsultaOk && this.pedido.status === 'CONFIRMADO';
  }

  /**
   * Formata data e hora para exibição
   */
  formatarDataHora(data: string): string {
    return formatarDataHoraPtBr(data);
  }

  /**
   * Retorna a classe do badge de status
   */
  getStatusBadgeClass(): string {
    switch (this.pedido.status) {
      case 'AGENDADO':
        return 'bg-info';
      case 'CONFIRMADO':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }

  /**
   * Retorna o texto do status
   */
  getStatusTexto(): string {
    switch (this.pedido.status) {
      case 'AGENDADO':
        return 'Aguardando confirmação';
      case 'CONFIRMADO':
        return 'Consulta confirmada';
      default:
        return this.pedido.status || 'Desconhecido';
    }
  }

  // ==================== AÇÕES ====================

  onAgendarConsulta(): void {
    if (!this.dataConsulta) {
      this.toast.warning('Selecione uma data para a consulta');
      return;
    }

    const dados = {
      dataConsulta: this.dataConsulta,
      horaConsulta: this.horaConsulta,
      localConsulta: this.localConsulta,
      medicoResponsavel: this.medicoResponsavel,
      cuidados: this.cuidados,
      observacoesEspeciais: this.observacoesEspeciais
    };

    this.agendar.emit(dados);
  }

  onConfirmarAgendamento(): void {
    const dados = {
      dataConsulta: this.dataConsulta,
      horaConsulta: this.horaConsulta,
      localConsulta: this.localConsulta,
      medicoResponsavel: this.medicoResponsavel,
      cuidados: this.cuidados,
      observacoesEspeciais: this.observacoesEspeciais
    };

    this.confirmarAgendamento.emit(dados);
  }

  onConfirmarConsulta(): void {
    if (!this.documentosConsultaOk) {
      this.toast.warning('Complete todos os documentos obrigatórios antes de confirmar');
      return;
    }
    this.confirmarConsulta.emit();
  }

  onIniciarProcedimento(): void {
    this.iniciarProcedimento.emit();
  }

  onReagendar(): void {
    if (confirm('Deseja realmente reagendar a consulta?')) {
      this.dataConsulta = '';
      this.horaConsulta = '';
      this.reagendar.emit();
    }
  }
}
