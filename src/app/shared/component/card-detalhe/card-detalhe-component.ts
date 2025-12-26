import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { NgbActiveModal, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap'; // ✨ 1. Importe o módulo aqui
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowDown, faArrowRight, faCheck, faMinus } from '@fortawesome/free-solid-svg-icons';

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

@Component({
  selector: 'app-card-component',
  standalone: true,
  imports: [CommonModule, NgClass, NgbCollapseModule, FontAwesomeModule],
  templateUrl: './card-detalhe-component.html',
  styleUrls: ['./card-detalhe-component.scss'],
})
export class CardDetalheComponent implements OnInit {
  @Input() fases: any[] = [];

  faCheck = faCheck;
  faArrowRight = faArrowRight;
  // Injetar o NgbActiveModal para controlar o modal (fechar, dispensar)
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}

  /**
   * Encontra o índice da primeira fase que *não* está concluída.
   * Esta será considerada a fase 'Atual'.
   * @returns O índice da fase atual, ou -1 se todas estiverem concluídas.
   */
  getProximaFaseIndex(): number {
    return this.fases.findIndex((fase) => !fase.concluido);
  }
}
