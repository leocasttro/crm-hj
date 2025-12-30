export type CodigoFase =
  | 'CRIADO'
  | 'EM_ANALISE'
  | 'RETORNO_PEDIDO'
  | 'MARCACAO_CIRURGIA'
  | 'CONSULTA_PRE_OPERATORIA'
  | 'FATURAMENTO'
  | 'POS_OPERATORIO'
  | 'FINALIZADO';

export interface FasePedido {
  codigo: CodigoFase;   // Identificador técnico da fase
  nome: string;         // Texto exibido no UI
  data?: string;        // Quando a fase foi concluída
  concluido: boolean;   // Se a fase já foi finalizada
}
