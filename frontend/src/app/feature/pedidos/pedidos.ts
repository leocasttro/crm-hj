import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
} from '@angular/cdk/drag-drop';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UiActionService } from '../../shared/services/ui-action.service';
import { PedidosForm } from '../../shared/component/pedidos-form/pedidos-form';
import { PEDIDO_MOCK } from '../../shared/mocks/pedido.mock';
import { FASES_PEDIDO_MOCK } from '../../shared/mocks/fases-pedido.mock';
import { ChecklistItem } from '../../shared/component/card-detalhe/card-detalhe-component';
import { CardData } from '../../shared/models/cardData';
import { CardComponent } from '../../shared/component/card-component/card-component';
import { NotificationStore } from '../../shared/services/notification.store';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    CardComponent,
  ],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.scss',
})
export class Pedidos implements OnInit, OnDestroy {
  /* ================== UPLOAD CHECKLIST ================== */
  @ViewChild('fileInput') fileInput!: ElementRef;
  private itemSelecionadoParaUpload: ChecklistItem | null = null;
  private notificationStore = inject(NotificationStore);

  /* ================== SUBSCRIPTION ================== */
  private sub!: Subscription;

  /* ================== KANBAN ================== */

  tarefasPendentes: CardData[] = [
    {
      titulo: PEDIDO_MOCK.titulo,
      descricao: PEDIDO_MOCK.descricao,
      badgeTexto: 'Criado',
      badgeClasseCor: 'bg-secondary',
      urlImagem: 'https://placehold.co/24x24/0d6efd/FFFFFF?text=C',
      dataCriacao: PEDIDO_MOCK.dataPedido,

      checklist: [
        { id: 1, titulo: 'Pedido médico anexado', status: 'Concluído' },
        { id: 2, titulo: 'Exames anexados', status: 'Concluído' },
        { id: 3, titulo: 'Documento de identidade', status: 'Pendente' },
        { id: 4, titulo: 'Carteirinha do convênio', status: 'Pendente' },
      ],

      // 🔥 ESSENCIAL PARA O DETALHE
      pedido: PEDIDO_MOCK,

      // 🔥 ESSENCIAL PARA A TIMELINE
      timelineFases: structuredClone(FASES_PEDIDO_MOCK),
    },
    {
      titulo: 'Confirmar jejum do paciente M. Silva',
      descricao: 'Ligar para o paciente ou responsável.',
      badgeTexto: 'Prioridade Média',
      badgeClasseCor: 'bg-warning',
      urlImagem: 'https://placehold.co/24x24/FFFF00/000000?text=P',
      dataCriacao: '30/09/2025',
      checklist: [
        { id: 1, titulo: 'Verificar cilindro de O2', status: 'Pendente' },
        { id: 2, titulo: 'Esterilizar instrumentos', status: 'Pendente' },
        { id: 3, titulo: 'Ligar monitor cardíaco', status: 'Pendente' },
      ],
      // 🔥 ESSENCIAL PARA O DETALHE
      pedido: PEDIDO_MOCK,

      // 🔥 ESSENCIAL PARA A TIMELINE
      timelineFases: structuredClone(FASES_PEDIDO_MOCK),
    },
  ];

  tarefasEmAndamento: CardData[] = [
    {
      titulo: 'Cirurgia de apendicite',
      descricao: 'Paciente A. Costa - Sala 1.',
      badgeTexto: 'Em Progresso',
      badgeClasseCor: 'bg-primary',
      urlImagem: 'https://placehold.co/24x24/0000FF/FFFFFF?text=A',
      dataCriacao: '01/10/2025',
      checklist: [
        { id: 1, titulo: 'Verificar cilindro de O2', status: 'Pendente' },
        { id: 2, titulo: 'Esterilizar instrumentos', status: 'Pendente' },
        { id: 3, titulo: 'Ligar monitor cardíaco', status: 'Pendente' },
      ],
      // 🔥 ESSENCIAL PARA O DETALHE
      pedido: PEDIDO_MOCK,

      // 🔥 ESSENCIAL PARA A TIMELINE
      timelineFases: structuredClone(FASES_PEDIDO_MOCK),
    },
  ];

  tarefasConcluidas: CardData[] = [
    {
      titulo: 'Relatório pós-cirúrgico',
      descricao: 'Paciente C. Pereira.',
      badgeTexto: 'Finalizado',
      badgeClasseCor: 'bg-success',
      urlImagem: 'https://placehold.co/24x24/00FF00/FFFFFF?text=R',
      dataCriacao: '28/09/2025',
      checklist: [
        { id: 1, titulo: 'Verificar cilindro de O2', status: 'Pendente' },
        { id: 2, titulo: 'Esterilizar instrumentos', status: 'Pendente' },
        { id: 3, titulo: 'Ligar monitor cardíaco', status: 'Pendente' },
      ],
      // 🔥 ESSENCIAL PARA O DETALHE
      pedido: PEDIDO_MOCK,

      // 🔥 ESSENCIAL PARA A TIMELINE
      timelineFases: structuredClone(FASES_PEDIDO_MOCK),
    },
  ];

  tarefas: CardData[] = [
    {
      titulo: 'Cirurgia de apendicite',
      descricao: 'Paciente A. Costa - Sala 1.',
      badgeTexto: 'Em Progresso',
      badgeClasseCor: 'bg-primary',
      urlImagem: 'https://placehold.co/24x24/0000FF/FFFFFF?text=A',
      dataCriacao: '01/10/2025',
      checklist: [
        { id: 1, titulo: 'Verificar cilindro de O2', status: 'Pendente' },
        { id: 2, titulo: 'Esterilizar instrumentos', status: 'Pendente' },
        { id: 3, titulo: 'Ligar monitor cardíaco', status: 'Pendente' },
      ],
      // 🔥 ESSENCIAL PARA O DETALHE
      pedido: PEDIDO_MOCK,

      // 🔥 ESSENCIAL PARA A TIMELINE
      timelineFases: structuredClone(FASES_PEDIDO_MOCK),
    },
  ];

  tarefasTeste: CardData[] = [
    {
      titulo: 'Cirurgia de apendicite',
      descricao: 'Paciente A. Costa - Sala 1.',
      badgeTexto: 'Em Progresso',
      badgeClasseCor: 'bg-primary',
      urlImagem: 'https://placehold.co/24x24/0000FF/FFFFFF?text=A',
      dataCriacao: '01/10/2025',
      checklist: [
        { id: 1, titulo: 'Verificar cilindro de O2', status: 'Pendente' },
        { id: 2, titulo: 'Esterilizar instrumentos', status: 'Pendente' },
        { id: 3, titulo: 'Ligar monitor cardíaco', status: 'Pendente' },
      ],
      // 🔥 ESSENCIAL PARA O DETALHE
      pedido: PEDIDO_MOCK,

      // 🔥 ESSENCIAL PARA A TIMELINE
      timelineFases: structuredClone(FASES_PEDIDO_MOCK),
    },
  ];

  /* ================== CONSTRUCTOR ================== */

  constructor(
    private uiAction: UiActionService,
    private modalService: NgbModal,
  ) {}

  /* ================== LIFECYCLE ================== */

  ngOnInit(): void {
    this.sub = this.uiAction.action$.subscribe((action) => {
      if (action === 'novo-pedido') {
        this.abrirModalPedido();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  /* ================== MODAL ================== */

  abrirModalPedido(): void {
    const modalRef = this.modalService.open(PedidosForm, {
      size: 'xl', // modal grande
      scrollable: true, // 🔴 ESSENCIAL
      backdrop: 'static',
      centered: false,
    });

    modalRef.result.then((dados) => {
      if (dados) {
        this.adicionarPedidoAoKanban(dados);
      }
    });
  }

  adicionarPedidoAoKanban(dados: any): void {
    const novoCard: CardData = {
      titulo: dados.titulo,
      descricao: dados.descricao,
      badgeTexto: dados.prioridade === 'URGENCIA' ? 'Urgente' : 'Novo',
      badgeClasseCor:
        dados.prioridade === 'URGENCIA' ? 'bg-danger' : 'bg-secondary',
      urlImagem: 'https://placehold.co/24x24/6c757d/FFFFFF?text=N',
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      checklist: [
        { id: 1, titulo: 'Pedido médico', status: 'Pendente' },
        { id: 2, titulo: 'Exames', status: 'Pendente' },
        { id: 3, titulo: 'Documento de identidade', status: 'Pendente' },
        { id: 4, titulo: 'Carteirinha do convênio', status: 'Pendente' },
      ],
      // 🔥 ESSENCIAL PARA O DETALHE
      pedido: PEDIDO_MOCK,

      // 🔥 ESSENCIAL PARA A TIMELINE
      timelineFases: structuredClone(FASES_PEDIDO_MOCK),
    };

    this.tarefasPendentes.unshift(novoCard);
  }

  /* ================== DRAG & DROP ================== */

  drop(event: CdkDragDrop<CardData[]>): void {
    const sameColumn = event.previousContainer === event.container;

    if (sameColumn) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      // opcional: notificar reordenação dentro da mesma coluna
      // const card = event.container.data[event.currentIndex];
      // this.notificationStore.push({ type: 'INFO', title: 'Ordem alterada', message: card.titulo });

      return;
    }

    // ✅ capture o card ANTES de transferir (porque depois ele some do array de origem)
    const movedCard = event.previousContainer.data[event.previousIndex];

    // move de fato
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );

    const de = event.previousContainer.id;
    const para = event.container.id;

    this.applyColumnVisual(movedCard, para);

    this.notificationStore.push({
      type: 'INFO',
      title: 'Pedido movimentado',
      message: `${movedCard.titulo} (${this.labelColuna(de)} → ${this.labelColuna(para)})`,
      link: '/pedidos',
      meta: {
        pedidoId: movedCard?.pedido?.id,
        de,
        para,
      },
    });
  }

  /* ================== CHECKLIST UPLOAD ================== */

  handleChecklistItemClick(item: ChecklistItem): void {
    this.itemSelecionadoParaUpload = item;
    this.fileInput.nativeElement.click();
  }

  onArquivoSelecionado(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (
      input.files &&
      input.files.length > 0 &&
      this.itemSelecionadoParaUpload
    ) {
      const arquivo = input.files[0];
      this.itemSelecionadoParaUpload.arquivo = arquivo;
      this.itemSelecionadoParaUpload.status = 'Concluído';

      console.log(
        `Upload do arquivo ${arquivo.name} para ${this.itemSelecionadoParaUpload.titulo}`,
      );

      this.itemSelecionadoParaUpload = null;
    }

    input.value = '';
  }

  private labelColuna(id: string) {
    const map: Record<string, string> = {
      PENDENTES: 'Pendentes',
      EM_ANDAMENTO: 'Em andamento',
      CONCLUIDAS: 'Concluídas',
    };
    return map[id] ?? id;
  }

  private applyColumnVisual(card: CardData, colunaId: string) {
    // ajuste visual do card conforme a coluna
    if (colunaId === 'PENDENTES') {
      card.badgeTexto = 'Criado';
      card.badgeClasseCor = 'bg-secondary';
    } else if (colunaId === 'EM_ANDAMENTO') {
      card.badgeTexto = 'Em Progresso';
      card.badgeClasseCor = 'bg-primary';
    } else if (colunaId === 'CONCLUIDAS') {
      card.badgeTexto = 'Finalizado';
      card.badgeClasseCor = 'bg-success';
    }
  }
}
