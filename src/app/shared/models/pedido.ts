export interface Pedido {
  id: number;

  // Resumo
  titulo: string;
  descricao: string;

  // Dados pessoais
  nomeCompleto: string;
  dataNascimento: string;
  cpf: string;
  sexo: 'M' | 'F' | 'O';

  // Contato
  endereco: string;
  telefone1: string;
  telefone2?: string;
  email: string;

  // Convênio
  convenio: string;
  numeroCarteirinha: string;
  validadeCarteirinha: string;

  // Dados médicos
  medicoSolicitante: string;
  crmMedico: string;
  procedimento: string;
  cid: string;
  prioridade: 'ELETIVA' | 'URGENCIA' | 'PRIORIDADE';
  dataPedido: string;

  // 📎 Documentos obrigatórios
  documentos: {
    pedidoMedico: boolean;
    exames: boolean;
    documentoIdentidade: boolean;
    carteirinhaConvenio: boolean;
  };

  // Auditoria
  criadoPor: string;
}
