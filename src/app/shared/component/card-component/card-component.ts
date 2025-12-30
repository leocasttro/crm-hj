import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgbCollapseModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowDown,
  faMinus,
  faTimeline,
} from '@fortawesome/free-solid-svg-icons';
import { CardDetalheComponent } from '../card-detalhe/card-detalhe-component';
import { CardData } from '../../models/cardData';


export interface ChecklistItem {
  id: number;
  titulo: string;
  status: 'Pendente' | 'Concluído';
  arquivo?: File;
}

@Component({
  selector: 'app-card-component',
  standalone: true,
  imports: [NgClass, NgbCollapseModule, FontAwesomeModule],
  templateUrl: './card-component.html',
  styleUrls: ['./card-component.scss'],
})
export class CardComponent {
  @Input() data!: CardData;
  @Output() checklistItemSelected = new EventEmitter<ChecklistItem>();
  public isCollapsed = true;

  faMinus = faMinus;
  faTimeLine = faTimeline;

  constructor(private modalService: NgbModal) {}

  onItemClick(item: ChecklistItem): void {
    if (item.status === 'Pendente') {
      this.checklistItemSelected.emit(item);
    }
  }

  private getTimelineFases(): any[] {
    return [
      {
        codigo: 'CRIADO',
        nome: 'Criado',
        data: '2024-10-25',
        concluido: false,
      },
      {
        codigo: 'EM_ANALISE',
        nome: 'Em Análise',
        data: '2024-10-26',
        concluido: false,
      },
      {
        codigo: 'RETORNO_PEDIDO',
        nome: 'Retorno do Pedido',
        concluido: false,
      },
      {
        codigo: 'MARCACAO_CIRURGIA',
        nome: 'Marcação da Cirurgia',
        concluido: false,
      },
      {
        codigo: 'CONSULTA_PRE_OPERATORIA',
        nome: 'Consulta Pré-Operatória',
        concluido: false,
      },
      {
        codigo: 'FATURAMENTO',
        nome: 'Faturamento',
        concluido: false,
      },
      {
        codigo: 'POS_OPERATORIO',
        nome: 'Pós-Operatório',
        concluido: false,
      },
      {
        codigo: 'FINALIZADO',
        nome: 'Finalizado',
        concluido: false,
      },
    ];
  }

  abrirModalTimeline() {
    const modalRef = this.modalService.open(CardDetalheComponent, {
      centered: true,
      scrollable: true,
      size: 'xl',
    });

    modalRef.componentInstance.fases = this.getTimelineFases();
    modalRef.componentInstance.pedido = this.data.pedido; // 🔥 ESSENCIAL
    console.log(this.data)
  }

  public gerarIdUnico(titulo: string): string {
    return 'cardID-' + titulo.replace(/\s+/g, '');
  }
}
