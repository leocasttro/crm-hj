import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgbCollapseModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowDown, faMinus, faTimeline } from '@fortawesome/free-solid-svg-icons';
import { CardDetalheComponent } from '../card-detalhe/card-detalhe-component';

export interface CardData {
  titulo: string;
  descricao: string;
  badgeTexto: string;
  badgeClasseCor: string;
  urlImagem: string;
  dataCriacao: string;
  checklist: ChecklistItem[];
  timelineFases?: any[];
}

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
    return (
      this.data?.timelineFases || [
        { nome: 'Criado', data: '2024-10-25', concluido: true },
        { nome: 'Em Análise', data: '2024-10-26', concluido: true },
        { nome: 'Retorno do Pedido', data: undefined, concluido: false },
        { nome: 'Marcação da Cirurgia', data: undefined, concluido: false },
        { nome: 'Consulta Pré-Operatória', data: undefined, concluido: false },
        { nome: 'Faturamento', data: undefined, concluido: false },
        { nome: 'Pós-Operatório', data: undefined, concluido: false },
        { nome: 'Finalizado', data: undefined, concluido: false },
      ]
    );
  }

  abrirModalTimeline() {
    const modalRef = this.modalService.open(CardDetalheComponent, {
      centered: true,
      scrollable: true,
      size: 'xl'
    });

    modalRef.componentInstance.fases = this.getTimelineFases();
  }

  public gerarIdUnico(titulo: string): string {
    return 'cardID-' + titulo.replace(/\s+/g, '');
  }
}
