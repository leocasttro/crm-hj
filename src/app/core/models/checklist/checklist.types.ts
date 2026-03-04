// ==================== ENUMS ====================
export type ChecklistItemStatus = 'Pendente' | 'Concluído';

export type ChecklistCategoria =
  | 'DOCUMENTOS_PACIENTE'
  | 'EXAMES'
  | 'AUTORIZACOES'
  | 'TERMOS'
  | 'OUTROS';

export type ChecklistPrioridade = 'BAIXA' | 'MEDIA' | 'ALTA';

// ==================== INTERFACE PRINCIPAL ====================
export interface ChecklistItem {
  id: number;
  titulo: string;
  status: ChecklistItemStatus;
  obrigatorio: boolean;

  // Metadados
  observacao?: string;
  dataConclusao?: string;

  // Categorização
  categoria?: ChecklistCategoria;
  prioridade?: ChecklistPrioridade;
  ordem?: number;                // Para ordenação personalizada

  // Dados do arquivo (salvo no servidor)
  arquivo?: {
    id?: string;                 // ID do arquivo no servidor
    nome: string;
    url: string;
    tamanho?: number;
    tipo?: string;
    dataUpload?: string;
  };

  // Estado local (não persistido - apenas para UI)
  arquivoSelecionado?: File;      // Arquivo selecionado localmente
  observacaoEditada?: boolean;    // Flag para controle de edição
  salvando?: boolean;             // Flag de upload em andamento
  expandido?: boolean;            // Para UI collapsible
  erro?: string;                  // Mensagem de erro local
}

// ==================== TIPOS AUXILIARES ====================

// Para listas agrupadas
export interface ChecklistGroup {
  categoria: ChecklistCategoria;
  titulo: string;
  itens: ChecklistItem[];
  expanded?: boolean;
}

// Para progresso
export interface ChecklistProgresso {
  total: number;
  concluidos: number;
  obrigatorios: {
    total: number;
    concluidos: number;
  };
  percentual: number;
}

// Para validação
export interface ChecklistValidation {
  isValid: boolean;
  itensPendentes: ChecklistItem[];
  mensagem?: string;
}

// Para estado global
export interface ChecklistState {
  itens: ChecklistItem[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  expandedGroups: string[];
}

// Para formulário
export interface ChecklistFormData {
  titulo: string;
  descricao?: string;
  categoria: ChecklistCategoria;
  prioridade: ChecklistPrioridade;
  obrigatorio: boolean;
  observacoes?: string;
}

// Para templates pré-definidos
export interface ChecklistTemplate {
  id: string;
  nome: string;
  descricao?: string;
  itens: Omit<ChecklistItem, 'id' | 'status' | 'dataConclusao'>[];
}
