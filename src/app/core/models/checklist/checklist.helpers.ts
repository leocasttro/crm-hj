import {
  ChecklistItem,
  ChecklistProgresso,
  ChecklistGroup,
  ChecklistCategoria,
  ChecklistItemStatus,
  ChecklistValidation,
} from './checklist.types';
import { ChecklistItemDto, ChecklistItemRequest } from './checklist.dto';

// ==================== MAPEAMENTO ====================

// Mapear DTO para modelo da aplicação
export function mapDtoToChecklistItem(dto: ChecklistItemDto): ChecklistItem {
  return {
    id: dto.id,
    titulo: dto.titulo,
    status: dto.status,
    obrigatorio: dto.obrigatorio ?? true,
    categoria: dto.categoria,
    prioridade: dto.prioridade,
    ordem: dto.ordem,
    observacao: dto.observacao,
    dataConclusao: dto.dataConclusao,
    arquivo: dto.arquivoId ? {
      id: dto.arquivoId,
      nome: dto.arquivoNome || '',
      url: dto.arquivoUrl || '',
      tamanho: dto.arquivoTamanho,
      tipo: dto.arquivoTipo,
      dataUpload: dto.dataConclusao
    } : undefined,
    // Estado local (inicial)
    observacaoEditada: false,
    salvando: false,
    expandido: false
  };
}

// Mapear modelo para requisição
export function mapItemToRequest(item: ChecklistItem): ChecklistItemRequest {
  return {
    titulo: item.titulo,
    obrigatorio: item.obrigatorio,
    categoria: item.categoria,
    prioridade: item.prioridade,
    ordem: item.ordem,
    observacao: item.observacao
  };
}

// ==================== CÁLCULOS DE PROGRESSO ====================

export function calcularProgresso(itens: ChecklistItem[]): ChecklistProgresso {
  const total = itens.length;
  const concluidos = itens.filter(i => i.status === 'Concluído').length;
  const obrigatorios = itens.filter(i => i.obrigatorio);
  const obrigatoriosConcluidos = obrigatorios.filter(i => i.status === 'Concluído').length;

  return {
    total,
    concluidos,
    obrigatorios: {
      total: obrigatorios.length,
      concluidos: obrigatoriosConcluidos
    },
    percentual: total > 0 ? Math.round((concluidos / total) * 100) : 100
  };
}

export function getItensPendentes(itens: ChecklistItem[]): ChecklistItem[] {
  return itens.filter(i => i.status === 'Pendente' && i.obrigatorio);
}

export function validarChecklist(itens: ChecklistItem[]): ChecklistValidation {
  const itensPendentes = getItensPendentes(itens);
  return {
    isValid: itensPendentes.length === 0,
    itensPendentes,
    mensagem: itensPendentes.length > 0
      ? `Complete ${itensPendentes.length} ${itensPendentes.length === 1 ? 'item obrigatório' : 'itens obrigatórios'}`
      : undefined
  };
}

// ==================== AGRUPAMENTO ====================

export function agruparPorCategoria(itens: ChecklistItem[]): ChecklistGroup[] {
  const grupos: Record<ChecklistCategoria, ChecklistItem[]> = {
    DOCUMENTOS_PACIENTE: [],
    EXAMES: [],
    AUTORIZACOES: [],
    TERMOS: [],
    OUTROS: []
  };

  itens.forEach(item => {
    const categoria = item.categoria || 'OUTROS';
    grupos[categoria].push(item);
  });

  const titulos: Record<ChecklistCategoria, string> = {
    DOCUMENTOS_PACIENTE: 'Documentos do Paciente',
    EXAMES: 'Exames',
    AUTORIZACOES: 'Autorizações',
    TERMOS: 'Termos e Consentimentos',
    OUTROS: 'Outros Documentos'
  };

  return Object.entries(grupos)
    .filter(([_, itens]) => itens.length > 0)
    .map(([categoria, itens]) => ({
      categoria: categoria as ChecklistCategoria,
      titulo: titulos[categoria as ChecklistCategoria],
      itens,
      expanded: true
    }));
}

// ==================== ORDENAÇÃO ====================

export function ordenarItens(itens: ChecklistItem[]): ChecklistItem[] {
  return [...itens].sort((a, b) => {
    // Primeiro por ordem numérica
    if (a.ordem !== undefined && b.ordem !== undefined) {
      return a.ordem - b.ordem;
    }
    // Depois por prioridade
    const prioridadePeso = { 'ALTA': 0, 'MEDIA': 1, 'BAIXA': 2 };
    const pesoA = a.prioridade ? prioridadePeso[a.prioridade] : 3;
    const pesoB = b.prioridade ? prioridadePeso[b.prioridade] : 3;
    if (pesoA !== pesoB) return pesoA - pesoB;
    // Por fim, por título
    return a.titulo.localeCompare(b.titulo);
  });
}

// ==================== UTILITÁRIOS DE UI ====================

export function getStatusBadgeClass(status: ChecklistItemStatus): string {
  return status === 'Concluído' ? 'bg-success' : 'bg-warning';
}

export function getStatusIcon(status: ChecklistItemStatus): string {
  return status === 'Concluído' ? 'bi-check-circle' : 'bi-hourglass';
}

export function getCategoriaIcon(categoria?: ChecklistCategoria): string {
  const icons: Record<ChecklistCategoria, string> = {
    DOCUMENTOS_PACIENTE: 'bi-person-badge',
    EXAMES: 'bi-file-medical',
    AUTORIZACOES: 'bi-file-check',
    TERMOS: 'bi-file-text',
    OUTROS: 'bi-files'
  };
  return icons[categoria || 'OUTROS'];
}

export function getCategoriaColor(categoria?: ChecklistCategoria): string {
  const colors: Record<ChecklistCategoria, string> = {
    DOCUMENTOS_PACIENTE: '#0d6efd',
    EXAMES: '#198754',
    AUTORIZACOES: '#ffc107',
    TERMOS: '#6f42c1',
    OUTROS: '#6c757d'
  };
  return colors[categoria || 'OUTROS'];
}

// ==================== TEMPLATES PRÉ-DEFINIDOS ====================

export function getChecklistPadrao(): ChecklistItem[] {
  return [
    {
      id: 1,
      titulo: 'Documentos do paciente (RG, CPF)',
      status: 'Pendente',
      obrigatorio: true,
      categoria: 'DOCUMENTOS_PACIENTE',
      prioridade: 'ALTA',
      ordem: 1
    },
    {
      id: 2,
      titulo: 'Exames pré-operatórios',
      status: 'Pendente',
      obrigatorio: true,
      categoria: 'EXAMES',
      prioridade: 'ALTA',
      ordem: 2
    },
    {
      id: 3,
      titulo: 'Pedido médico',
      status: 'Pendente',
      obrigatorio: true,
      categoria: 'DOCUMENTOS_PACIENTE',
      prioridade: 'ALTA',
      ordem: 3
    },
    {
      id: 4,
      titulo: 'Termo de consentimento',
      status: 'Pendente',
      obrigatorio: true,
      categoria: 'TERMOS',
      prioridade: 'MEDIA',
      ordem: 4
    }
  ];
}

export function simularProgresso(
  currentProgress: number,
  setProgress: (value: number) => void,
  interval: ReturnType<typeof setInterval>
): void {
  if (currentProgress < 90) {
    setProgress(currentProgress + 10);
  } else {
    clearInterval(interval);
  }
}

export function formatarTamanhoArquivo(bytes?: number): string {
  if (!bytes) return '0 KB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export const TIPOS_ARQUIVO_PERMITIDOS = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
] as const;

export const EXTENSOES_PERMITIDAS = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];

export const TAMANHO_MAXIMO_ARQUIVO = 10 * 1024 * 1024; // 10MB

export function validarArquivo(file: File): { valido: boolean; mensagem?: string } {
  if (file.size > TAMANHO_MAXIMO_ARQUIVO) {
    return {
      valido: false,
      mensagem: `Arquivo muito grande. Máximo: ${formatarTamanhoArquivo(TAMANHO_MAXIMO_ARQUIVO)}`
    };
  }

  if (!TIPOS_ARQUIVO_PERMITIDOS.includes(file.type as any) &&
      !EXTENSOES_PERMITIDAS.some(ext => file.name.toLowerCase().endsWith(ext))) {
    return {
      valido: false,
      mensagem: 'Tipo de arquivo não permitido. Use PDF, JPEG, PNG ou DOC.'
    };
  }

  return { valido: true };
}

// ==================== OPERAÇÕES DE ARQUIVO ====================

export interface UploadArquivoResult {
  sucesso: boolean;
  arquivo?: {
    id: string;
    nome: string;
    url: string;
    tamanho?: number;
    tipo?: string;
  };
  mensagem?: string;
}

export async function processarUploadArquivo(
  file: File,
  pedidoId: string,
  itemId: number,
  observacao: string | undefined,
  pedidoService: any,
  onProgress?: (progress: number) => void
): Promise<UploadArquivoResult> {
  const formData = new FormData();
  formData.append('arquivo', file);
  formData.append('pedidoId', pedidoId);
  formData.append('itemId', itemId.toString());
  formData.append('observacao', observacao || '');

  return new Promise((resolve) => {
    let simulatedProgress: ReturnType<typeof setInterval> | undefined;

    if (onProgress) {
      let progress = 0;
      simulatedProgress = setInterval(() => {
        if (progress < 90) {
          progress += 10;
          onProgress(progress);
        }
      }, 300);
    }

    pedidoService.uploadArquivoChecklist(formData).subscribe({
      next: (response: any) => {
        // Limpa a simulação se existir
        if (simulatedProgress) {
          clearInterval(simulatedProgress);
        }

        // Garante que o progresso chegue a 100%
        if (onProgress) {
          onProgress(100);
        }

        resolve({
          sucesso: true,
          arquivo: {
            id: response.arquivoId,
            nome: response.nomeArquivo || file.name,
            url: response.url,
            tamanho: file.size,
            tipo: file.type
          }
        });
      },
      error: (err: any) => {
        console.error('Erro no upload:', err);

        // Limpa a simulação em caso de erro
        if (simulatedProgress) {
          clearInterval(simulatedProgress);
        }

        // Reseta o progresso em caso de erro
        if (onProgress) {
          onProgress(0);
        }

        resolve({
          sucesso: false,
          mensagem: 'Erro ao salvar arquivo'
        });
      }
    });
  });
}

export function removerArquivo(
  item: ChecklistItem,
  pedidoId: string,
  pedidoService: any
): Promise<{ sucesso: boolean; mensagem?: string }> {
  if (!item.arquivo?.id) {
    return Promise.resolve({ sucesso: false, mensagem: 'Arquivo não encontrado' });
  }

  return new Promise((resolve) => {
    pedidoService.deletarArquivoChecklist(pedidoId, item.id).subscribe({
      next: () => resolve({ sucesso: true }),
      error: (err: any) => {
        console.error('Erro ao remover:', err);
        resolve({ sucesso: false, mensagem: 'Erro ao remover arquivo' });
      }
    });
  });
}

export function carregarArquivo(
  item: ChecklistItem,
  pedidoId: string,
  pedidoService: any
): Promise<{ sucesso: boolean; arquivo?: any }> {
  return new Promise((resolve) => {
    pedidoService.getUrlArquivoChecklist(pedidoId, item.id).subscribe({
      next: (response: any) => {
        resolve({
          sucesso: true,
          arquivo: {
            id: response.arquivoId,
            nome: response.nomeArquivo,
            url: response.url,
            tamanho: response.tamanho,
            tipo: response.contentType
          }
        });
      },
      error: (err: any) => {
        console.error('Erro ao carregar arquivo:', err);
        resolve({ sucesso: false });
      }
    });
  });
}

// ==================== VALIDAÇÕES ====================

export function podeConcluirItem(item: ChecklistItem): { pode: boolean; mensagem?: string } {
  if (item.status === 'Concluído') {
    return { pode: false, mensagem: 'Item já está concluído' };
  }

  if (item.obrigatorio && !item.arquivo?.url && !item.arquivoSelecionado) {
    return {
      pode: false,
      mensagem: 'Selecione e salve o arquivo necessário antes de concluir'
    };
  }

  return { pode: true };
}

// ==================== ESTADO DO CHECKLIST ====================

export function toggleItemStatus(
  item: ChecklistItem,
  podeConcluir: boolean
): ChecklistItem {
  if (!podeConcluir) return item;

  return {
    ...item,
    status: 'Concluído',
    dataConclusao: new Date().toISOString()
  };
}

export function selecionarArquivoLocal(
  item: ChecklistItem,
  file: File
): ChecklistItem {
  return {
    ...item,
    arquivoSelecionado: file
  };
}

export function limparArquivoSelecionado(item: ChecklistItem): ChecklistItem {
  const novoItem = { ...item };
  delete novoItem.arquivoSelecionado;
  return novoItem;
}

export function atualizarArquivoSalvo(
  item: ChecklistItem,
  arquivo: { id: string; nome: string; url: string; tamanho?: number; tipo?: string }
): ChecklistItem {
  return {
    ...item,
    arquivo,
    arquivoSelecionado: undefined,
    salvando: false,
    status: 'Concluído'
  };
}

export function podeAvancarFase(itens: ChecklistItem[]): boolean {
  const obrigatoriosPendentes = itens.some(
    item => item.obrigatorio && item.status === 'Pendente'
  );
  return !obrigatoriosPendentes;
}
