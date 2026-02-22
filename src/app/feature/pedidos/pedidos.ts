import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, of, Subscription, switchMap } from 'rxjs';

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
import { PedidoService } from '../../shared/services/pedido.service';
import { PedidoDto } from '../../shared/models/pedido.dto';
import { formatarDataHoraPtBr } from '../../shared/util/date.util';
import {
  PacienteDto,
  PacienteService,
} from '../../shared/services/paciente.service';

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

  tarefasPendentes: CardData[] = [];
  tarefasEmAndamento: CardData[] = [];
  tarefasExecucao: CardData[] = [];
  tarefasConcluidas: CardData[] = [];

  /* ================== CONSTRUCTOR ================== */

  constructor(
    private uiAction: UiActionService,
    private modalService: NgbModal,
    private pedidoService: PedidoService,
    private pacienteService: PacienteService,
    private cdr: ChangeDetectorRef,
  ) {}

  /* ================== LIFECYCLE ================== */

  ngOnInit(): void {
    this.sub = this.uiAction.action$.subscribe((action) => {
      if (action === 'novo-pedido') this.abrirModalPedido();
    });

    this.carregarPedidosDoBackend();
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

  adicionarPedidoAoKanban(p: PedidoDto): void {
    const card = this.toCardData(p);
    this.tarefasPendentes.unshift(card);
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

  private visualFromPrioridade(prioridade?: string) {
    const pr = (prioridade ?? '').toUpperCase();

    switch (pr) {
      case 'ELETIVA':
        return {
          texto: 'Eletiva',
          badge: 'bg-primary text-white',
          text: 'text-primary',
        };

      case 'URGENTE':
        return {
          texto: 'Urgente',
          badge: 'bg-danger text-white',
          text: 'text-danger',
        };

      case 'EMERGENCIA':
        return {
          texto: 'Emergência',
          badge: 'bg-danger text-white',
          text: 'text-danger',
        };

      default:
        return {
          texto: pr || 'Sem prioridade',
          badge: 'bg-warning text-dark',
          text: 'text-warning',
        };
    }
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

  private toCardData(p: PedidoDto): CardData {
    const prioridadeVisual = this.visualFromPrioridade(p.prioridade);

    return {
      titulo: p.procedimento ?? '(Sem procedimento)',
      descricao: `${p.medicoSolicitante ?? ''} • ${p.convenio ?? ''}`.trim(),

      prioridade: prioridadeVisual.texto,
      prioridadeClasse: prioridadeVisual.text,

      badgeTexto: prioridadeVisual.texto,
      badgeClasseCor: prioridadeVisual.badge,

      urlImagem: this.avatarFromName(p.medicoSolicitante ?? 'P'),
      dataCriacao: formatarDataHoraPtBr(p.criadoEm),

      pedido: p,
      checklist: [],
      timelineFases: [],
    };
  }

  private toCardDataComPaciente(
    p: PedidoDto,
    paciente?: PacienteDto | undefined,
  ): CardData {
    const status = (p.status ?? '').toUpperCase();
    const visual = this.visualFromStatus(status, p.prioridade);

    const pacienteNome = paciente?.nomeCompleto ?? '(Paciente não carregado)';

    return {
      titulo: p.procedimento ?? '(Sem procedimento)',
      descricao:
        `${pacienteNome} • ${p.medicoSolicitante ?? ''} • ${p.convenio ?? ''}`.trim(),
      badgeTexto: visual.badgeTexto,
      badgeClasseCor: visual.badgeClasseCor,
      urlImagem: this.avatarFromName(pacienteNome),
      dataCriacao: formatarDataHoraPtBr(p.criadoEm),
      prioridade: p.prioridade,
      prioridadeClasse: this.visualFromPrioridade(p.prioridade).text,
      pedido: { ...p, paciente } as any, // guarda paciente dentro pra usar no modal
      checklist: [],
      timelineFases: [],
    };
  }

  private visualFromStatus(status: string, prioridade?: string) {
    // status manda mais que prioridade
    if (this.isConcluido(status)) {
      return { badgeTexto: 'Finalizado', badgeClasseCor: 'bg-success' };
    }

    if (this.isEmAndamento(status)) {
      return { badgeTexto: 'Em Progresso', badgeClasseCor: 'bg-primary' };
    }

    // pendente / rascunho
    const pr = (prioridade ?? '').toUpperCase();
    if (pr === 'URGENTE' || pr === 'EMERGENCIA') {
      return { badgeTexto: 'Urgente', badgeClasseCor: 'bg-danger' };
    }

    return { badgeTexto: 'Criado', badgeClasseCor: 'bg-secondary' };
  }

  private avatarFromName(nome: string): string {
    const letra = (nome?.trim()?.[0] ?? 'P').toUpperCase();
    return `https://placehold.co/24x24/0d6efd/FFFFFF?text=${encodeURIComponent(letra)}`;
  }

  private carregarPedidosDoBackend(): void {
    this.pedidoService
      .listar() // Observable<PedidoDto[]>
      .pipe(
        switchMap((pedidos: PedidoDto[]) => {
          const ids: string[] = [
            ...new Set(
              pedidos
                .map((p: PedidoDto) => p.pacienteId)
                .filter((id): id is string => !!id),
            ),
          ];

          if (ids.length === 0) {
            return of({ pedidos, pacientes: [] as PacienteDto[] });
          }

          return this.pacienteService
            .buscarPorIds(ids) // Observable<PacienteDto[]>
            .pipe(map((pacientes: PacienteDto[]) => ({ pedidos, pacientes })));
        }),
        map(
          ({
            pedidos,
            pacientes,
          }: {
            pedidos: PedidoDto[];
            pacientes: PacienteDto[];
          }) => {
            const pacienteMap = new Map<string, PacienteDto>(
              pacientes.map((p: PacienteDto) => [p.id, p]),
            );

            return pedidos.map((pedido: PedidoDto) => {
              const paciente = pacienteMap.get(pedido.pacienteId); // PacienteDto | undefined
              return this.toCardDataComPaciente(pedido, paciente);
            });
          },
        ),
      )
      .subscribe({
        next: (cards: CardData[]) => {
          this.tarefasPendentes = [];
          this.tarefasEmAndamento = [];
          this.tarefasExecucao = [];
          this.tarefasConcluidas = [];

          for (const c of cards) {
            const status = (c.pedido?.status ?? '').toUpperCase();
            if (this.isConcluido(status)) this.tarefasConcluidas.push(c);
            else if (this.isEmAndamento(status))
              this.tarefasEmAndamento.push(c);
            else this.tarefasPendentes.push(c);
          }
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err),
      });
  }

  private isEmAndamento(status: string): boolean {
    return ['EM_ANALISE', 'AGENDADO', 'EM_ANDAMENTO'].includes(status);
  }

  private isConcluido(status: string): boolean {
    return [
      'REALIZADO',
      'CANCELADO',
      'REJEITADO',
      'CONCLUIDO',
      'FINALIZADO',
    ].includes(status);
  }
}
