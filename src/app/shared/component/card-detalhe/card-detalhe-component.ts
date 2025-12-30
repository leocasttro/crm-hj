import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { NgbActiveModal, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap'; // ✨ 1. Importe o módulo aqui
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowDown,
  faArrowRight,
  faCheck,
  faMinus,
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
  @Input() pedido!: any; // 👈 DADOS DO PEDIDO (mock ou API)

  faseAtual!: CodigoFase;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    this.definirFaseAtual();
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
}
