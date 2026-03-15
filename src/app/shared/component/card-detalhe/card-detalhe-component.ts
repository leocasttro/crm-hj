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
import { PedidoDto, PedidoStatus } from '@models/pedido';
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
import { formatarDataHoraPtBr, formatarDataPtBr } from '@core/utils/date.util';
import { Timeline } from '../timeline/timeline';
import { Checklist } from '../checklist/checklist';
import { FaseCriado } from '../fases/fase-criado/fase-criado';
import { FaseEmAnalise } from '../fases/fase-em-analise/fase-em-analise';
import { FaseRetorno } from '../fases/fase-retorno/fase-retorno';
import { FaseMarcacaoCirurgia } from '../fases/fase-marcacao-cirurgia/fase-marcacao-cirurgia';
import { FaseConsultaPreOperatoria } from '../fases/fase-consulta-pre-operatoria/fase-consulta-pre-operatoria';

@Component({
  selector: 'app-card-detalhe',
  standalone: true,
  imports: [
    CommonModule,
    NgbCollapseModule,
    FontAwesomeModule,
    PedidosResumo,
    FormsModule,
    Timeline,
    Checklist,
    FaseCriado,
    FaseEmAnalise,
    FaseRetorno,
    FaseMarcacaoCirurgia,
    FaseConsultaPreOperatoria,
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
  pedidoStatus!: PedidoStatus;
  loading = false;
  isChecklistCollapsed = true;
  uploadProgress: { [key: number]: number } = {};

  formatarData = formatarDataPtBr;
  formatarDataHora = formatarDataHoraPtBr;

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

  dataConsultaPre: string = '';
  horaConsultaPre: string = '';
  cuidadosConsultaPre: string = '';
  observacoesEspeciaisConsultaPre: string = '';

  dataCirurgia: string = '';
  horaCirurgia: string = '';
  dataMinima: string = new Date().toISOString().split('T')[0]; // Data atual
  dataMaxima: string = new Date(new Date().setMonth(new Date().getMonth() + 6))
    .toISOString()
    .split('T')[0];

  consultaPreData: string = '';
  consultaPreHora: string = '';
  consultaPreLocal: string = '';
  consultaPreMedico: string = '';
  consultaPreCuidados: string = '';
  consultaPreObservacoes: string = '';

  constructor(
    public activeModal: NgbActiveModal,
    private pedidoService: PedidoService,
    private toast: ToastService,
    private cdRef: ChangeDetectorRef, // Usado para detecção de mudanças manual após upload
  ) {}

  ngOnInit(): void {
    this.inicializarComponente();
    if (this.pedidoStatus === this.pedido.status) {
      console.log('Status não mudou, apenas inicializando fases');
    }
    console.log('📦 Dados completos do pedido:', this.pedido);
    this.carregarDadosConsultaPre();
  }

  // Adicione este método no CardDetalheComponent
  onArquivoSalvo(event: { item: ChecklistItem; arquivo: any }) {
    // Atualiza o item no checklist
    const index = this.checklist.findIndex((i) => i.id === event.item.id);
    if (index !== -1) {
      this.checklist[index] = event.item;
    }

    // Dispara o evento de atualização
    this.checklistAtualizado.emit(this.checklist);

    // Se precisar, chama o método para consultar arquivos novamente
    setTimeout(() => {
      this.consultarArquivosExistentes();
    }, 100);
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
    this.cdRef.detectChanges(); // ✅ Força detecção imediata

    const resultado = await processarUploadArquivo(
      item.arquivoSelecionado,
      this.pedido.id,
      item.id,
      item.observacao,
      this.pedidoService,
      (progress) => {
        this.uploadProgress[item.id] = progress;
        this.cdRef.detectChanges(); // ✅ Força detecção a cada progresso
      },
    );

    if (resultado.sucesso && resultado.arquivo) {
      const itemAtualizado = atualizarArquivoSalvo(item, resultado.arquivo);
      Object.assign(item, itemAtualizado);

      this.uploadProgress[item.id] = 100;
      this.cdRef.detectChanges(); // ✅ Força detecção com 100%

      setTimeout(() => {
        delete this.uploadProgress[item.id];
        this.cdRef.detectChanges();
      }, 1500);

      this.toast.success('Arquivo salvo com sucesso!');
      this.checklistAtualizado.emit(this.checklist);

      // 🔥 Usa setTimeout para recarregar no próximo ciclo
      setTimeout(() => {
        this.consultarArquivosExistentes();
      }, 0);
    } else {
      item.salvando = false;
      this.uploadProgress[item.id] = 0;
      this.cdRef.detectChanges();
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

      this.idsArquivosExistentes = arquivos
        .map((a) => a?.checklistItemId)
        .filter((id) => id !== undefined);

      setTimeout(() => {
        this.atualizarChecklistComArquivos(arquivos);
      }, 0);
    } catch (error) {
      console.error('Erro ao consultar:', error);
      this.idsArquivosExistentes = [];
    }
  }

  async avancarRetornoPedido() {
    const validacao = validarAntesAcao(
      this.checklist,
      this.faseAtual,
      'avancar_retorno',
    );

    if (!validacao.valido) {
      this.toast.warning(validacao.mensagem!);
      return;
    }

    const resultado = await executarAcaoPedido(
      () =>
        this.pedidoService.atualizarStatus(
          this.pedido.id,
          'AGENDAR', // Status que avança para marcação da cirurgia
          'Avançado do retorno do pedido',
        ),
      (loading) => {
        this.loading = loading;
        this.cdRef.detectChanges();
      },
      this.toast,
      'Pedido avançado para marcação da cirurgia!',
      'Erro ao avançar pedido',
    );

    if (resultado.sucesso && resultado.pedido) {
      this.pedido = resultado.pedido;
      this.atualizarFasesPorStatus(this.pedido.status);
      this.faseAvancada.emit(this.pedido);

      this.loading = false;
      this.cdRef.detectChanges();

      setTimeout(() => {
        this.activeModal.close({
          sucesso: true,
          mensagem: 'Pedido avançado com sucesso',
          pedido: this.pedido,
        });
      }, 100);
    }
  }

  private atualizarChecklistComArquivos(arquivos: any[]) {
    if (!this.checklist || !this.pedido?.id) return;

    let atualizacoes = 0;

    const checklistAtualizado = this.checklist.map((item) => {
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
          status: 'Concluído' as const, // 🔥 Usa 'as const' para garantir o tipo literal
          dataConclusao: new Date().toISOString(),
        };
      }
      return item;
    });

    this.checklist = checklistAtualizado as ChecklistItem[]; // 🔥 Type assertion
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
      (loading) => {
        this.loading = loading;
        this.cdRef.detectChanges(); // ✅ Força detecção
      },
      this.toast,
      'Pedido enviado para análise!',
      'Erro ao enviar para análise',
    );

    if (resultado.sucesso && resultado.pedido) {
      this.pedido = resultado.pedido;
      this.atualizarFasesPorStatus(this.pedido.status);
      this.faseAvancada.emit(this.pedido);

      this.loading = false;
      this.cdRef.detectChanges(); // ✅ Força última detecção

      setTimeout(() => {
        // ✅ Fecha no próximo ciclo
        this.activeModal.close({
          sucesso: true,
          mensagem: 'Pedido enviado para análise com sucesso',
          pedido: this.pedido,
        });
      }, 100);
    }
  }

  async aprovarPedido() {
    const resultado = await executarAcaoPedido(
      () =>
        this.pedidoService.atualizarStatus(
          this.pedido.id,
          'APROVADO',
          'Aprovado na análise',
        ), // ← Status: APROVADO, Observação: Aprovado na análise
      (loading) => {
        this.loading = loading;
        this.cdRef.detectChanges();
      },
      this.toast,
      'Pedido aprovado!',
      'Erro ao aprovar pedido',
    );

    if (resultado.sucesso && resultado.pedido) {
      this.pedido = resultado.pedido;
      this.atualizarFasesPorStatus(this.pedido.status);
      this.faseAvancada.emit(this.pedido);

      this.loading = false;
      this.cdRef.detectChanges();

      setTimeout(() => {
        this.activeModal.close({
          sucesso: true,
          mensagem: 'Pedido aprovado com sucesso',
          pedido: this.pedido,
        });
      }, 100);
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
      APROVADO: 'RETORNO_PEDIDO',
      REJEITADO: 'EM_ANALISE',
      AGUARDANDO_APROVACAO_AGENDAMENTO: 'MARCACAO_CIRURGIA',
      AGENDAR: 'MARCACAO_CIRURGIA',
      AGENDADO: 'CONSULTA_PRE_OPERATORIA', // ✅ ✅ NOVO: Agendado vai para Consulta Pré
      CONFIRMADO: 'CONSULTA_PRE_OPERATORIA', // ✅ Confirmado também na Consulta Pré
      EM_PROGRESSO: 'POS_OPERATORIO',
      REALIZADO: 'FINALIZADO',
      CANCELADO: 'FINALIZADO',
    };

    const faseCodigo = mapaStatusParaFase[status] || 'CRIADO';

    console.log(
      `🔄 Atualizando fases - Status: ${status} -> Fase: ${faseCodigo}`,
    );

    // Reseta todas as fases
    this.fases.forEach((f) => (f.concluido = false));

    let encontrou = false;
    for (let fase of this.fases) {
      if (fase.codigo === faseCodigo) {
        encontrou = true;
        // FASE ATUAL - não marca como concluída
        if (!fase.data) {
          fase.data = this.pedido.atualizadoEm || new Date().toISOString();
        }
        console.log(`📍 Fase atual: ${fase.nome} (${fase.codigo})`);
      }

      if (!encontrou) {
        // FASES ANTERIORES - marcar como concluídas
        fase.concluido = true;
        if (!fase.data) {
          fase.data = this.pedido.criadoEm;
        }
      }
    }

    this.definirFaseAtual();
  }

  private gerarFasesPadrao(): FasePedido[] {
    return [
      { codigo: 'CRIADO', nome: 'Criado', concluido: false },
      { codigo: 'EM_ANALISE', nome: 'Em Análise', concluido: false }, // 🔥 Única fase para EM_ANALISE e APROVADO
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

  get dataInvalida(): boolean {
    if (!this.dataCirurgia) return false;
    return new Date(this.dataCirurgia) < new Date(this.dataMinima);
  }

  // Método para verificar se pode agendar
  podeAgendar(): boolean {
    return (
      !!this.dataCirurgia &&
      !this.dataInvalida &&
      this.podeAvancarFase() &&
      !this.loading
    );
  }

  async agendarCirurgia(dados: any) {
    this.loading = true;

    try {
      // Monta data e hora completa se existir
      let dataHoraFormatada = null;
      if (dados.dataAgendamento) {
        dataHoraFormatada = dados.dataAgendamento;
      } else if (dados.dataCirurgia) {
        if (dados.horario) {
          dataHoraFormatada = `${dados.dataCirurgia}T${dados.horario}:00`;
        } else {
          dataHoraFormatada = `${dados.dataCirurgia}T00:00:00`;
        }
      }

      const dadosAgendamento = {
        dataAgendamento: dataHoraFormatada,
        hospital: dados.hospital,
        fornecedor: dados.fornecedor,
        local: dados.local,
        riscoCirurgico: dados.riscoCirurgico,
        observacao: 'Agendamento realizado via sistema',
      };

      const resultado = await executarAcaoPedido(
        () =>
          this.pedidoService.agendarPedido(this.pedido.id, dadosAgendamento),
        (loading) => {
          this.loading = loading;
          this.cdRef.detectChanges();
        },
        this.toast,
        'Cirurgia agendada com sucesso!',
        'Erro ao agendar cirurgia',
      );

      if (resultado.sucesso && resultado.pedido) {
        this.pedido = resultado.pedido;
        this.atualizarFasesPorStatus(this.pedido.status);
        this.faseAvancada.emit(this.pedido);

        setTimeout(() => {
          this.activeModal.close({
            sucesso: true,
            mensagem: 'Cirurgia agendada com sucesso',
            pedido: this.pedido,
          });
        }, 100);
      }
    } catch (error) {
      console.error('Erro ao agendar cirurgia:', error);
      this.toast.error('Erro ao agendar cirurgia');
    } finally {
      this.loading = false;
    }
  }

  async salvarRascunhoCirurgia(dados: any) {
    this.loading = true;

    try {
      // Prepara os dados para salvar
      const dadosParaSalvar = {
        hospital: dados.hospital,
        fornecedor: dados.fornecedor,
        dataCirurgia: dados.dataCirurgia,
        horario: dados.horario,
        local: dados.local,
        riscoCirurgico: dados.riscoCirurgico,
      };

      // TODO: Chamar o serviço para salvar o rascunho
      // await this.pedidoService.salvarRascunhoCirurgia(this.pedido.id, dadosParaSalvar);

      // Simula salvamento
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Atualiza o pedido com os dados salvos
      this.pedido = {
        ...this.pedido,
        ...dadosParaSalvar,
      };

      this.toast.success('Rascunho salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
      this.toast.error('Erro ao salvar rascunho');
    } finally {
      this.loading = false;
    }
  }

  getChecklistConsultaPre(): ChecklistItem[] {
    // Filtra apenas os itens relacionados à consulta pré
    // Ou retorna um checklist específico
    return this.checklist.filter(
      (item) =>
        item.categoria === 'CONSULTA_PRE' ||
        item.titulo.includes('Consulta') ||
        item.titulo.includes('Pré'),
    );
  }

  /**
   * Retorna a quantidade de itens pendentes na consulta pré
   */
  getItensPendentesConsultaPre(): number {
    return this.getChecklistConsultaPre().filter(
      (item) => item.status === 'Pendente' && item.obrigatorio,
    ).length;
  }

  async onAprovarAgendamento() {
    const resultado = await executarAcaoPedido(
      () => this.pedidoService.aprovarAgendamento(this.pedido.id),
      (loading) => {
        this.loading = loading;
        this.cdRef.detectChanges();
      },
      this.toast,
      'Agendamento aprovado com sucesso!',
      'Erro ao aprovar agendamento',
    );

    if (resultado.sucesso && resultado.pedido) {
      this.pedido = resultado.pedido;
      this.atualizarFasesPorStatus(this.pedido.status);
      this.faseAvancada.emit(this.pedido);

      setTimeout(() => {
        this.activeModal.close({
          sucesso: true,
          mensagem: 'Agendamento aprovado',
          pedido: this.pedido,
        });
      }, 100);
    }
  }

  async onRejeitarAgendamento(motivo: string) {
    const resultado = await executarAcaoPedido(
      () => this.pedidoService.rejeitarAgendamento(this.pedido.id, motivo),
      (loading) => {
        this.loading = loading;
        this.cdRef.detectChanges();
      },
      this.toast,
      'Agendamento rejeitado.',
      'Erro ao rejeitar agendamento',
    );

    if (resultado.sucesso && resultado.pedido) {
      this.pedido = resultado.pedido;
      this.atualizarFasesPorStatus(this.pedido.status);
      this.faseAvancada.emit(this.pedido);
      this.cdRef.detectChanges();
    }
  }

  /**
   * Confirmar consulta pré-operatória
   */
  async confirmarConsulta() {
    const resultado = await executarAcaoPedido(
      () =>
        this.pedidoService.atualizarStatus(
          this.pedido.id,
          'CONFIRMADO',
          'Consulta pré-operatória confirmada',
        ),
      (loading) => {
        this.loading = loading;
        this.cdRef.detectChanges();
      },
      this.toast,
      'Consulta confirmada com sucesso!',
      'Erro ao confirmar consulta',
    );

    if (resultado.sucesso && resultado.pedido) {
      this.pedido = resultado.pedido;
      this.atualizarFasesPorStatus(this.pedido.status);
      this.faseAvancada.emit(this.pedido);
    }
  }

  /**
   * Iniciar procedimento cirúrgico
   */
  async iniciarProcedimento() {
    const validacao = validarAntesAcao(
      this.checklist,
      this.faseAtual,
      'iniciar_procedimento',
    );

    if (!validacao.valido) {
      this.toast.warning(validacao.mensagem!);
      return;
    }

    const resultado = await executarAcaoPedido(
      () =>
        this.pedidoService.atualizarStatus(
          this.pedido.id,
          'EM_PROGRESSO',
          'Procedimento cirúrgico iniciado',
        ),
      (loading) => {
        this.loading = loading;
        this.cdRef.detectChanges();
      },
      this.toast,
      'Procedimento iniciado com sucesso!',
      'Erro ao iniciar procedimento',
    );

    if (resultado.sucesso && resultado.pedido) {
      this.pedido = resultado.pedido;
      this.atualizarFasesPorStatus(this.pedido.status);
      this.faseAvancada.emit(this.pedido);

      setTimeout(() => {
        this.activeModal.close({
          sucesso: true,
          mensagem: 'Procedimento iniciado',
          pedido: this.pedido,
        });
      }, 100);
    }
  }

  /**
   * Reagendar cirurgia (voltar para marcação)
   */
  async reagendarCirurgia() {
    if (!confirm('Deseja realmente reagendar a cirurgia?')) return;

    const resultado = await executarAcaoPedido(
      () =>
        this.pedidoService.atualizarStatus(
          this.pedido.id,
          'AGENDAR',
          'Reagendamento solicitado',
        ),
      (loading) => {
        this.loading = loading;
        this.cdRef.detectChanges();
      },
      this.toast,
      'Pedido reaberto para reagendamento',
      'Erro ao reagendar',
    );

    if (resultado.sucesso && resultado.pedido) {
      this.pedido = resultado.pedido;
      this.atualizarFasesPorStatus(this.pedido.status);
      this.faseAvancada.emit(this.pedido);
    }
  }

  get dataConsultaInvalida(): boolean {
    if (!this.dataConsultaPre) return false;
    return new Date(this.dataConsultaPre) < new Date(this.dataMinima);
  }

  // Verifica se pode agendar a consulta pré
  podeAgendarConsultaPre(): boolean {
    return (
      !!this.dataConsultaPre &&
      !this.dataConsultaInvalida &&
      this.podeAvancarFase() &&
      !this.loading
    );
  }

  async confirmarAgendamentoConsulta(dados: any) {
    // Este método pode ser igual ao agendarConsultaPre ou ter lógica diferente
    await this.agendarConsultaPre(dados);
  }

  // Agendar consulta pré-operatória
  async agendarConsultaPre(dados: any) {
    this.loading = true;

    try {
      // Monta data e hora completa
      let dataHoraFormatada = dados.dataConsulta;
      if (dados.horaConsulta) {
        dataHoraFormatada = `${dados.dataConsulta}T${dados.horaConsulta}:00`;
      } else {
        dataHoraFormatada = `${dados.dataConsulta}T00:00:00`;
      }

      const dadosConsulta = {
        dataHora: dataHoraFormatada,
        local: dados.localConsulta,
        medico: dados.medicoResponsavel,
        cuidados: dados.cuidados,
        observacoesEspeciais: dados.observacoesEspeciais,
      };

      // TODO: Chamar o serviço quando estiver implementado
      // const resultado = await this.pedidoService.agendarConsultaPre(this.pedido.id, dadosConsulta);

      // Simula agendamento
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Atualiza o pedido com os dados da consulta
      this.pedido.consultaPreDataHora = dataHoraFormatada;
      this.pedido.consultaPreLocal = dados.localConsulta;
      this.pedido.consultaPreMedico = dados.medicoResponsavel;
      this.pedido.consultaPreCuidados = dados.cuidados;
      this.pedido.consultaPreObservacoesEspeciais = dados.observacoesEspeciais;
      this.pedido.temConsultaPreAgendada = true;

      this.toast.success('Consulta agendada com sucesso!');

      // Atualiza as variáveis locais
      this.consultaPreData = dados.dataConsulta;
      this.consultaPreHora = dados.horaConsulta || '';
      this.consultaPreLocal = dados.localConsulta || '';
      this.consultaPreMedico = dados.medicoResponsavel || '';
      this.consultaPreCuidados = dados.cuidados || '';
      this.consultaPreObservacoes = dados.observacoesEspeciais || '';
    } catch (error) {
      console.error('Erro ao agendar consulta:', error);
      this.toast.error('Erro ao agendar consulta');
    } finally {
      this.loading = false;
    }
  }

  carregarDadosConsultaPre(): void {
    // Verifica se existe data de consulta pré
    if (this.pedido.consultaPreDataHora) {
      // Converte a data para o formato do input date (YYYY-MM-DD)
      const data = new Date(this.pedido.consultaPreDataHora);
      this.dataConsultaPre = data.toISOString().split('T')[0];

      // Extrai a hora no formato HH:mm (se existir)
      const hora = data.getHours().toString().padStart(2, '0');
      const minutos = data.getMinutes().toString().padStart(2, '0');

      // Só seta a hora se não for meia-noite (00:00)
      if (hora !== '00' || minutos !== '00') {
        this.horaConsultaPre = `${hora}:${minutos}`;
      }

      // 🔥 Carrega os campos de texto do banco
      this.cuidadosConsultaPre = this.pedido.consultaPreCuidados || '';
      this.observacoesEspeciaisConsultaPre =
        this.pedido.consultaPreObservacoesEspeciais || '';

      console.log('📋 Dados da consulta pré carregados:', {
        data: this.dataConsultaPre,
        hora: this.horaConsultaPre,
        cuidados: this.cuidadosConsultaPre,
        observacoes: this.observacoesEspeciaisConsultaPre,
      });
    }
  }

  // Reagendar consulta
  async reagendarConsultaPre() {
    if (!confirm('Deseja realmente reagendar a consulta?')) return;

    this.dataConsultaPre = '';
    this.horaConsultaPre = '';
    this.toast.info('Selecione uma nova data para a consulta');
  }
}
