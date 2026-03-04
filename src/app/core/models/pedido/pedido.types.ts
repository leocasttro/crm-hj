import { PedidoDto } from "./pedido.dto";

// Enums para valores fixos (mais seguro que strings soltas)
export type PedidoStatus =
  | 'RASCUNHO'
  | 'PENDENTE'
  | 'EM_ANALISE'
  | 'REJEITADO'
  | 'APROVADO'
  | 'AGENDADO'
  | 'CONFIRMADO'
  | 'REALIZADO'
  | 'CANCELADO';

export type PedidoPrioridade = 'ELETIVA' | 'URGENCIA' | 'PRIORIDADE';

export interface FasePedido {
  codigo: CodigoFase;
  nome: string;
  data?: string;
  concluido: boolean;
  observacao?: string;
  usuario?: string;
}

export type CodigoFase =
  | 'CRIADO'
  | 'EM_ANALISE'
  | 'RETORNO_PEDIDO'
  | 'MARCACAO_CIRURGIA'
  | 'CONSULTA_PRE_OPERATORIA'
  | 'FATURAMENTO'
  | 'POS_OPERATORIO'
  | 'FINALIZADO';

// Tipos para estados locais
export interface PedidoState {
  loading: boolean;
  error: string | null;
  pedidos: PedidoDto[];
  selectedPedido: PedidoDto | null;
}
