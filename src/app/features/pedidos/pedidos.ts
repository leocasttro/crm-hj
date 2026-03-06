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

// ✅ IMPORTS CORRIGIDOS COM PATHS
import { UiActionService } from '@services/utils';
import { NotificationStore } from '@services/store';
import { PedidoService } from '@services/api';
import { PacienteService } from '@services/api';

import { PedidosForm } from '@shared/component/pedidos-form/pedidos-form';
import { CardComponent } from '@shared/component/card-component/card-component';

import { PedidoDto } from '@models/pedido';
import { PacienteDto } from '@models/paciente';
import { CardData } from '@models/pedido';
import { ChecklistItem } from '@models/checklist';

import {
  mapPedidoToCardData,
  getStatusClass,
  getPrioridadeClasse,
  getIconeStatus,
  getProcedimentoPrincipal,
  getNomePaciente,
  getCrmMedico,
  formatarDataPedido,
  formatarPrioridade,
  calcularIdadePaciente,
  isPedidoUrgente,
  podeEditar,
  visualFromPrioridade,
  visualFromStatus,
  applyColumnVisual,
  formatarNomeProprio,
  formatarConvenio,
  avatarFromName,
  isEmAndamento,
  isConcluido,
  LABELS_COLUNA,
} from '@models/pedido/pedido.helpers';

import {
  validarArquivo,
  processarUploadArquivo,
} from '@models/checklist/checklist.helpers';

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
export class PedidosComponent implements OnInit {
  // ✅ Renomeado

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
  abrirModalPedido(pedido?: PedidoDto): void {
    const modalRef = this.modalService.open(PedidosForm, {
      size: 'xl',
      scrollable: true,
      backdrop: 'static',
      centered: false,
    });

    if (pedido) {
      modalRef.componentInstance.pedido = pedido;
    }

    modalRef.result
      .then((dados) => {
        if (dados) {
          this.salvarPedido(dados);
        }
      })
      .catch(() => {});
  }

  salvarPedido(dados: PedidoDto): void {
    // TODO: Implementar chamada HTTP
    console.log('Salvar pedido:', dados);
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
      return;
    }

    const movedCard = event.previousContainer.data[event.previousIndex];

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );

    const de = event.previousContainer.id;
    const para = event.container.id;

    // ✅ Usa helper para atualizar visual
    const cardAtualizado = applyColumnVisual(movedCard, para);
    Object.assign(movedCard, cardAtualizado);

    this.notificationStore.push({
      type: 'INFO',
      title: 'Pedido movimentado',
      message: `${movedCard.titulo} (${LABELS_COLUNA[de] || de} → ${LABELS_COLUNA[para] || para})`,
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

  async onArquivoSelecionado(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length || !this.itemSelecionadoParaUpload) {
      return;
    }

    const arquivo = input.files[0];
    const validacao = validarArquivo(arquivo);

    if (!validacao.valido) {
      // TODO: Mostrar erro
      console.error(validacao.mensagem);
      return;
    }

    // TODO: Implementar upload real
    console.log(
      `Arquivo ${arquivo.name} selecionado para ${this.itemSelecionadoParaUpload.titulo}`,
    );

    this.itemSelecionadoParaUpload = null;
    input.value = '';
  }

  /* ================== CARREGAMENTO DE DADOS ================== */
  private carregarPedidosDoBackend(): void {
    this.pedidoService
      .listar()
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
            .buscarPorIds(ids)
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
              const paciente = pacienteMap.get(pedido.pacienteId);

              const pedidoComPaciente = {
                ...pedido,
                paciente: paciente,
              };

              return mapPedidoToCardData(pedidoComPaciente);
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
            if (isConcluido(status)) {
              this.tarefasConcluidas.push(c);
            } else if (isEmAndamento(status)) {
              this.tarefasEmAndamento.push(c);
            } else {
              this.tarefasPendentes.push(c);
            }
          }
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err),
      });
  }
}
