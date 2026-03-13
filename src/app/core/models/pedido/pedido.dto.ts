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

  enderecoPaciente: string;
  // ==================== DADOS DO PACIENTE (campos diretos) ====================
  nomePaciente?: string;
  dataNascimento?: string;
  cpfPaciente?: string;
  emailPaciente?: string;
  telefonePaciente?: string;
  sexoPaciente?: string;

  // ==================== DADOS DA GUIA ====================
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

  // 🔥 NOVOS CAMPOS - CONSULTA PRÉ-OPERATÓRIA
  consultaPreDataHora?: string; // ISO string (data e hora da consulta)
  consultaPreDataFormatada?: string; // Data formatada (dd/MM/yyyy)
  consultaPreHoraFormatada?: string; // Hora formatada (HH:mm)
  consultaPreCuidados?: string; // Cuidados necessários
  consultaPreObservacoesEspeciais?: string; // Observações especiais
  temConsultaPreAgendada?: boolean; // Flag indicando se existe consulta agendada

  numeroGuia?: string;
  senhaAutorizacao?: string;
  statusAutorizacao?:
    | 'AUTORIZADO'
    | 'AUTORIZADO_PARCIAL'
    | 'PENDENTE'
    | 'NEGADO';
  validadeAutorizacao?: string; // ISO date
  tipoAcomodacao?: string;
  formaPagamento?: string;

  comprovanteUrl?: string; // URL do comprovante no servidor
  comprovanteNome?: string; // Nome original do arquivo
  comprovanteTamanho?: number; // Tamanho em bytes
  comprovanteTipo?: string; // MIME type do arquivo
  comprovanteDataUpload?: string; // Data de upload (ISO string)
  temComprovante?: boolean; // Flag indicando se existe comprovante

  hospital?: string;
  fornecedor?: string;
  agendamentoLocal?: string;
  riscoCirurgico?: string;
  termoConsentimentoUrl?: string;
  termoConsentimentoNome?: string;
  consultaPreLocal?: string;
  consultaPreMedico?: string;
  consultaPreMedicoCrm?: string;
}
