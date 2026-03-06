import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { NgbActiveModal, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
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
  faUpload,
  faDownload,
  faTrash,
  faPaperclip,
  faCloudUpload,
  faCloudDownload,
  faTimesCircle,
  faSave,
} from '@fortawesome/free-solid-svg-icons';

import { PedidosResumo } from '../pedidos-resumo/pedidos-resumo';
import { PedidoDto } from '@models/pedido';
import { PedidoService } from '@services/api';
import { ToastService } from '@services/utils';
import { ChecklistItem } from '@models/checklist';
import { FasePedido, CodigoFase } from '@models/pedido';

import {
  getChecklistPadrao,
  validarArquivo,
  podeConcluirItem,
  processarUploadArquivo,
  removerArquivo as removerArquivoHelper,
  carregarArquivo,
  calcularProgresso,
  getItensPendentes,
  validarChecklist,
  getStatusBadgeClass,
  getStatusIcon,
  getCategoriaIcon,
  getCategoriaColor,
  formatarTamanhoArquivo,
  TAMANHO_MAXIMO_ARQUIVO,
  TIPOS_ARQUIVO_PERMITIDOS,
  EXTENSOES_PERMITIDAS,
  UploadArquivoResult,
  toggleItemStatus,
  selecionarArquivoLocal,
  limparArquivoSelecionado,
  atualizarArquivoSalvo,
  podeAvancarFase as podeAvancarFaseHelper,
  listarArquivosChecklist,
} from '@models/checklist/checklist.helpers';

// Helper de ações do pedido
import {
  executarAcaoPedido,
  validarAntesAcao,
} from '@models/pedido/pedido.helpers';

@Component({
  selector: 'app-card-detalhe',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    NgbCollapseModule,
    FontAwesomeModule,
    PedidosResumo,
    FormsModule,
  ],
  templateUrl: './card-detalhe-component.html',
  styleUrls: ['./card-detalhe-component.scss'],
})
export class CardDetalheComponent implements OnInit {
  @Input() fases: FasePedido[] = [];
  @Input() pedido!: PedidoDto;
  @Input() checklist: ChecklistItem[] = [];
  @Output() faseAvancada = new EventEmitter<any>();
  @Output() checklistAtualizado = new EventEmitter<ChecklistItem[]>();

  faseAtual!: CodigoFase;
  loading = false;
  isChecklistCollapsed = true;
  uploadProgress: { [key: number]: number } = {};

  // Ícones
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
  faUpload = faUpload;
  faDownload = faDownload;
  faTrash = faTrash;
  faPaperclip = faPaperclip;
  faCloudUpload = faCloudUpload;
  faCloudDownload = faCloudDownload;
  faTimesCircle = faTimesCircle;
  faSave = faSave;

  // Helpers expostos para o template
  getStatusBadgeClass = getStatusBadgeClass;
  getStatusIcon = getStatusIcon;
  getCategoriaIcon = getCategoriaIcon;
  getCategoriaColor = getCategoriaColor;
  formatarTamanhoArquivo = formatarTamanhoArquivo;
  TAMANHO_MAXIMO_ARQUIVO = TAMANHO_MAXIMO_ARQUIVO;

  idsArquivosExistentes: number[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private pedidoService: PedidoService,
    private toast: ToastService,
    private cdRef: ChangeDetectorRef, // Usado para detecção de mudanças manual após upload
  ) {}

  ngOnInit(): void {
    this.inicializarComponente();
  }

  inicializarComponente(): void {
    if (!this.fases || this.fases.length === 0) {
      this.fases = this.gerarFasesPadrao();
    }

    if (!this.checklist || this.checklist.length === 0) {
      this.checklist = getChecklistPadrao();
    } else {
      this.carregarArquivos();
    }

    this.atualizarFasesPorStatus(this.pedido.status);
    this.consultarArquivosExistentes();
  }

  // ==================== TIMELINE ====================

  definirFaseAtual(): void {
    const faseAtualObj = this.fases.find((f) => !f.concluido);
    this.faseAtual = faseAtualObj ? faseAtualObj.codigo : 'FINALIZADO';
  }

  getProximaFaseIndex(): number {
    return this.fases.findIndex((fase) => !fase.concluido);
  }

  // ==================== CHECKLIST ====================

  async toggleChecklistItem(item: ChecklistItem) {
    const pode = podeConcluirItem(item);
    if (!pode.pode) {
      if (pode.mensagem) this.toast.warning(pode.mensagem);
      return;
    }

    // Usa helper para atualizar o status
    const itemAtualizado = toggleItemStatus(item, true);
    Object.assign(item, itemAtualizado);

    this.toast.success(`Item "${item.titulo}" concluído!`);
    this.checklistAtualizado.emit(this.checklist);
  }

  selecionarArquivo(item: ChecklistItem, event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const validacao = validarArquivo(file);
    if (!validacao.valido) {
      this.toast.error(validacao.mensagem!);
      return;
    }

    // Usa helper para atualizar o item
    const itemAtualizado = selecionarArquivoLocal(item, file);
    Object.assign(item, itemAtualizado);

    this.toast.info(`Arquivo "${file.name}" selecionado. Clique em SALVAR.`);
  }

  async salvarArquivo(item: ChecklistItem) {
    if (!item.arquivoSelecionado) return;

    item.salvando = true;
    this.uploadProgress[item.id] = 0;

    const resultado = await processarUploadArquivo(
      item.arquivoSelecionado,
      this.pedido.id,
      item.id,
      item.observacao,
      this.pedidoService,
      (progress) => {
        this.uploadProgress[item.id] = progress;
        this.cdRef?.detectChanges();
      },
    );

    if (resultado.sucesso && resultado.arquivo) {
      const itemAtualizado = atualizarArquivoSalvo(item, resultado.arquivo);
      Object.assign(item, itemAtualizado);

      this.uploadProgress[item.id] = 100;

      setTimeout(() => {
        delete this.uploadProgress[item.id];
        this.cdRef?.detectChanges();
      }, 1500);

      this.toast.success('Arquivo salvo com sucesso!');
      this.checklistAtualizado.emit(this.checklist);

      // Opcional: recarregar a lista de arquivos
      await this.consultarArquivosExistentes();
    } else {
      item.salvando = false;
      this.uploadProgress[item.id] = 0;
      this.toast.error(resultado.mensagem || 'Erro ao salvar arquivo');
    }
  }
  async consultarArquivosExistentes() {
    if (!this.pedido?.id) return;

    try {
      const response = (await listarArquivosChecklist(
        this.pedido.id,
        this.pedidoService,
      )) as any;

      console.log('📦 RESPOSTA COMPLETA:', response);

      let arquivos: any[] = [];

      if (Array.isArray(response)) {
        arquivos = response.map((item) => item.arquivo).filter((a) => a);
      } else if (
        response &&
        typeof response === 'object' &&
        'arquivo' in response
      ) {
        arquivos = [response.arquivo];
      }

      // Guarda os IDs dos itens que têm arquivo
      this.idsArquivosExistentes = arquivos
        .map((a) => a?.checklistItemId)
        .filter((id) => id !== undefined);

      console.log('📋 ITENS COM ARQUIVO:', this.idsArquivosExistentes);
      console.log('📦 DETALHES:', arquivos);

      // ===== NOVO: Atualiza o checklist =====
      this.atualizarChecklistComArquivos(arquivos);
    } catch (error) {
      console.error('Erro ao consultar:', error);
      this.idsArquivosExistentes = [];
    }
  }

  private atualizarChecklistComArquivos(arquivos: any[]) {
    if (!this.checklist || !this.pedido?.id) return;

    let atualizacoes = 0;

    this.checklist = this.checklist.map((item) => {
      const arquivo = arquivos.find((a) => a?.checklistItemId === item.id);

      if (arquivo) {
        atualizacoes++;

        return {
          ...item,
          arquivo: {
            id: arquivo.id,
            nome: arquivo.nomeOriginal,
            url: `/api/pedidos/${this.pedido.id}/arquivos/checklist/${item.id}/download`,
            tamanho: arquivo.tamanhoBytes,
            tipo: this.getContentType(arquivo.nomeOriginal),
          },
          status: 'Concluído',
          dataConclusao: new Date().toISOString(),
        };
      }
      return item;
    });

    this.cdRef.detectChanges();

    if (atualizacoes > 0) {
      this.checklistAtualizado.emit(this.checklist);
    }
  }

  private getContentType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const types: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    return types[ext || ''] || 'application/octet-stream';
  }

  cancelarSelecaoArquivo(item: ChecklistItem) {
    const itemAtualizado = limparArquivoSelecionado(item);
    Object.assign(item, itemAtualizado);
    this.toast.info('Seleção cancelada');
  }

  downloadArquivo(item: ChecklistItem) {
    if (item.arquivo?.url) window.open(item.arquivo.url, '_blank');
  }

  async removerArquivo(item: ChecklistItem, event: Event) {
    event.stopPropagation();
    if (!confirm('Tem certeza que deseja remover este arquivo?')) return;

    const resultado = await removerArquivoHelper(
      item,
      this.pedido.id,
      this.pedidoService,
    );

    if (resultado.sucesso) {
      item.arquivo = undefined;
      if (item.status === 'Concluído' && item.obrigatorio) {
        item.status = 'Pendente';
        item.dataConclusao = undefined;
      }
      this.toast.success('Arquivo removido');
      this.checklistAtualizado.emit(this.checklist);
    } else {
      this.toast.error(resultado.mensagem || 'Erro ao remover arquivo');
    }
  }

  private async carregarArquivos() {
    const promessas = this.checklist.map(async (item) => {
      if (!item.id || item.arquivo?.url) return;

      const resultado = await carregarArquivo(
        item,
        this.pedido.id,
        this.pedidoService,
      );

      if (resultado.sucesso && resultado.arquivo) {
        item.arquivo = resultado.arquivo;
      }
    });

    await Promise.all(promessas);
  }

  // ==================== VALIDAÇÕES ====================

  podeAvancarFase(): boolean {
    return podeAvancarFaseHelper(this.checklist);
  }

  getItensPendentesCount(): number {
    return getItensPendentes(this.checklist).length;
  }

  getProgressoChecklist(): number {
    return calcularProgresso(this.checklist).percentual;
  }

  podeAprovar(): boolean {
    return this.podeAvancarFase() && this.faseAtual === 'EM_ANALISE';
  }

  // ==================== AÇÕES DO PEDIDO ====================

  async enviarParaAnalise() {
    const validacao = validarAntesAcao(
      this.checklist,
      this.faseAtual,
      'enviar',
    );
    if (!validacao.valido) {
      this.toast.warning(validacao.mensagem!);
      return;
    }

    const resultado = await executarAcaoPedido(
      () => this.pedidoService.iniciarAnalise(this.pedido.id),
      (loading) => (this.loading = loading),
      this.toast,
      'Pedido enviado para análise!',
      'Erro ao enviar para análise',
    );

    if (resultado.sucesso && resultado.pedido) {
      this.pedido = resultado.pedido;
      this.atualizarFasesPorStatus(this.pedido.status);
      this.faseAvancada.emit(this.pedido);
    }
  }

  async aprovarPedido() {
    const validacao = validarAntesAcao(
      this.checklist,
      this.faseAtual,
      'aprovar',
    );
    if (!validacao.valido) {
      this.toast.warning(validacao.mensagem!);
      return;
    }

    const resultado = await executarAcaoPedido(
      () =>
        this.pedidoService.aprovarPedido(this.pedido.id, 'Aprovado na análise'),
      (loading) => (this.loading = loading),
      this.toast,
      'Pedido aprovado!',
      'Erro ao aprovar pedido',
    );

    if (resultado.sucesso && resultado.pedido) {
      this.pedido = resultado.pedido;
      this.atualizarFasesPorStatus(this.pedido.status);
      this.faseAvancada.emit(this.pedido);
    }
  }

  async solicitarCorrecao() {
    const motivo = prompt('Informe o motivo da correção:');
    if (!motivo) return;

    const resultado = await executarAcaoPedido(
      () => this.pedidoService.reprovarPedido(this.pedido.id, motivo),
      (loading) => (this.loading = loading),
      this.toast,
      'Correções solicitadas',
      'Erro ao solicitar correção',
    );

    if (resultado.sucesso && resultado.pedido) {
      this.pedido = resultado.pedido;
      this.atualizarFasesPorStatus(this.pedido.status);
      this.faseAvancada.emit(this.pedido);
    }
  }

  async reenviarParaAnalise() {
    const validacao = validarAntesAcao(
      this.checklist,
      this.faseAtual,
      'reenviar',
    );
    if (!validacao.valido) {
      this.toast.warning(validacao.mensagem!);
      return;
    }

    const resultado = await executarAcaoPedido(
      () => this.pedidoService.atualizarStatus(this.pedido.id, 'PENDENTE'),
      (loading) => (this.loading = loading),
      this.toast,
      'Pedido reenviado para análise',
      'Erro ao reenviar',
    );

    if (resultado.sucesso && resultado.pedido) {
      this.pedido = resultado.pedido;
      this.atualizarFasesPorStatus(this.pedido.status);
      this.faseAvancada.emit(this.pedido);
    }
  }

  async agendarCirurgia() {
    const validacao = validarAntesAcao(
      this.checklist,
      this.faseAtual,
      'agendar',
    );
    if (!validacao.valido) {
      this.toast.warning(validacao.mensagem!);
      return;
    }

    const dadosAgendamento = {
      dataHora: new Date().toISOString(),
      sala: 'Sala 1',
    };

    const resultado = await executarAcaoPedido(
      () => this.pedidoService.agendarPedido(this.pedido.id, dadosAgendamento),
      (loading) => (this.loading = loading),
      this.toast,
      'Cirurgia agendada!',
      'Erro ao agendar',
    );

    if (resultado.sucesso && resultado.pedido) {
      this.pedido = resultado.pedido;
      this.atualizarFasesPorStatus(this.pedido.status);
      this.faseAvancada.emit(this.pedido);
    }
  }

  editarPedido() {
    this.activeModal.close({ action: 'EDITAR_PEDIDO', pedido: this.pedido });
  }

  fecharModal() {
    this.activeModal.close();
  }

  // ==================== MÉTODOS AUXILIARES ====================

  private atualizarFasesPorStatus(status: string) {
    const mapaStatusParaFase: Record<string, CodigoFase> = {
      RASCUNHO: 'CRIADO',
      PENDENTE: 'CRIADO',
      EM_ANALISE: 'EM_ANALISE',
      REJEITADO: 'RETORNO_PEDIDO',
      APROVADO: 'RETORNO_PEDIDO',
      AGENDADO: 'MARCACAO_CIRURGIA',
      CONFIRMADO: 'MARCACAO_CIRURGIA',
      EM_PROGRESSO: 'POS_OPERATORIO',
      REALIZADO: 'FINALIZADO',
      CANCELADO: 'FINALIZADO',
    };

    const faseCodigo = mapaStatusParaFase[status] || 'CRIADO';

    this.fases.forEach((f) => (f.concluido = false));

    let encontrou = false;
    for (let fase of this.fases) {
      if (fase.codigo === faseCodigo) {
        encontrou = true;
      }
      if (!encontrou) {
        fase.concluido = true;
        if (!fase.data) {
          fase.data = new Date().toISOString();
        }
      }
    }

    this.definirFaseAtual();
  }

  private gerarFasesPadrao(): FasePedido[] {
    return [
      { codigo: 'CRIADO', nome: 'Criado', concluido: false },
      { codigo: 'EM_ANALISE', nome: 'Em Análise', concluido: false },
      { codigo: 'RETORNO_PEDIDO', nome: 'Retorno do Pedido', concluido: false },
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
      { codigo: 'FATURAMENTO', nome: 'Faturamento', concluido: false },
      { codigo: 'POS_OPERATORIO', nome: 'Pós-Operatório', concluido: false },
      { codigo: 'FINALIZADO', nome: 'Finalizado', concluido: false },
    ];
  }
}
