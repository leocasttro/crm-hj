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
import { formatarDataHoraPtBr } from '@core/utils';
import { ToastService } from '@services/utils';

@Component({
  selector: 'app-fase-consulta-pre-operatoria',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, PedidosResumo],
  templateUrl: './fase-consulta-pre-operatoria.html',
  styleUrls: ['./fase-consulta-pre-operatoria.scss'],
})
export class FaseConsultaPreOperatoria implements OnInit {
  @Input() pedido!: PedidoDto;
  @Input() checklist: ChecklistItem[] = [];
  @Input() podeAvancar: boolean = false;
  @Input() loading: boolean = false;

  @Output() agendarConfirmar = new EventEmitter<any>();
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

  // Campos do formulário
  dataConsulta: string = '';
  horaConsulta: string = '';
  localConsulta: string = '';
  medicoResponsavel: string = '';
  cuidados: string = '';
  observacoesEspeciais: string = '';

  // Snapshot dos dados do banco — usado para restaurar ao cancelar edição
  private _snapshotBanco = {
    dataConsulta: '',
    horaConsulta: '',
    localConsulta: '',
    medicoResponsavel: '',
    cuidados: '',
    observacoesEspeciais: '',
  };

  /**
   * true  → o pedido já possui dados de consulta salvos no banco.
   *         Os inputs ficam desabilitados até o usuário clicar em "Editar".
   * false → nenhum dado salvo ainda; inputs ficam habilitados para preenchimento.
   */
  dadosSalvosNoBanco: boolean = false;

  /**
   * true → o usuário clicou em "Editar" e os inputs estão liberados para alteração.
   */
  modoEdicao: boolean = false;

  // Controles de data
  dataMinima: string = new Date().toISOString().split('T')[0];
  dataMaxima: string = new Date(new Date().setMonth(new Date().getMonth() + 3))
    .toISOString()
    .split('T')[0];

  constructor(private toast: ToastService) {}

  ngOnInit(): void {
    this.carregarDadosConsulta();
  }

  // ── Carregamento ───────────────────────────────────────────

  private carregarDadosConsulta(): void {
    // Só considera "dados do banco" se existir a data da consulta
    if (this.pedido?.consultaPreDataHora) {
      const data = new Date(this.pedido.consultaPreDataHora);
      this.dataConsulta = data.toISOString().split('T')[0];

      const hora = data.getHours().toString().padStart(2, '0');
      const minutos = data.getMinutes().toString().padStart(2, '0');
      this.horaConsulta =
        hora !== '00' || minutos !== '00' ? `${hora}:${minutos}` : '';

      this.localConsulta = this.pedido.consultaPreLocal || '';
      this.medicoResponsavel = this.pedido.consultaPreMedico || '';
      this.cuidados = this.pedido.consultaPreCuidados || '';
      this.observacoesEspeciais =
        this.pedido.consultaPreObservacoesEspeciais || '';

      // Marca que existem dados vindos do banco
      this.dadosSalvosNoBanco = true;
      this.modoEdicao = false;

      // Salva snapshot para poder restaurar ao cancelar edição
      this._salvarSnapshot();
    } else {
      // Nenhum dado salvo: inputs ficam habilitados
      this.dadosSalvosNoBanco = false;
      this.modoEdicao = false;
    }
  }

  // ── Controle de edição ────────────────────────────────────

  /** Habilita edição dos campos já salvos no banco. */
  habilitarEdicao(): void {
    this._salvarSnapshot(); // garante snapshot atualizado antes de editar
    this.modoEdicao = true;
  }

  /** Cancela a edição e restaura os valores originais do banco. */
  cancelarEdicao(): void {
    this._restaurarSnapshot();
    this.modoEdicao = false;
  }

  private _salvarSnapshot(): void {
    this._snapshotBanco = {
      dataConsulta: this.dataConsulta,
      horaConsulta: this.horaConsulta,
      localConsulta: this.localConsulta,
      medicoResponsavel: this.medicoResponsavel,
      cuidados: this.cuidados,
      observacoesEspeciais: this.observacoesEspeciais,
    };
  }

  private _restaurarSnapshot(): void {
    this.dataConsulta = this._snapshotBanco.dataConsulta;
    this.horaConsulta = this._snapshotBanco.horaConsulta;
    this.localConsulta = this._snapshotBanco.localConsulta;
    this.medicoResponsavel = this._snapshotBanco.medicoResponsavel;
    this.cuidados = this._snapshotBanco.cuidados;
    this.observacoesEspeciais = this._snapshotBanco.observacoesEspeciais;
  }

  // ── Checklist ─────────────────────────────────────────────

  getChecklistConsulta(): ChecklistItem[] {
    return this.checklist.filter(
      (item) =>
        item.categoria === 'CONSULTA_PRE' ||
        item.titulo.toLowerCase().includes('consulta') ||
        item.titulo.toLowerCase().includes('pré') ||
        item.titulo.toLowerCase().includes('pre'),
    );
  }

  get itensPendentesConsulta(): number {
    return this.getChecklistConsulta().filter(
      (item) => item.status === 'Pendente' && item.obrigatorio,
    ).length;
  }

  get totalItensConsulta(): number {
    return this.getChecklistConsulta().length;
  }

  get documentosConsultaOk(): boolean {
    const obrigatorios = this.getChecklistConsulta().filter(
      (i) => i.obrigatorio,
    );
    return obrigatorios.every((i) => i.status === 'Concluído');
  }

  get podeAgendar(): boolean {
    return this.documentosConsultaOk && !!this.dataConsulta;
  }

  get podeIniciarProcedimento(): boolean {
    return this.documentosConsultaOk && this.pedido.status === 'CONFIRMADO';
  }

  // ── Helpers de template ───────────────────────────────────

  formatarDataHora(data: string): string {
    return formatarDataHoraPtBr(data);
  }

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

  // ── Montagem dos dados para envio ─────────────────────────

  private _montarDados(): any {
    return {
      dataConsulta: this.dataConsulta,
      horaConsulta: this.horaConsulta,
      localConsulta: this.localConsulta,
      medicoResponsavel: this.medicoResponsavel,
      cuidados: this.cuidados,
      observacoesEspeciais: this.observacoesEspeciais,
    };
  }

  // ── Ações ─────────────────────────────────────────────────


  onAgendarConfirmar(): void {
    if (!this.dataConsulta) {
      this.toast.warning('Selecione uma data para a consulta');
      return;
    }
    this.agendarConfirmar.emit(this._montarDados());
  }


  onIniciarProcedimento(): void {
    this.iniciarProcedimento.emit();
  }

  onReagendar(): void {
    if (confirm('Deseja realmente reagendar a consulta?')) {
      this.dataConsulta = '';
      this.horaConsulta = '';
      this.dadosSalvosNoBanco = false;
      this.modoEdicao = false;
      this.reagendar.emit();
    }
  }
}
