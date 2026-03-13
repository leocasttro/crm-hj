import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSpinner,
  faCheckCircle,
  faInfoCircle,
  faClock,
  faUser,
  faCalendar,
  faCircleArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { ToastService } from '@services/utils';
import { PedidosResumo } from '../../pedidos-resumo/pedidos-resumo';
import { PedidoDto } from '@models/pedido';
import { ChecklistItem } from '@models/checklist';
import { formatarDataPtBr } from '@core/utils';
import { PedidoService, SalvarDadosAutorizacaoRequest } from '@core/services';

@Component({
  selector: 'app-fase-retorno',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, PedidosResumo],
  templateUrl: './fase-retorno.html',
  styleUrl: './fase-retorno.scss',
})
export class FaseRetorno implements OnInit {
  @Input() pedido!: PedidoDto;
  @Input() checklist: ChecklistItem[] = [];
  @Input() podeAvancar: boolean = false;
  @Input() loading: boolean = false;

  @Output() avancar = new EventEmitter<void>();

  // Ícones
  faArrowRightCircle = faCircleArrowRight;
  faSpinner = faSpinner;
  faCheckCircle = faCheckCircle;
  faInfoCircle = faInfoCircle;
  faClock = faClock;
  faUser = faUser;
  faCalendar = faCalendar;

  // Propriedades computadas
  totalDocumentos: number = 0;
  documentosConcluidos: number = 0;
  todosDocumentosOk: boolean = false;

  dadosOriginais: any = {};
  houveAlteracao: boolean = false;

  // Upload de comprovante
  comprovanteSelecionado: File | null = null;
  salvandoComprovante: boolean = false;
  progressoUpload: number = 0;

  avancoEmAndamento: boolean = false;
  salvandoAutorizacao: boolean = false;
  atualizandoStatus: boolean = false;

  salvo: boolean = false;
  // Data mínima para validade (hoje)
  dataMinima: string = new Date().toISOString().split('T')[0];

  constructor(
    private toast: ToastService,
    private pedidoService: PedidoService, // 🔥 INJEÇÃO DO SERVIÇO
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    console.log(
      'FaseRetorno - Checklist recebido:',
      this.checklist?.length || 0,
    );
    this.calcularProgressoDocumentos();
    this.salvarEstadoOriginal();
  }

  /**
   * Calcula o progresso dos documentos do checklist
   */
  private calcularProgressoDocumentos(): void {
    if (!this.checklist || this.checklist.length === 0) {
      this.totalDocumentos = 0;
      this.documentosConcluidos = 0;
      this.todosDocumentosOk = true;
      return;
    }

    this.totalDocumentos = this.checklist.length;
    this.documentosConcluidos = this.checklist.filter(
      (item) => item.status === 'Concluído',
    ).length;

    // Verifica se todos os documentos obrigatórios estão concluídos
    const obrigatorios = this.checklist.filter((item) => item.obrigatorio);
    const obrigatoriosConcluidos = obrigatorios.filter(
      (item) => item.status === 'Concluído',
    );
    this.todosDocumentosOk =
      obrigatorios.length === obrigatoriosConcluidos.length;

    console.log('📊 FaseRetorno - Progresso dos documentos:', {
      total: this.totalDocumentos,
      concluidos: this.documentosConcluidos,
      obrigatoriosOk: this.todosDocumentosOk,
    });
  }

  /**
   * Emite evento para avançar para a próxima fase
   */
  async onAvancar(): Promise<void> {
    // PREVENIR MÚLTIPLAS CHAMADAS
    if (this.avancoEmAndamento) {
      console.log('⏳ Avanço já em andamento, ignorando...');
      return;
    }

    if (!this.podeAvancarParaMarcacao()) {
      this.toast.warning(this.getMensagemImpedimento());
      return;
    }

    this.avancoEmAndamento = true;

    try {
      // ✅ SÓ EMITE O EVENTO - O PAI FAZ O RESTO
      console.log('🚀 Emitindo evento avancar para o pai');
      this.avancar.emit();
    } catch (error) {
      console.error('Erro ao emitir avanço:', error);
    } finally {
      this.avancoEmAndamento = false;
    }
  }

  private salvarEstadoOriginal(): void {
    this.dadosOriginais = {
      numeroGuia: this.pedido.numeroGuia,
      senhaAutorizacao: this.pedido.senhaAutorizacao,
      statusAutorizacao: this.pedido.statusAutorizacao,
      validadeAutorizacao: this.pedido.validadeAutorizacao,
      tipoAcomodacao: this.pedido.tipoAcomodacao,
      formaPagamento: this.pedido.formaPagamento,
    };
  }

  verificarAlteracao(): void {
    this.houveAlteracao =
      this.dadosOriginais.numeroGuia !== this.pedido.numeroGuia ||
      this.dadosOriginais.senhaAutorizacao !== this.pedido.senhaAutorizacao ||
      this.dadosOriginais.statusAutorizacao !== this.pedido.statusAutorizacao ||
      this.dadosOriginais.validadeAutorizacao !==
        this.pedido.validadeAutorizacao ||
      this.dadosOriginais.tipoAcomodacao !== this.pedido.tipoAcomodacao ||
      this.dadosOriginais.formaPagamento !== this.pedido.formaPagamento;
  }

  // ==================== 🔥 NOVO MÉTODO - SALVAR DADOS DE AUTORIZAÇÃO ====================

  async salvarDadosAutorizacao(): Promise<boolean> {
    console.log('💾 salvarDadosAutorizacao iniciado');

    if (!this.houveAlteracao) {
      return true;
    }

    this.salvandoAutorizacao = true;
    this.cdr.detectChanges();

    try {
      const dados: SalvarDadosAutorizacaoRequest = {
        statusAutorizacao: this.pedido.statusAutorizacao || null,
        numeroGuia: this.pedido.numeroGuia,
        senhaAutorizacao: this.pedido.senhaAutorizacao,
        validadeAutorizacao: this.pedido.validadeAutorizacao,
        tipoAcomodacao: this.pedido.tipoAcomodacao,
      };

      const response = await this.pedidoService
        .salvarDadosAutorizacao(this.pedido.id, dados)
        .toPromise();

      if (response?.sucesso) {
        this.toast.success('Dados da autorização salvos com sucesso!');

        if (response.pedido) {
          this.pedido = response.pedido;
        }

        this.salvarEstadoOriginal();
        this.houveAlteracao = false;

        // 🔥 MARCA COMO JÁ SALVO
        this.salvo = true;

        return true;
      } else {
        this.toast.error(response?.mensagem || 'Erro ao salvar dados');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Erro ao salvar dados:', error);
      this.toast.error(
        error.error?.mensagem || 'Erro ao salvar dados da autorização',
      );
      return false;
    } finally {
      this.salvandoAutorizacao = false;
      this.cdr.detectChanges();
    }
  }

  // ==================== 🔥 NOVO MÉTODO - CARREGAR DADOS DE AUTORIZAÇÃO ====================

  async carregarDadosAutorizacao(): Promise<void> {
    // try {
    //   const dados = await this.pedidoService
    //     .buscarDadosAutorizacao(this.pedido.id)
    //     .toPromise();
    //   if (dados) {
    //     this.pedido.statusAutorizacao = dados.statusAutorizacao;
    //     this.pedido.numeroGuia = dados.numeroGuia;
    //     this.pedido.senhaAutorizacao = dados.senhaAutorizacao;
    //     this.pedido.validadeAutorizacao = dados.validadeAutorizacao;
    //     this.pedido.tipoAcomodacao = dados.tipoAcomodacao;
    //     this.salvarEstadoOriginal();
    //     this.verificarAlteracao();
    //   }
    // } catch (error) {
    //   console.error('❌ Erro ao carregar dados de autorização:', error);
    // }
  }

  // ==================== MÉTODOS DE COMPROVANTE ====================

  async removerComprovante(): Promise<void> {
    if (!confirm('Tem certeza que deseja remover o comprovante?')) return;

    try {
      // TODO: Implementar endpoint de remoção de comprovante
      // await this.pedidoService.removerComprovante(this.pedido.id);

      this.pedido.comprovanteUrl = undefined;
      this.pedido.comprovanteNome = undefined;
      this.toast.success('Comprovante removido');
    } catch (error) {
      console.error('Erro ao remover comprovante:', error);
      this.toast.error('Erro ao remover comprovante');
    }
  }

  onComprovanteSelecionado(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Valida o arquivo
    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      this.toast.warning('Arquivo muito grande. Tamanho máximo: 5MB');
      return;
    }

    const tipo = file.type;
    if (!tipo.includes('pdf') && !tipo.includes('image')) {
      this.toast.warning('Formato não permitido. Use PDF ou imagem (JPG/PNG)');
      return;
    }

    this.comprovanteSelecionado = file;
  }

  async salvarComprovante(): Promise<void> {
    if (!this.comprovanteSelecionado) return;

    this.salvandoComprovante = true;
    this.progressoUpload = 0;

    try {
      // Simula progresso
      const interval = setInterval(() => {
        this.progressoUpload += 10;
        if (this.progressoUpload >= 90) {
          clearInterval(interval);
        }
      }, 100);

      // TODO: Implementar endpoint de upload de comprovante
      // const formData = new FormData();
      // formData.append('arquivo', this.comprovanteSelecionado);
      // formData.append('pedidoId', this.pedido.id);
      // formData.append('tipo', 'COMPROVANTE_AUTORIZACAO');
      // const resultado = await this.pedidoService.uploadArquivoChecklist(formData).toPromise();

      // Simula upload
      await new Promise((resolve) => setTimeout(resolve, 1500));

      clearInterval(interval);
      this.progressoUpload = 100;

      // Simula URL do comprovante
      this.pedido.comprovanteUrl = 'url-do-comprovante';
      this.pedido.comprovanteNome = this.comprovanteSelecionado.name;

      this.toast.success('Comprovante enviado com sucesso!');
      this.comprovanteSelecionado = null;

      setTimeout(() => {
        this.progressoUpload = 0;
      }, 1500);
    } catch (error) {
      console.error('Erro ao enviar comprovante:', error);
      this.toast.error('Erro ao enviar comprovante');
      this.progressoUpload = 0;
    } finally {
      this.salvandoComprovante = false;
    }
  }

  // ==================== GETTERS ====================

  get processando(): boolean {
    return this.atualizandoStatus || this.avancoEmAndamento;
  }

  get inputsDesabilitados(): boolean {
    return this.salvo || this.salvandoAutorizacao;
  }

  get botaoAvancarDesabilitado(): boolean {
    return (
      this.processando || // 🔥 Apenas estados internos
      !this.podeAvancar ||
      !this.podeAvancarParaMarcacao()
    );
  }

  get textoBotaoAvancar(): string {
    if (this.salvandoAutorizacao) return 'Salvando dados...';
    if (this.avancoEmAndamento) return 'Avançando...';
    return 'Avançar para Marcação';
  }

  get dataPedidoFormatada(): string {
    if (!this.pedido?.dataPedido) return 'Não informado';
    return formatarDataPtBr(this.pedido.dataPedido);
  }

  get dataAprovacaoFormatada(): string {
    // Usa a data de atualização como referência da aprovação
    if (!this.pedido?.atualizadoEm) return 'Não informado';
    return formatarDataPtBr(this.pedido.atualizadoEm);
  }

  get usuarioAprovacao(): string {
    return this.pedido?.usuarioAtualizacao || this.pedido?.usuarioCriacao || '';
  }

  get progressoPercentual(): number {
    if (this.totalDocumentos === 0) return 100;
    return Math.round((this.documentosConcluidos / this.totalDocumentos) * 100);
  }

  getStatusAutorizacaoClass(): string {
    switch (this.pedido.statusAutorizacao) {
      case 'AUTORIZADO':
        return 'bg-success';
      case 'AUTORIZADO_PARCIAL':
        return 'bg-warning text-dark';
      case 'PENDENTE':
        return 'bg-info';
      case 'NEGADO':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusAutorizacaoIcon(): string {
    switch (this.pedido.statusAutorizacao) {
      case 'AUTORIZADO':
        return 'bi-check-circle-fill';
      case 'AUTORIZADO_PARCIAL':
        return 'bi-exclamation-triangle-fill';
      case 'PENDENTE':
        return 'bi-clock-fill';
      case 'NEGADO':
        return 'bi-x-circle-fill';
      default:
        return 'bi-question-circle-fill';
    }
  }

  getStatusAutorizacaoTexto(): string {
    switch (this.pedido.statusAutorizacao) {
      case 'AUTORIZADO':
        return 'Autorizado';
      case 'AUTORIZADO_PARCIAL':
        return 'Autorizado Parcialmente';
      case 'PENDENTE':
        return 'Pendente';
      case 'NEGADO':
        return 'Negado';
      default:
        return this.pedido.statusAutorizacao || 'Não informado';
    }
  }

  get dataValidadeFormatada(): string {
    if (!this.pedido.validadeAutorizacao) return 'Não informada';
    return formatarDataPtBr(this.pedido.validadeAutorizacao);
  }

  isValidadeProxima(): boolean {
    if (!this.pedido.validadeAutorizacao) return false;

    const hoje = new Date();
    const validade = new Date(this.pedido.validadeAutorizacao);
    const diffTime = validade.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 7 && diffDays > 0;
  }

  getValidadeClass(): string {
    if (!this.pedido.validadeAutorizacao) return '';

    const hoje = new Date();
    const validade = new Date(this.pedido.validadeAutorizacao);

    if (validade < hoje) {
      return 'text-danger';
    }

    if (this.isValidadeProxima()) {
      return 'text-warning';
    }

    return '';
  }

  getTipoAcomodacaoTexto(): string {
    const tipos: Record<string, string> = {
      APARTAMENTO: 'Apartamento',
      QUARTO: 'Quarto',
      ENFERMARIA: 'Enfermaria',
      UTI: 'UTI',
    };

    return (
      tipos[this.pedido.tipoAcomodacao || ''] ||
      this.pedido.tipoAcomodacao ||
      'Não informado'
    );
  }

  isParticular(): boolean {
    return (
      this.pedido.convenio?.toUpperCase() === 'PARTICULAR' ||
      this.pedido.convenioNome?.toUpperCase() === 'PARTICULAR'
    );
  }

  getFormaPagamentoTexto(): string {
    const formas: Record<string, string> = {
      DINHEIRO: 'Dinheiro',
      CARTAO_CREDITO: 'Cartão de Crédito',
      CARTAO_DEBITO: 'Cartão de Débito',
      PIX: 'PIX',
      BOLETO: 'Boleto',
      TRANSFERENCIA: 'Transferência Bancária',
    };

    return (
      formas[this.pedido.formaPagamento || ''] ||
      this.pedido.formaPagamento ||
      'Não informado'
    );
  }

  visualizarComprovante(): void {
    if (this.pedido.comprovanteUrl) {
      window.open(this.pedido.comprovanteUrl, '_blank');
    }
  }

  // ==================== MÉTODOS DE DOCUMENTOS ====================

  /**
   * Retorna a classe CSS para o badge de documentos
   */
  getDocumentosBadgeClass(): string {
    if (this.todosDocumentosOk) {
      return 'bg-success';
    }
    return 'bg-warning';
  }

  /**
   * Retorna o texto para o badge de documentos
   */
  getDocumentosBadgeText(): string {
    return `${this.documentosConcluidos}/${this.totalDocumentos} concluídos`;
  }

  get dadosAutorizacaoPreenchidos(): boolean {
    if (!this.pedido.statusAutorizacao) return false;

    if (this.isAutorizado()) {
      return !!this.pedido.numeroGuia && !!this.pedido.validadeAutorizacao;
    }

    return true; // Para outros status, apenas o status já é suficiente
  }

  /**
   * Verifica se tem comprovante selecionado
   */
  get temComprovanteSelecionado(): boolean {
    return !!this.comprovanteSelecionado;
  }

  /**
   * Verifica se tem comprovante salvo
   */
  get temComprovante(): boolean {
    return !!this.pedido.comprovanteUrl;
  }

  // ==================== MÉTODOS DE PRIORIDADE ====================

  getPrioridadeClass(): string {
    switch (this.pedido.prioridade) {
      case 'URGENCIA':
        return 'bg-danger';
      case 'PRIORIDADE':
        return 'bg-warning text-dark';
      case 'ELETIVA':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  getPrioridadeIcon(): string {
    switch (this.pedido.prioridade) {
      case 'URGENCIA':
        return 'bi-exclamation-triangle-fill';
      case 'PRIORIDADE':
        return 'bi-flag-fill';
      case 'ELETIVA':
        return 'bi-calendar-check';
      default:
        return 'bi-question-circle';
    }
  }

  getPrioridadeTexto(): string {
    switch (this.pedido.prioridade) {
      case 'URGENCIA':
        return 'Urgência';
      case 'PRIORIDADE':
        return 'Prioridade';
      case 'ELETIVA':
        return 'Eletiva';
      default:
        return this.pedido.prioridade || 'Não definida';
    }
  }

  isAutorizado(): boolean {
    return (
      this.pedido.statusAutorizacao === 'AUTORIZADO' ||
      this.pedido.statusAutorizacao === 'AUTORIZADO_PARCIAL'
    );
  }

  /**
   * Callback quando o status muda
   */
  onStatusChange(): void {
    this.verificarAlteracao();

    if (!this.isAutorizado()) {
      this.pedido.numeroGuia = undefined;
      this.pedido.senhaAutorizacao = undefined;
      this.pedido.validadeAutorizacao = undefined;
      this.pedido.tipoAcomodacao = undefined;
      this.pedido.formaPagamento = undefined;
      this.pedido.comprovanteUrl = undefined;
      this.pedido.comprovanteNome = undefined;
      this.comprovanteSelecionado = null;
    }
  }

  /**
   * Verifica se pode avançar para marcação baseado no status
   */
  podeAvancarParaMarcacao(): boolean {
    // Se não tem status selecionado, não pode avançar
    if (!this.pedido.statusAutorizacao) {
      return false;
    }

    // Se é autorizado, precisa ter número da guia e validade
    if (this.isAutorizado()) {
      return (
        this.podeAvancar &&
        !!this.pedido.numeroGuia &&
        !!this.pedido.validadeAutorizacao
      );
    }

    // Para outros status (PENDENTE, NEGADO), só precisa do status
    return this.podeAvancar;
  }

  /**
   * Retorna mensagem explicativa baseada no status
   */
  getMensagemStatusNaoAutorizado(): string {
    switch (this.pedido.statusAutorizacao) {
      case 'PENDENTE':
        return 'A autorização está pendente. Assim que for autorizada, preencha os dados complementares.';
      case 'NEGADO':
        return 'A autorização foi negada. Entre em contato com o convênio para mais informações.';
      case 'AUTORIZADO_PARCIAL':
        return 'Autorização parcial concedida. Preencha os dados abaixo para prosseguir.';
      default:
        return '';
    }
  }

  /**
   * Retorna mensagem de impedimento para avançar
   */
  getMensagemImpedimento(): string {
    if (!this.pedido.statusAutorizacao) {
      return 'Selecione o status da autorização antes de avançar.';
    }

    if (this.isAutorizado()) {
      if (!this.pedido.numeroGuia) {
        return 'Informe o número da guia para prosseguir.';
      }
      if (!this.pedido.validadeAutorizacao) {
        return 'Informe a validade da autorização para prosseguir.';
      }
    }

    if (!this.podeAvancar) {
      return 'Complete todos os documentos obrigatórios no checklist acima antes de avançar.';
    }

    return '';
  }
}
