import {
  ChecklistItemStatus,
  ChecklistCategoria,
  ChecklistPrioridade
} from './checklist.types';

// DTO que vem do backend
export interface ChecklistItemDto {
  id: number;
  pedidoId: string;
  titulo: string;
  status: ChecklistItemStatus;
  obrigatorio: boolean;
  categoria?: ChecklistCategoria;
  prioridade?: ChecklistPrioridade;
  ordem?: number;

  // Arquivo
  arquivoId?: string;
  arquivoNome?: string;
  arquivoUrl?: string;
  arquivoTamanho?: number;
  arquivoTipo?: string;

  // Metadados
  observacao?: string;
  dataConclusao?: string;
  dataCriacao: string;
  dataAtualizacao?: string;

  // Usuário que concluiu
  concluidoPor?: string;
}

// Resposta da API
export interface ChecklistListResponse {
  items: ChecklistItemDto[];
  total: number;
  concluidos: number;
  progresso: number;
}

// Request para criar/atualizar
export interface ChecklistItemRequest {
  titulo: string;
  obrigatorio: boolean;
  categoria?: ChecklistCategoria;
  prioridade?: ChecklistPrioridade;
  ordem?: number;
  observacao?: string;
}

// Request para upload de arquivo
export interface ChecklistUploadRequest {
  arquivo: File;
  pedidoId: string;
  itemId: number;
  observacao?: string;
}

// Resposta do upload
export interface ChecklistUploadResponse {
  sucesso: boolean;
  url: string;
  nomeArquivo: string;
  arquivoId: string;
  mensagem?: string;
}

// Request para concluir item
export interface ConcluirItemRequest {
  observacao?: string;
  concluidoPor?: string;
}
