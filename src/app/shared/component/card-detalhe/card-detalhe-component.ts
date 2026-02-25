import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { NgbActiveModal, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowDown,
  faArrowRight,
  faCheck,
  faMinus,
  faClock,
  faUser,
  faShield,
  faFileMedical,
  faHospital,
  faCalendar,
  faTags,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { PedidosResumo } from '../pedidos-resumo/pedidos-resumo';
import { Pedido } from '../../models/pedido';

export interface CardData {
  titulo: string;
  descricao: string;
  badgeTexto: string;
  badgeClasseCor: string;
  urlImagem: string;
  dataCriacao: string;
  checklist: ChecklistItem[];
}

export interface ChecklistItem {
  id: number;
  titulo: string;
  status: 'Pendente' | 'Concluído';
  arquivo?: File;
}

export type CodigoFase =
  | 'CRIADO'
  | 'EM_ANALISE'
  | 'RETORNO_PEDIDO'
  | 'MARCACAO_CIRURGIA'
  | 'CONSULTA_PRE_OPERATORIA'
  | 'FATURAMENTO'
  | 'POS_OPERATORIO'
  | 'FINALIZADO';

export interface FasePedido {
  codigo: CodigoFase;
  nome: string;
  data?: string;
  concluido: boolean;
}

@Component({
  selector: 'app-card-component',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    NgbCollapseModule,
    FontAwesomeModule,
    PedidosResumo,
  ],
  templateUrl: './card-detalhe-component.html',
  styleUrls: ['./card-detalhe-component.scss'],
})
export class CardDetalheComponent implements OnInit {
  @Input() fases: FasePedido[] = [];
  @Input() pedido!: any;

  faseAtual!: CodigoFase;

  // Ícones do FontAwesome
  faArrowDown = faArrowDown;
  faArrowRight = faArrowRight;
  faCheck = faCheck;
  faMinus = faMinus;
  faClock = faClock;
  faUser = faUser;
  faShield = faShield;
  faFileMedical = faFileMedical;
  faHospital = faHospital;
  faCalendar = faCalendar;
  faTags = faTags;
  faExclamationTriangle = faExclamationTriangle;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    this.definirFaseAtual();
    console.log('Pedido recebido no detalhe:', this.pedido);
  }

  definirFaseAtual(): void {
    const faseAtualObj = this.fases.find((f) => !f.concluido);
    this.faseAtual = faseAtualObj ? faseAtualObj.codigo : 'FINALIZADO';
  }

  getProximaFaseIndex(): number {
    return this.fases.findIndex((fase) => !fase.concluido);
  }

  avancarFase(): void {
    const index = this.getProximaFaseIndex();
    if (index >= 0) {
      this.fases[index].concluido = true;
      this.fases[index].data = new Date().toISOString();
      this.definirFaseAtual();
    }
  }

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

  // Métodos auxiliares
  formatarData(data: string | Date): string {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
  }

  formatarDataHora(data: string | Date): string {
    if (!data) return '';
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

  temDadosInternacao(): boolean {
    return !!(
      this.pedido?.caraterAtendimento ||
      this.pedido?.tipoInternacao ||
      this.pedido?.regimeInternacao ||
      this.pedido?.qtdDiariasSolicitadas
    );
  }
}
