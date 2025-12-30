import { FasePedido } from "../types/fase-pedido";

export const FASES_PEDIDO_MOCK: FasePedido[] = [
  {
    codigo: 'CRIADO',
    nome: 'Criado',
    data: '2024-10-25',
    concluido: false,
  },
  {
    codigo: 'EM_ANALISE',
    nome: 'Em Análise',
    concluido: false,
  },
  {
    codigo: 'RETORNO_PEDIDO',
    nome: 'Retorno do Pedido',
    concluido: false,
  },
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
  {
    codigo: 'FATURAMENTO',
    nome: 'Faturamento',
    concluido: false,
  },
  {
    codigo: 'POS_OPERATORIO',
    nome: 'Pós-Operatório',
    concluido: false,
  },
  {
    codigo: 'FINALIZADO',
    nome: 'Finalizado',
    concluido: false,
  },
];
