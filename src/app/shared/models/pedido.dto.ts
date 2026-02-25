export interface PedidoDto {
  id: string;
  pacienteId: string;

  // ==================== STATUS E PRIORIDADE ====================
  status: string;
  prioridade: string;
  prioridadeJustificativa?: string;

  // ==================== DATAS ====================
  criadoEm: string; // ISO string
  atualizadoEm?: string; // ISO string
  dataPedido: string; // ISO date
  dataSolicitacao?: string; // ISO date
  agendadoPara?: string; // ISO string

  // ==================== PROCEDIMENTO ====================
  procedimento: string;
  procedimentoDescricao?: string;
  procedimentoCodigoTUSS?: string;
  procedimentoCodigo?: string;
  procedimentoCategoria?: string;

  // ==================== DADOS CLÍNICOS ====================
  indicacaoClinica?: string;
  relatorioPreOperatorio?: string;
  orientacoes?: string;

  // ==================== LATERALIDADE ====================
  lateralidade?: string;

  // ==================== CONVÊNIO ====================
  convenio: string;
  convenioNome?: string;
  convenioNumeroCarteira?: string;
  convenioValidadeCarteira?: string;
  convenioTipoPlano?: string;

  // ==================== NÚMERO CARTEIRA (alias) ====================
  numeroCarteira?: string;
  validadeCarteira?: string;

  // ==================== CID ====================
  cid?: string;
  cidCodigo?: string;
  cidDescricao?: string;

  // ==================== CIDs SECUNDÁRIOS ====================
  cidCodigo2?: string;
  cidCodigo3?: string;
  cidCodigo4?: string;

  // ==================== MÉDICO SOLICITANTE ====================
  medicoSolicitante: string;
  medicoSolicitanteNome?: string;
  medicoSolicitanteCrm?: string;
  medicoSolicitanteEspecialidade?: string;

  // Campos para compatibilidade
  medicoNome?: string;
  crmNumero?: string;
  crmUf?: string;
  crmCompleto?: string;
  cbo?: string;

  // ==================== MÉDICO EXECUTOR ====================
  medicoExecutorNome?: string;
  medicoExecutorCrm?: string;
  medicoExecutorEspecialidade?: string;

  // ==================== DADOS DO PACIENTE (embutidos) ====================
  paciente?: {
    id: string;
    nomeCompleto: string;
    primeiroNome?: string;
    sobrenome?: string;
    dataNascimento?: string;
    documentoNumero?: string;
    documentoTipo?: string;
    email?: string;
    sexo?: string;
    sexoDescricao?: string;
    telefones?: string;
  };

  // ==================== DADOS DO PACIENTE (campos diretos) ====================
  nomePaciente?: string;
  dataNascimento?: string;
  cpfPaciente?: string;
  emailPaciente?: string;
  telefonePaciente?: string;
  sexoPaciente?: string;

  // ==================== DADOS DA GUIA ====================
  numeroGuia?: string;
  registroAns?: string;
  numeroGuiaOperadora?: string;
  codigoOperadora?: string;
  nomeContratado?: string;

  // ==================== DADOS DA INTERNAÇÃO ====================
  caraterAtendimento?: string;
  tipoInternacao?: string;
  regimeInternacao?: string;
  qtdDiariasSolicitadas?: string;

  // ==================== DOCUMENTOS E OBSERVAÇÕES ====================
  temDocumentos?: boolean;
  documentosAnexados?: string[];
  observacoes?: string[];
  quantidadeObservacoes?: number;

  // ==================== AGENDAMENTO ====================
  agendamentoDataHora?: string;
  agendamentoSala?: string;
  agendamentoDuracaoEstimada?: number;
  agendamentoObservacoes?: string;

  // ==================== USUÁRIOS ====================
  usuarioCriacao?: string;
  usuarioAtualizacao?: string;
}
