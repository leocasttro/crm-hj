import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import {
  atualizarArquivoSalvo,
  ChecklistItem,
  formatarTamanhoArquivo,
  limparArquivoSelecionado,
  processarUploadArquivo,
  selecionarArquivoLocal,
  TAMANHO_MAXIMO_ARQUIVO,
  validarArquivo,
} from '@core/models';
import { PedidoService, ToastService } from '@core/services';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowDown,
  faCheck,
  faCloudDownload,
  faCloudUpload,
  faExclamationTriangle,
  faFile,
  faFileImage,
  faFilePdf,
  faFileWord,
  faMinus,
  faSpinner,
  faTrash,
  faXmarkCircle,
} from '@fortawesome/free-solid-svg-icons';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-checklist',
  imports: [CommonModule, FontAwesomeModule, NgbCollapse],
  templateUrl: './checklist.html',
  styleUrl: './checklist.scss',
})
export class Checklist {
  @Input() checklist: ChecklistItem[] = [];
  @Input() titulo: string = 'Documentos Obrigatórios';
  @Input() mostrarProgresso: boolean = true;
  @Input() podeEditar: boolean = true;
  @Input() pedidoId!: string; // Recebe como number do componente pai
  @Input() uploadProgress: { [key: number]: number } = {};

  @Output() itemToggle = new EventEmitter<ChecklistItem>();
  @Output() checklistAtualizado = new EventEmitter<ChecklistItem[]>();
  @Output() arquivoSalvo = new EventEmitter<{item: ChecklistItem, arquivo: any}>();

  isCollapsed = false;
  salvando: { [key: number]: boolean } = {};

  // Ícones
  faArrowDown = faArrowDown;
  faMinus = faMinus;
  faCheck = faCheck;
  faCloudUpload = faCloudUpload;
  faCloudDownload = faCloudDownload;
  faTrash = faTrash;
  faXmarkCircle = faXmarkCircle;
  faExclamationTriangle = faExclamationTriangle;
  faSpinner = faSpinner;

  constructor(
    private pedidoService: PedidoService,
    private toast: ToastService,
    private cdRef: ChangeDetectorRef
  ) {}

  // Getter para converter pedidoId para string quando necessário
  get pedidoIdString(): string {
    return this.pedidoId?.toString() || '';
  }

  // Mapeamento de ícones por tipo de arquivo
  getFileIcon(fileName: string): any {
    if (!fileName) return faFile;

    const ext = fileName.split('.').pop()?.toLowerCase();
    switch(ext) {
      case 'pdf': return faFilePdf;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return faFileImage;
      case 'doc':
      case 'docx': return faFileWord;
      default: return faFile;
    }
  }

  // Contagem de itens pendentes
  getItensPendentesCount(): number {
    return this.checklist.filter(item => item.status === 'Pendente').length;
  }

  // Progresso do checklist
  getProgressoChecklist(): number {
    const total = this.checklist.length;
    const concluidos = this.checklist.filter(item => item.status === 'Concluído').length;
    return total > 0 ? Math.round((concluidos / total) * 100) : 0;
  }

  // Verifica se todos os itens obrigatórios estão concluídos
  todosObrigatoriosConcluidos(): boolean {
    const obrigatorios = this.checklist.filter(item => item.obrigatorio);
    const obrigatoriosConcluidos = obrigatorios.filter(item => item.status === 'Concluído');
    return obrigatorios.length === obrigatoriosConcluidos.length;
  }

  // Toggle do checklist item
  onToggleItem(item: ChecklistItem) {
    if (item.status === 'Concluído') return;
    this.itemToggle.emit(item);
  }

  // Selecionar arquivo
  onFileSelected(item: ChecklistItem, event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const validacao = validarArquivo(file);
    if (!validacao.valido) {
      this.toast.error(validacao.mensagem!);
      return;
    }

    const itemAtualizado = selecionarArquivoLocal(item, file);
    Object.assign(item, itemAtualizado);

    this.toast.info(`Arquivo "${file.name}" selecionado. Clique em SALVAR.`);

    // Limpa o input para permitir selecionar o mesmo arquivo novamente
    event.target.value = '';
  }

  // Salvar arquivo
  async onSalvarArquivo(item: ChecklistItem) {
    if (!item.arquivoSelecionado || !this.pedidoId) return;

    this.salvando[item.id] = true;
    item.salvando = true;

    if (!this.uploadProgress[item.id]) {
      this.uploadProgress[item.id] = 0;
    }

    this.cdRef.detectChanges();

    // 🔥 CONVERTE number para string na chamada
    const resultado = await processarUploadArquivo(
      item.arquivoSelecionado,
      this.pedidoIdString, // Usa o getter que converte para string
      item.id,
      item.observacao,
      this.pedidoService,
      (progress) => {
        this.uploadProgress[item.id] = progress;
        this.cdRef.detectChanges();
      },
    );

    if (resultado.sucesso && resultado.arquivo) {
      const itemAtualizado = atualizarArquivoSalvo(item, resultado.arquivo);
      Object.assign(item, itemAtualizado);

      this.uploadProgress[item.id] = 100;
      this.cdRef.detectChanges();

      setTimeout(() => {
        delete this.uploadProgress[item.id];
        delete this.salvando[item.id];
        item.salvando = false;
        this.cdRef.detectChanges();
      }, 1500);

      this.toast.success('Arquivo salvo com sucesso!');
      this.checklistAtualizado.emit(this.checklist);
      this.arquivoSalvo.emit({ item, arquivo: resultado.arquivo });
    } else {
      item.salvando = false;
      delete this.salvando[item.id];
      this.uploadProgress[item.id] = 0;
      this.cdRef.detectChanges();
      this.toast.error(resultado.mensagem || 'Erro ao salvar arquivo');
    }
  }

  // Cancelar seleção
  onCancelarSelecao(item: ChecklistItem) {
    const itemAtualizado = limparArquivoSelecionado(item);
    Object.assign(item, itemAtualizado);
    this.toast.info('Seleção cancelada');
  }

  // Remover arquivo
  async onRemoverArquivo(item: ChecklistItem, event: Event) {
    // event.stopPropagation();

    // if (!this.pedidoId) return;
    // if (!confirm('Tem certeza que deseja remover este arquivo?')) return;

    // // 🔥 CONVERTE number para string na chamada
    // const resultado = await removerArquivoHelper(
    //   item,
    //   this.pedidoIdString, // Usa o getter que converte para string
    //   this.pedidoService,
    // );

    // if (resultado.sucesso) {
    //   item.arquivo = undefined;
    //   if (item.status === 'Concluído' && item.obrigatorio) {
    //     item.status = 'Pendente';
    //     item.dataConclusao = undefined;
    //   }
    //   this.toast.success('Arquivo removido');
    //   this.checklistAtualizado.emit(this.checklist);
    // } else {
    //   this.toast.error(resultado.mensagem || 'Erro ao remover arquivo');
    // }
  }

  // Download arquivo
  onDownload(item: ChecklistItem) {
    if (item.arquivo?.url) {
      window.open(item.arquivo.url, '_blank');
    }
  }

  // TrackBy para performance
  trackById(index: number, item: ChecklistItem): number {
    return item.id;
  }

  // Helper seguro para título
  getTitulo(item: ChecklistItem): string {
    return item.titulo || 'Documento sem título';
  }

  // Helper seguro para nome do arquivo
  getNomeArquivo(item: ChecklistItem): string {
    return item.arquivo?.nome || 'Arquivo sem nome';
  }

  // Verifica se pode fazer upload
  podeUpload(item: ChecklistItem): boolean {
    return this.podeEditar && !item.salvando && !item.arquivo?.url && !!this.pedidoId;
  }

  // Verifica se pode salvar
  podeSalvar(item: ChecklistItem): boolean {
    return !!(item.arquivoSelecionado && !item.arquivo?.url && !item.salvando && this.podeEditar);
  }

  // Verifica se pode cancelar
  podeCancelar(item: ChecklistItem): boolean {
    return !!(item.arquivoSelecionado && !item.arquivo?.url && !item.salvando && this.podeEditar);
  }

  // Verifica se pode remover
  podeRemover(item: ChecklistItem): boolean {
    return !!(item.arquivo?.url && this.podeEditar);
  }

  // Verifica se pode fazer download
  podeDownload(item: ChecklistItem): boolean {
    return !!item.arquivo?.url;
  }

  // Mostrar progresso do upload
  mostrarProgressoUpload(item: ChecklistItem): boolean {
    return this.uploadProgress[item.id] !== undefined &&
           this.uploadProgress[item.id] < 100;
  }

  // Verifica se está salvando
  isSaving(item: ChecklistItem): boolean {
    return this.salvando[item.id] === true || item.salvando === true;
  }

  // Formatar tamanho do arquivo (exposto para o template)
  formatarTamanho = formatarTamanhoArquivo;
  TAMANHO_MAXIMO = TAMANHO_MAXIMO_ARQUIVO;
}
