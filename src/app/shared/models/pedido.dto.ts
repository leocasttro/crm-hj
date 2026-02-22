export interface PedidoDto {
  id: string;
  pacienteId: string;

  status: string;
  prioridade: string;
  prioridadeJustificativa?: string;

  criadoEm: string; // ISO string
  dataPedido: string; // ISO date
  agendadoPara?: string; // ISO string

  procedimento: string;
  procedimentoCodigo?: string;
  lateralidade?: string;

  convenio: string;
  convenioValidadeCarteira?: string;

  medicoSolicitante: string;
  medicoSolicitanteEspecialidade?: string;

  temDocumentos?: boolean;
  quantidadeObservacoes?: number;
}
